import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, 
  CreditCard, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Loader2,
  Eye,
  Lock,
  Activity,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import { PaymentSecurityService, PaymentTransaction, PaymentStatus, RiskLevel } from '../services/PaymentSecurityService';

interface PaymentTrackerProps {
  userId?: string;
  showAllTransactions?: boolean;
  autoRefresh?: boolean;
}

const PaymentTracker: React.FC<PaymentTrackerProps> = ({
  userId,
  showAllTransactions = false,
  autoRefresh = true
}) => {
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState<PaymentTransaction | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    successful: 0,
    failed: 0,
    pending: 0,
    totalAmount: 0,
    avgAmount: 0
  });
  const { toast } = useToast();

  // Real-time subscription to payment updates
  useEffect(() => {
    if (!autoRefresh) return;

    const unsubscribe = PaymentSecurityService.subscribe((transaction) => {
      if (!showAllTransactions && userId && transaction.userId !== userId) {
        return;
      }

      setTransactions(prev => {
        const existing = prev.findIndex(t => t.id === transaction.id);
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = transaction;
          return updated;
        } else {
          return [transaction, ...prev];
        }
      });

      // Show toast notification for important updates
      if (transaction.status === PaymentStatus.COMPLETED) {
        toast({
          title: '✅ Payment Successful',
          description: `Payment of ₹${transaction.amount} completed`,
          duration: 3000
        });
      } else if (transaction.status === PaymentStatus.FAILED) {
        toast({
          title: '❌ Payment Failed',
          description: `Payment of ₹${transaction.amount} failed`,
          variant: 'destructive',
          duration: 5000
        });
      } else if (transaction.riskLevel === RiskLevel.HIGH || transaction.riskLevel === RiskLevel.CRITICAL) {
        toast({
          title: '🚨 High-Risk Transaction',
          description: `Transaction flagged as ${transaction.riskLevel} risk`,
          variant: 'destructive',
          duration: 5000
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, [autoRefresh, showAllTransactions, userId, toast]);

  // Load initial transactions
  useEffect(() => {
    loadTransactions();
  }, [userId, showAllTransactions]);

  // Calculate statistics
  useEffect(() => {
    const newStats = {
      total: transactions.length,
      successful: transactions.filter(t => t.status === PaymentStatus.COMPLETED).length,
      failed: transactions.filter(t => t.status === PaymentStatus.FAILED).length,
      pending: transactions.filter(t => t.status === PaymentStatus.PENDING || t.status === PaymentStatus.PROCESSING).length,
      totalAmount: transactions.reduce((sum, t) => sum + (t.status === PaymentStatus.COMPLETED ? t.amount : 0), 0),
      avgAmount: 0
    };
    
    if (newStats.successful > 0) {
      newStats.avgAmount = newStats.totalAmount / newStats.successful;
    }
    
    setStats(newStats);
  }, [transactions]);

  const loadTransactions = useCallback(() => {
    setIsLoading(true);
    try {
      let userTransactions: PaymentTransaction[] = [];
      
      if (showAllTransactions) {
        // In a real implementation, this would fetch from a centralized store
        userTransactions = [];
      } else if (userId) {
        userTransactions = PaymentSecurityService.getUserTransactions(userId);
      }
      
      setTransactions(userTransactions);
    } catch (error) {
      console.error('Error loading transactions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load transactions',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [userId, showAllTransactions, toast]);

  const getStatusIcon = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.COMPLETED:
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case PaymentStatus.FAILED:
        return <XCircle className="h-4 w-4 text-red-600" />;
      case PaymentStatus.PENDING:
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case PaymentStatus.PROCESSING:
        return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.COMPLETED:
        return 'bg-green-100 text-green-800 border-green-200';
      case PaymentStatus.FAILED:
        return 'bg-red-100 text-red-800 border-red-200';
      case PaymentStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case PaymentStatus.PROCESSING:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiskLevelColor = (riskLevel: RiskLevel) => {
    switch (riskLevel) {
      case RiskLevel.LOW:
        return 'bg-green-100 text-green-800';
      case RiskLevel.MEDIUM:
        return 'bg-yellow-100 text-yellow-800';
      case RiskLevel.HIGH:
        return 'bg-orange-100 text-orange-800';
      case RiskLevel.CRITICAL:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getFraudScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  if (!autoRefresh && isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="ml-2 text-gray-600">Loading payment data...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.total > 0 ? Math.round((stats.successful / stats.total) * 100) : 0}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold text-gray-900">₹{stats.totalAmount.toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Payment Transactions
              {autoRefresh && <Badge variant="outline" className="ml-2">Live</Badge>}
            </CardTitle>
            {!autoRefresh && (
              <Button onClick={loadTransactions} disabled={isLoading} size="sm">
                <Activity className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-96">
            {transactions.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No payment transactions found</p>
                <p className="text-sm mt-1">Transactions will appear here as they are processed</p>
              </div>
            ) : (
              <div className="space-y-0">
                {transactions.map((transaction, index) => (
                  <div key={transaction.id}>
                    <div 
                      className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => setSelectedTransaction(transaction)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {getStatusIcon(transaction.status)}
                            <span className="font-medium text-gray-900">
                              ₹{transaction.amount.toFixed(2)}
                            </span>
                            <Badge className={getStatusColor(transaction.status)}>
                              {transaction.status}
                            </Badge>
                            <Badge className={getRiskLevelColor(transaction.riskLevel)}>
                              {transaction.riskLevel} risk
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>Order #{transaction.orderId}</span>
                            <span>{transaction.paymentMethod}</span>
                            <span>{formatTime(transaction.createdAt)}</span>
                          </div>
                          
                          {/* Fraud Score */}
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-gray-500">Security Score:</span>
                            <div className="flex items-center gap-1">
                              <Progress 
                                value={transaction.fraudScore} 
                                className="w-16 h-2"
                              />
                              <span className={`text-xs font-medium ${getFraudScoreColor(transaction.fraudScore)}`}>
                                {transaction.fraudScore}/100
                              </span>
                            </div>
                          </div>
                          
                          {/* Security Checks */}
                          {transaction.securityChecks.length > 0 && (
                            <div className="flex items-center gap-1 mt-2">
                              {transaction.securityChecks.map((check, idx) => (
                                <Badge 
                                  key={idx}
                                  variant={check.status === 'passed' ? 'outline' : check.status === 'warning' ? 'secondary' : 'destructive'}
                                  className="text-xs"
                                >
                                  {check.type}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {transaction.riskLevel === RiskLevel.HIGH || transaction.riskLevel === RiskLevel.CRITICAL ? (
                            <AlertTriangle className="h-4 w-4 text-orange-500" />
                          ) : null}
                          <Eye className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    </div>
                    {index < transactions.length - 1 && <Separator />}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Transaction Details
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setSelectedTransaction(null)}
              >
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Transaction Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transaction ID:</span>
                    <span className="font-mono">{selectedTransaction.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order ID:</span>
                    <span>{selectedTransaction.orderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-medium">₹{selectedTransaction.amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <Badge className={getStatusColor(selectedTransaction.status)}>
                      {selectedTransaction.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Risk Level:</span>
                    <Badge className={getRiskLevelColor(selectedTransaction.riskLevel)}>
                      {selectedTransaction.riskLevel}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method:</span>
                    <span>{selectedTransaction.paymentMethod}</span>
                  </div>
                </div>
              </div>

              {/* Security Info */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Security Analysis</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Fraud Score:</span>
                    <div className="flex items-center gap-2">
                      <Progress value={selectedTransaction.fraudScore} className="w-20 h-2" />
                      <span className={`font-medium ${getFraudScoreColor(selectedTransaction.fraudScore)}`}>
                        {selectedTransaction.fraudScore}/100
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">IP Address:</span>
                    <span className="font-mono">{selectedTransaction.ipAddress}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Device:</span>
                    <span className="text-xs">{selectedTransaction.deviceFingerprint}</span>
                  </div>
                </div>

                {/* Security Checks */}
                <div className="space-y-2">
                  <span className="text-sm font-medium text-gray-900">Security Checks:</span>
                  <div className="space-y-1">
                    {selectedTransaction.securityChecks.map((check, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">{check.type}:</span>
                        <Badge 
                          variant={check.status === 'passed' ? 'outline' : check.status === 'warning' ? 'secondary' : 'destructive'}
                          className="text-xs"
                        >
                          {check.status} ({check.score > 0 ? '+' : ''}{check.score})
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Timestamps */}
            <div className="mt-6 pt-4 border-t">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Created:</span>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(selectedTransaction.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Updated:</span>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(selectedTransaction.updatedAt).toLocaleString()}
                  </p>
                </div>
                {selectedTransaction.processedAt && (
                  <div>
                    <span className="text-gray-600">Processed:</span>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(selectedTransaction.processedAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PaymentTracker;
