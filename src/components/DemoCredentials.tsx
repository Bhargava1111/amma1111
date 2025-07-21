import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Copy, CheckCircle, CreditCard, User, Mail, Phone } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface DemoCredentialsProps {
  isOpen: boolean;
  onClose: () => void;
}

const DemoCredentials: React.FC<DemoCredentialsProps> = ({ isOpen, onClose }) => {
  const [copiedField, setCopiedField] = React.useState<string | null>(null);

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      toast({
        title: "Copied!",
        description: `${fieldName} copied to clipboard`,
      });
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive"
      });
    }
  };

  const demoData = {
    users: [
      {
        name: "Admin User",
        email: "admin@example.com",
        password: "admin123",
        role: "admin"
      },
      {
        name: "Demo Customer",
        email: "customer@example.com", 
        password: "customer123",
        role: "customer"
      },
      {
        name: "Test User",
        email: "test@example.com",
        password: "test123",
        role: "customer"
      }
    ],
    razorpay: {
      testCards: [
        {
          number: "4111 1111 1111 1111",
          cvv: "123",
          expiry: "12/25",
          name: "Test Card 1"
        },
        {
          number: "5555 5555 5555 4444",
          cvv: "123", 
          expiry: "12/25",
          name: "Test Card 2"
        },
        {
          number: "4000 0000 0000 0002",
          cvv: "123",
          expiry: "12/25", 
          name: "Test Card 3"
        }
      ],
      testUPI: "success@razorpay",
      testNetbanking: "HDFC"
    },
    features: [
      "Email notifications (demo mode)",
      "Payment processing (demo mode)", 
      "Order tracking",
      "Admin dashboard",
      "Notification center",
      "Invoice generation",
      "WhatsApp notifications (demo mode)"
    ]
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Demo Credentials & Test Data
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* User Accounts */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <User className="h-4 w-4" />
              User Accounts
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {demoData.users.map((user, index) => (
                <Card key={index} className="border-2">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'}>
                        {user.role}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Name</p>
                        <p className="text-sm">{user.name}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Email</p>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-mono">{user.email}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(user.email, 'Email')}
                            className="h-6 w-6 p-0"
                          >
                            {copiedField === 'Email' ? <CheckCircle className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                          </Button>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Password</p>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-mono">{user.password}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(user.password, 'Password')}
                            className="h-6 w-6 p-0"
                          >
                            {copiedField === 'Password' ? <CheckCircle className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Separator />

          {/* Razorpay Test Data */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Razorpay Test Cards
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {demoData.razorpay.testCards.map((card, index) => (
                <Card key={index} className="border-2 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="text-blue-600">
                        {card.name}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Card Number</p>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-mono">{card.number}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(card.number.replace(/\s/g, ''), 'Card Number')}
                            className="h-6 w-6 p-0"
                          >
                            {copiedField === 'Card Number' ? <CheckCircle className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-sm font-medium text-gray-600">CVV</p>
                          <p className="text-sm font-mono">{card.cvv}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Expiry</p>
                          <p className="text-sm font-mono">{card.expiry}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-2 border-green-200">
                <CardContent className="p-4">
                  <h4 className="font-medium mb-2">Test UPI</h4>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-mono">{demoData.razorpay.testUPI}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(demoData.razorpay.testUPI, 'UPI')}
                      className="h-6 w-6 p-0"
                    >
                      {copiedField === 'UPI' ? <CheckCircle className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-2 border-purple-200">
                <CardContent className="p-4">
                  <h4 className="font-medium mb-2">Test Netbanking</h4>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-mono">{demoData.razorpay.testNetbanking}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(demoData.razorpay.testNetbanking, 'Netbanking')}
                      className="h-6 w-6 p-0"
                    >
                      {copiedField === 'Netbanking' ? <CheckCircle className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <Separator />

          {/* Demo Features */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Demo Features
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {demoData.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Important Notes */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-800 mb-2">Important Notes:</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• This is a demo application - all payments are simulated</li>
              <li>• Email notifications are sent in demo mode</li>
              <li>• Orders are created with tracking numbers for testing</li>
              <li>• Admin dashboard is fully functional for order management</li>
              <li>• All data is stored locally and will reset on page refresh</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DemoCredentials; 