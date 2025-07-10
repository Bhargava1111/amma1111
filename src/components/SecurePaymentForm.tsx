import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  Shield,
  CreditCard,
  Lock,
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  Zap,
  Globe,
  User,
  Calendar,
  Hash
} from 'lucide-react';
import { PaymentSecurityService, PaymentStatus, RiskLevel, PaymentMethod } from '../services/PaymentSecurityService';

interface PaymentFormData {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
  amount: number;
  currency: string;
  orderId: string;
  billingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

interface SecurityValidation {
  isValid: boolean;
  message: string;
  type: 'success' | 'warning' | 'error';
  score: number;
}

interface SecurePaymentFormProps {
  userId: string;
  onPaymentSuccess?: (transactionId: string) => void;
  onPaymentFailure?: (error: string) => void;
  onTransactionUpdate?: (transactionId: string, status: PaymentStatus) => void;
  defaultAmount?: number;
  defaultOrderId?: string;
  enableRealTimeValidation?: boolean;
}

const SecurePaymentForm: React.FC<SecurePaymentFormProps> = ({
  userId,
  onPaymentSuccess,
  onPaymentFailure,
  onTransactionUpdate,
  defaultAmount = 0,
  defaultOrderId = '',
  enableRealTimeValidation = true
}) => {
  const [formData, setFormData] = useState<PaymentFormData>({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    amount: defaultAmount,
    currency: 'INR',
    orderId: defaultOrderId || `ORDER-${Date.now()}`,
    billingAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India'
    }
  });

  const [validation, setValidation] = useState<Record<string, SecurityValidation>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCvv, setShowCvv] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [securityScore, setSecurityScore] = useState(0);
  const [riskLevel, setRiskLevel] = useState<RiskLevel>(RiskLevel.LOW);
  const [deviceFingerprint, setDeviceFingerprint] = useState<string>('');
  const [ipAddress, setIpAddress] = useState<string>('');
  const { toast } = useToast();

  // Generate device fingerprint on component mount
  useEffect(() => {
    const generateDeviceFingerprint = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      ctx?.fillText('Device fingerprint', 10, 50);
      
      const fingerprint = btoa(JSON.stringify({
        userAgent: navigator.userAgent,
        screen: `${screen.width}x${screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language,
        platform: navigator.platform,
        canvas: canvas.toDataURL(),
        timestamp: Date.now()
      }));
      
      setDeviceFingerprint(fingerprint);
    };

    const getIpAddress = async () => {
      try {
        // In a real implementation, this would be handled by the backend
        setIpAddress('192.168.1.100');
      } catch (error) {
        console.error('Error getting IP address:', error);
        setIpAddress('unknown');
      }
    };

    generateDeviceFingerprint();
    getIpAddress();
  }, []);

  // Real-time validation
  useEffect(() => {
    if (!enableRealTimeValidation) return;

    const validateForm = () => {
      const newValidation: Record<string, SecurityValidation> = {};

      // Card number validation
      if (formData.cardNumber) {
        const cardNumberOnly = formData.cardNumber.replace(/\s/g, '');
        const isValidCard = /^[0-9]{13,19}$/.test(cardNumberOnly);
        const cardType = detectCardType(cardNumberOnly);
        
        newValidation.cardNumber = {
          isValid: isValidCard && cardType !== 'unknown',
          message: isValidCard ? `Valid ${cardType} card` : 'Invalid card number',
          type: isValidCard ? 'success' : 'error',
          score: isValidCard ? 25 : 0
        };

        if (isValidCard && cardType !== 'unknown') {
          setPaymentMethod(cardType as PaymentMethod);
        }
      }

      // Expiry date validation
      if (formData.expiryDate) {
        const [month, year] = formData.expiryDate.split('/');
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear() % 100;
        const currentMonth = currentDate.getMonth() + 1;
        const expiryYear = parseInt(year);
        const expiryMonth = parseInt(month);

        const isValidExpiry = 
          month && year &&
          expiryMonth >= 1 && expiryMonth <= 12 &&
          (expiryYear > currentYear || (expiryYear === currentYear && expiryMonth >= currentMonth));

        newValidation.expiryDate = {
          isValid: isValidExpiry,
          message: isValidExpiry ? 'Valid expiry date' : 'Invalid or expired date',
          type: isValidExpiry ? 'success' : 'error',
          score: isValidExpiry ? 20 : 0
        };
      }

      // CVV validation
      if (formData.cvv) {
        const isValidCvv = /^[0-9]{3,4}$/.test(formData.cvv);
        newValidation.cvv = {
          isValid: isValidCvv,
          message: isValidCvv ? 'Valid CVV' : 'Invalid CVV',
          type: isValidCvv ? 'success' : 'error',
          score: isValidCvv ? 15 : 0
        };
      }

      // Cardholder name validation
      if (formData.cardholderName) {
        const isValidName = /^[a-zA-Z\s]{2,50}$/.test(formData.cardholderName);
        newValidation.cardholderName = {
          isValid: isValidName,
          message: isValidName ? 'Valid cardholder name' : 'Invalid name format',
          type: isValidName ? 'success' : 'error',
          score: isValidName ? 10 : 0
        };
      }

      // Amount validation
      if (formData.amount) {
        const isValidAmount = formData.amount > 0 && formData.amount <= 100000;
        newValidation.amount = {
          isValid: isValidAmount,
          message: isValidAmount ? 'Valid amount' : 'Amount must be between ₹1 and ₹100,000',
          type: isValidAmount ? 'success' : 'error',
          score: isValidAmount ? 10 : 0
        };
      }

      // Address validation
      const isValidAddress = 
        formData.billingAddress.street.length > 0 &&
        formData.billingAddress.city.length > 0 &&
        formData.billingAddress.zipCode.length > 0;

      newValidation.address = {
        isValid: isValidAddress,
        message: isValidAddress ? 'Valid billing address' : 'Complete billing address required',
        type: isValidAddress ? 'success' : 'warning',
        score: isValidAddress ? 20 : 0
      };

      setValidation(newValidation);

      // Calculate overall security score
      const totalScore = Object.values(newValidation).reduce((sum, val) => sum + val.score, 0);
      setSecurityScore(totalScore);

      // Determine risk level
      if (totalScore >= 90) setRiskLevel(RiskLevel.LOW);
      else if (totalScore >= 70) setRiskLevel(RiskLevel.MEDIUM);
      else if (totalScore >= 50) setRiskLevel(RiskLevel.HIGH);
      else setRiskLevel(RiskLevel.CRITICAL);
    };

    validateForm();
  }, [formData, enableRealTimeValidation]);

  const detectCardType = (cardNumber: string): string => {
    const patterns = {
      'Visa': /^4[0-9]{12}(?:[0-9]{3})?$/,
      'Mastercard': /^5[1-5][0-9]{14}$/,
      'American Express': /^3[47][0-9]{13}$/,
      'Discover': /^6(?:011|5[0-9]{2})[0-9]{12}$/,
      'RuPay': /^6[0-9]{15}$/
    };

    for (const [type, pattern] of Object.entries(patterns)) {
      if (pattern.test(cardNumber)) {
        return type;
      }
    }
    return 'unknown';
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\D/g, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => {
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        return {
          ...prev,
          [parent]: {
            ...prev[parent as keyof PaymentFormData],
            [child]: value
          }
        };
      }
      
      let formattedValue = value;
      if (field === 'cardNumber') {
        formattedValue = formatCardNumber(value);
      } else if (field === 'expiryDate') {
        formattedValue = formatExpiryDate(value);
      } else if (field === 'cvv') {
        formattedValue = value.replace(/\D/g, '').substring(0, 4);
      } else if (field === 'amount') {
        formattedValue = value.replace(/[^\d.]/g, '');
      }
      
      return {
        ...prev,
        [field]: field === 'amount' ? parseFloat(formattedValue) || 0 : formattedValue
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isProcessing) return;
    
    // Validate all required fields
    const requiredFields = ['cardNumber', 'expiryDate', 'cvv', 'cardholderName', 'amount'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof PaymentFormData]);
    
    if (missingFields.length > 0) {
      toast({
        title: 'Missing Information',
        description: `Please complete: ${missingFields.join(', ')}`,
        variant: 'destructive'
      });
      return;
    }

    if (securityScore < 50) {
      toast({
        title: 'Security Check Failed',
        description: 'Please ensure all payment information is valid',
        variant: 'destructive'
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Create payment transaction
      const transactionData = {
        userId,
        amount: formData.amount,
        currency: formData.currency,
        orderId: formData.orderId,
        paymentMethod: paymentMethod || PaymentMethod.CREDIT_CARD,
        cardDetails: {
          last4: formData.cardNumber.slice(-4),
          brand: detectCardType(formData.cardNumber.replace(/\s/g, '')),
          expiryMonth: formData.expiryDate.split('/')[0],
          expiryYear: formData.expiryDate.split('/')[1]
        },
        billingAddress: formData.billingAddress,
        deviceFingerprint,
        ipAddress,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      };

      const transaction = await PaymentSecurityService.processPayment(transactionData);

      // Subscribe to transaction updates
      const unsubscribe = PaymentSecurityService.subscribe((updatedTransaction) => {
        if (updatedTransaction.id === transaction.id) {
          onTransactionUpdate?.(transaction.id, updatedTransaction.status);
          
          if (updatedTransaction.status === PaymentStatus.COMPLETED) {
            toast({
              title: '✅ Payment Successful',
              description: `Payment of ₹${formData.amount} completed successfully`,
              duration: 5000
            });
            onPaymentSuccess?.(transaction.id);
            unsubscribe();
          } else if (updatedTransaction.status === PaymentStatus.FAILED) {
            toast({
              title: '❌ Payment Failed',
              description: updatedTransaction.failureReason || 'Payment processing failed',
              variant: 'destructive',
              duration: 5000
            });
            onPaymentFailure?.(updatedTransaction.failureReason || 'Payment failed');
            unsubscribe();
          }
        }
      });

      // Show initial success message
      toast({
        title: '🔄 Processing Payment',
        description: 'Your payment is being processed securely',
        duration: 3000
      });

    } catch (error) {
      console.error('Payment processing error:', error);
      toast({
        title: 'Payment Error',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: 'destructive'
      });
      onPaymentFailure?.(error instanceof Error ? error.message : 'Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const getSecurityBadgeColor = () => {
    if (securityScore >= 90) return 'bg-green-100 text-green-800';
    if (securityScore >= 70) return 'bg-yellow-100 text-yellow-800';
    if (securityScore >= 50) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  const getSecurityIcon = () => {
    if (securityScore >= 90) return <ShieldCheck className="h-4 w-4 text-green-600" />;
    if (securityScore >= 70) return <Shield className="h-4 w-4 text-yellow-600" />;
    if (securityScore >= 50) return <AlertTriangle className="h-4 w-4 text-orange-600" />;
    return <AlertTriangle className="h-4 w-4 text-red-600" />;
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Security Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Security Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getSecurityIcon()}
              <span className="text-sm font-medium">Security Score: {securityScore}/100</span>
            </div>
            <Badge className={getSecurityBadgeColor()}>
              {riskLevel} Risk
            </Badge>
          </div>
          <div className="mt-2 text-xs text-gray-600">
            <div className="flex items-center gap-4">
              <span>🔒 PCI DSS Compliant</span>
              <span>🛡️ Fraud Protection</span>
              <span>🔐 End-to-End Encryption</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Card Number */}
            <div className="space-y-2">
              <Label htmlFor="cardNumber" className="flex items-center gap-2">
                <Hash className="h-4 w-4" />
                Card Number
              </Label>
              <div className="relative">
                <Input
                  id="cardNumber"
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  value={formData.cardNumber}
                  onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                  maxLength={19}
                  className={`pr-10 ${validation.cardNumber?.isValid ? 'border-green-500' : validation.cardNumber?.isValid === false ? 'border-red-500' : ''}`}
                />
                {validation.cardNumber?.isValid && (
                  <CheckCircle className="absolute right-3 top-2.5 h-4 w-4 text-green-500" />
                )}
              </div>
              {validation.cardNumber && (
                <p className={`text-xs ${validation.cardNumber.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                  {validation.cardNumber.message}
                </p>
              )}
            </div>

            {/* Expiry Date and CVV */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiryDate" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Expiry Date
                </Label>
                <Input
                  id="expiryDate"
                  type="text"
                  placeholder="MM/YY"
                  value={formData.expiryDate}
                  onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                  maxLength={5}
                  className={validation.expiryDate?.isValid ? 'border-green-500' : validation.expiryDate?.isValid === false ? 'border-red-500' : ''}
                />
                {validation.expiryDate && (
                  <p className={`text-xs ${validation.expiryDate.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                    {validation.expiryDate.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cvv" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  CVV
                </Label>
                <div className="relative">
                  <Input
                    id="cvv"
                    type={showCvv ? 'text' : 'password'}
                    placeholder="123"
                    value={formData.cvv}
                    onChange={(e) => handleInputChange('cvv', e.target.value)}
                    maxLength={4}
                    className={`pr-10 ${validation.cvv?.isValid ? 'border-green-500' : validation.cvv?.isValid === false ? 'border-red-500' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCvv(!showCvv)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    {showCvv ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {validation.cvv && (
                  <p className={`text-xs ${validation.cvv.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                    {validation.cvv.message}
                  </p>
                )}
              </div>
            </div>

            {/* Cardholder Name */}
            <div className="space-y-2">
              <Label htmlFor="cardholderName" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Cardholder Name
              </Label>
              <Input
                id="cardholderName"
                type="text"
                placeholder="John Doe"
                value={formData.cardholderName}
                onChange={(e) => handleInputChange('cardholderName', e.target.value)}
                className={validation.cardholderName?.isValid ? 'border-green-500' : validation.cardholderName?.isValid === false ? 'border-red-500' : ''}
              />
              {validation.cardholderName && (
                <p className={`text-xs ${validation.cardholderName.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                  {validation.cardholderName.message}
                </p>
              )}
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                min="0.01"
                max="100000"
                step="0.01"
                className={validation.amount?.isValid ? 'border-green-500' : validation.amount?.isValid === false ? 'border-red-500' : ''}
              />
              {validation.amount && (
                <p className={`text-xs ${validation.amount.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                  {validation.amount.message}
                </p>
              )}
            </div>

            <Separator />

            {/* Billing Address */}
            <div className="space-y-4">
              <Label className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Billing Address
              </Label>
              
              <div className="space-y-2">
                <Input
                  placeholder="Street Address"
                  value={formData.billingAddress.street}
                  onChange={(e) => handleInputChange('billingAddress.street', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="City"
                  value={formData.billingAddress.city}
                  onChange={(e) => handleInputChange('billingAddress.city', e.target.value)}
                />
                <Input
                  placeholder="State"
                  value={formData.billingAddress.state}
                  onChange={(e) => handleInputChange('billingAddress.state', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="ZIP Code"
                  value={formData.billingAddress.zipCode}
                  onChange={(e) => handleInputChange('billingAddress.zipCode', e.target.value)}
                />
                <Input
                  placeholder="Country"
                  value={formData.billingAddress.country}
                  onChange={(e) => handleInputChange('billingAddress.country', e.target.value)}
                />
              </div>

              {validation.address && (
                <p className={`text-xs ${validation.address.type === 'success' ? 'text-green-600' : 'text-yellow-600'}`}>
                  {validation.address.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isProcessing || securityScore < 50}
              className="w-full"
              size="lg"
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing Payment...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Pay ₹{formData.amount.toFixed(2)}
                </div>
              )}
            </Button>

            {securityScore < 50 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Please complete all required fields and ensure your payment information is valid to proceed.
                </AlertDescription>
              </Alert>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurePaymentForm;
