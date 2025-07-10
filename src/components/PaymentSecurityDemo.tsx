import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import {
  Shield,
  CreditCard,
  Activity,
  Users,
  Lock,
  AlertTriangle,
  CheckCircle,
  Play,
  Pause,
  RotateCcw,
  Settings
} from 'lucide-react';

// Import our payment components
import SecurePaymentForm from './SecurePaymentForm';
import PaymentTracker from './PaymentTracker';
import { PaymentSecurityService, PaymentStatus, RiskLevel } from '../services/PaymentSecurityService';

interface DemoStats {
  totalTransactions: number;
  successfulPayments: number;
  failedPayments: number;
  averageSecurityScore: number;
  highRiskTransactions: number;
  totalAmount: number;
}

const PaymentSecurityDemo: React.FC = () => {
  const [isSystemActive, setIsSystemActive] = useState(false);
  const [currentUserId, setCurrentUserId] = useState('demo-user-001');
  const [showAdminView, setShowAdminView] = useState(false);
  const [demoStats, setDemoStats] = useState<DemoStats>({
    totalTransactions: 0,
    successfulPayments: 0,
    failedPayments: 0,
    averageSecurityScore: 0,
    highRiskTransactions: 0,
    totalAmount: 0
  });
  const [recentActivity, setRecentActivity] = useState<string[]>([]);
  const { toast } = useToast();

  // Initialize the payment security system
  useEffect(() => {
    if (!isSystemActive) return;

    try {
      PaymentSecurityService.initialize();
      
      // Subscribe to payment updates for demo statistics
      const unsubscribe = PaymentSecurityService.subscribe((transaction) => {
        updateDemoStats(transaction);
        addActivityLog(`Transaction ${transaction.id.slice(-8)} updated: ${transaction.status}`);
      });

      addActivityLog('Payment Security System initialized successfully');
      toast({
        title: '🔐 Security System Active',
        description: 'Payment security monitoring is now active',
        duration: 3000
      });

      return () => {
        unsubscribe();
      };
    } catch (error) {
      console.error('Error initializing payment security system:', error);
      toast({
        title: 'System Error',
        description: 'Failed to initialize payment security system',
        variant: 'destructive'
      });
    }
  }, [isSystemActive, toast]);

  const updateDemoStats = (transaction: any) => {
    setDemoStats(prev => {
      const userTransactions = PaymentSecurityService.getUserTransactions(currentUserId);
      const successful = userTransactions.filter(t => t.status === PaymentStatus.COMPLETED);
      const failed = userTransactions.filter(t => t.status === PaymentStatus.FAILED);
      const highRisk = userTransactions.filter(t => 
        t.riskLevel === RiskLevel.HIGH || t.riskLevel === RiskLevel.CRITICAL
      );

      const totalAmount = successful.reduce((sum, t) => sum + t.amount, 0);
      const avgScore = userTransactions.length > 0 
        ? userTransactions.reduce((sum, t) => sum + t.fraudScore, 0) / userTransactions.length 
        : 0;

      return {
        totalTransactions: userTransactions.length,
        successfulPayments: successful.length,
        failedPayments: failed.length,
        averageSecurityScore: Math.round(avgScore),
        highRiskTransactions: highRisk.length,
        totalAmount
      };
    });
  };

  const addActivityLog = (activity: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setRecentActivity(prev => 
      [`${timestamp}: ${activity}`, ...prev.slice(0, 9)]
    );
  };

  const handlePaymentSuccess = (transactionId: string) => {
    addActivityLog(`Payment successful: ${transactionId.slice(-8)}`);
    toast({
      title: '✅ Demo Payment Complete',
      description: 'Payment processed successfully with full security validation',
      duration: 5000
    });
  };

  const handlePaymentFailure = (error: string) => {
    addActivityLog(`Payment failed: ${error}`);
    toast({
      title: '❌ Demo Payment Failed',
      description: error,
      variant: 'destructive',
      duration: 5000
    });
  };

  const handleTransactionUpdate = (transactionId: string, status: PaymentStatus) => {
    addActivityLog(`Transaction ${transactionId.slice(-8)} status: ${status}`);
  };

  const resetDemo = () => {
    setDemoStats({
      totalTransactions: 0,
      successfulPayments: 0,
      failedPayments: 0,
      averageSecurityScore: 0,
      highRiskTransactions: 0,
      totalAmount: 0
    });
    setRecentActivity([]);
    addActivityLog('Demo reset - all data cleared');
    toast({
      title: '🔄 Demo Reset',
      description: 'All demo data has been cleared',
      duration: 3000
    });
  };

  const generateTestTransaction = async () => {
    const testAmounts = [100, 500, 1500, 5000, 15000, 25000];
    const randomAmount = testAmounts[Math.floor(Math.random() * testAmounts.length)];
    
    try {
      // Simulate a test transaction
      const testData = {
        userId: currentUserId,
        amount: randomAmount,
        currency: 'INR',
        orderId: `TEST-${Date.now()}`,
        paymentMethod: 'credit_card',
        deviceFingerprint: 'test-device-' + Math.random().toString(36).substr(2, 9),
        ipAddress: '192.168.1.' + Math.floor(Math.random() * 255),
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      };

      const transaction = await PaymentSecurityService.createSecureTransaction(testData, {
        userId: currentUserId,
        deviceFingerprint: testData.deviceFingerprint,
        ipAddress: testData.ipAddress,
        userAgent: testData.userAgent
      });

      // Simulate processing
      setTimeout(async () => {
        const success = Math.random() > 0.2; // 80% success rate
        await PaymentSecurityService.processPayment(transaction.id, {
          status: success ? 'success' : 'failed',
          transactionId: 'gw_' + Math.random().toString(36).substr(2, 9),
          amount: randomAmount,
          currency: 'INR',
          orderId: testData.orderId,
          error: success ? null : 'Simulated payment failure'
        });
      }, 2000);

      addActivityLog(`Generated test transaction: ₹${randomAmount}`);
    } catch (error) {
      console.error('Error generating test transaction:', error);
      addActivityLog(`Failed to generate test transaction: ${error}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-blue-600" />
              Payment Security System Demo
              {isSystemActive && <Badge className="bg-green-100 text-green-800">Live</Badge>}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant={isSystemActive ? "destructive" : "default"}
                onClick={() => setIsSystemActive(!isSystemActive)}
                className="flex items-center gap-2"
              >
                {isSystemActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {isSystemActive ? 'Stop System' : 'Start System'}
              </Button>
              <Button
                variant="outline"
                onClick={resetDemo}
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Reset Demo
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Activity className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-800">{demoStats.totalTransactions}</p>
              <p className="text-sm text-blue-600">Total Transactions</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-800">{demoStats.successfulPayments}</p>
              <p className="text-sm text-green-600">Successful Payments</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Lock className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-purple-800">{demoStats.averageSecurityScore}</p>
              <p className="text-sm text-purple-600">Avg Security Score</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <AlertTriangle className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-orange-800">{demoStats.highRiskTransactions}</p>
              <p className="text-sm text-orange-600">High Risk Detected</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {!isSystemActive && (
        <Alert>
          <Settings className="h-4 w-4" />
          <AlertDescription>
            Click "Start System" to activate the payment security monitoring and begin the demo.
            This will initialize fraud detection, real-time tracking, and security validation.
          </AlertDescription>
        </Alert>
      )}

      {isSystemActive && (
        <Tabs defaultValue="payment-form" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="payment-form" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Payment Form
            </TabsTrigger>
            <TabsTrigger value="live-tracking" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Live Tracking
            </TabsTrigger>
            <TabsTrigger value="admin-view" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Admin View
            </TabsTrigger>
            <TabsTrigger value="system-logs" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              System Logs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="payment-form" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Secure Payment Form</h3>
                <SecurePaymentForm
                  userId={currentUserId}
                  onPaymentSuccess={handlePaymentSuccess}
                  onPaymentFailure={handlePaymentFailure}
                  onTransactionUpdate={handleTransactionUpdate}
                  defaultAmount={1000}
                  enableRealTimeValidation={true}
                />
              </div>
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Demo Controls</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      onClick={generateTestTransaction}
                      className="w-full"
                      variant="outline"
                    >
                      Generate Test Transaction
                    </Button>
                    <div className="text-sm text-gray-600">
                      <p><strong>Demo Features:</strong></p>
                      <ul className="list-disc list-inside space-y-1 mt-2">
                        <li>Real-time security scoring</li>
                        <li>Fraud detection algorithms</li>
                        <li>PCI compliance validation</li>
                        <li>Risk-based notifications</li>
                        <li>Device fingerprinting</li>
                        <li>Rate limiting protection</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="live-tracking" className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Real-time Payment Tracking</h3>
              <PaymentTracker
                userId={currentUserId}
                showAllTransactions={false}
                autoRefresh={true}
              />
            </div>
          </TabsContent>

          <TabsContent value="admin-view" className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Administrator Dashboard</h3>
              <PaymentTracker
                showAllTransactions={true}
                autoRefresh={true}
              />
            </div>
          </TabsContent>

          <TabsContent value="system-logs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Real-time Activity Log</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 rounded-lg p-4 h-64 overflow-y-auto">
                  {recentActivity.length === 0 ? (
                    <p className="text-gray-500 text-sm">No activity yet. Start making payments to see logs.</p>
                  ) : (
                    <div className="space-y-1">
                      {recentActivity.map((activity, index) => (
                        <div key={index} className="text-sm font-mono text-gray-700">
                          {activity}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security Features Active</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">End-to-End Encryption</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">PCI DSS Compliance</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Fraud Detection</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Real-time Monitoring</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Risk Assessment</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Rate Limiting</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default PaymentSecurityDemo;
