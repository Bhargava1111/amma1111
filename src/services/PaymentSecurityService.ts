import { NotificationService } from './NotificationService';

// Payment security configuration
const PAYMENT_SECURITY_CONFIG = {
  MAX_PAYMENT_ATTEMPTS: 3,
  PAYMENT_TIMEOUT: 300000, // 5 minutes
  MIN_PAYMENT_AMOUNT: 1,
  MAX_PAYMENT_AMOUNT: 50000,
  ALLOWED_CURRENCIES: ['INR', 'USD'],
  FRAUD_DETECTION_THRESHOLD: 10000, // INR 10,000
  SUSPICIOUS_VELOCITY_THRESHOLD: 5, // 5 transactions in 10 minutes
  RATE_LIMIT_WINDOW: 600000, // 10 minutes
  ENCRYPTED_FIELDS: ['cardNumber', 'cvv', 'accountNumber'],
  PCI_COMPLIANCE_FIELDS: ['cardNumber', 'expiryDate', 'cvv', 'cardHolderName']
};

// Payment status enum
export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
  DISPUTED = 'disputed',
  FROZEN = 'frozen'
}

// Payment method types
export enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  UPI = 'upi',
  NET_BANKING = 'net_banking',
  WALLET = 'wallet',
  RAZORPAY = 'razorpay',
  COD = 'cod'
}

// Risk levels
export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Payment transaction interface
export interface PaymentTransaction {
  id: string;
  orderId: string;
  userId: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  riskLevel: RiskLevel;
  gatewayTransactionId?: string;
  gatewayResponse?: any;
  fraudScore: number;
  ipAddress: string;
  userAgent: string;
  deviceFingerprint: string;
  billingAddress: any;
  encryptedPaymentData: string;
  metadata: any;
  createdAt: string;
  updatedAt: string;
  processedAt?: string;
  failureReason?: string;
  securityChecks: SecurityCheck[];
}

// Security check interface
export interface SecurityCheck {
  type: string;
  status: 'passed' | 'failed' | 'warning';
  score: number;
  details: string;
  timestamp: string;
}

// Real-time payment tracking
interface PaymentTracker {
  transactions: Map<string, PaymentTransaction>;
  userAttempts: Map<string, number>;
  listeners: Set<(transaction: PaymentTransaction) => void>;
  fraudDetectors: Array<(transaction: PaymentTransaction) => Promise<SecurityCheck>>;
}

export class PaymentSecurityService {
  private static tracker: PaymentTracker = {
    transactions: new Map(),
    userAttempts: new Map(),
    listeners: new Set(),
    fraudDetectors: []
  };

  // Initialize payment security system
  static initialize() {
    console.log('PaymentSecurityService: Initializing payment security system...');
    
    // Register fraud detection algorithms
    this.registerFraudDetectors();
    
    // Start real-time monitoring
    this.startRealTimeMonitoring();
    
    // Setup cleanup intervals
    this.setupCleanupTasks();
    
    console.log('PaymentSecurityService: Payment security system initialized');
  }

  // Subscribe to real-time payment updates
  static subscribe(callback: (transaction: PaymentTransaction) => void) {
    this.tracker.listeners.add(callback);
    
    return () => {
      this.tracker.listeners.delete(callback);
    };
  }

  // Encrypt sensitive payment data
  static encryptPaymentData(paymentData: any): string {
    try {
      // In production, use proper encryption (AES-256)
      const sensitiveData = {};
      
      PAYMENT_SECURITY_CONFIG.ENCRYPTED_FIELDS.forEach(field => {
        if (paymentData[field]) {
          // Mock encryption - replace with real encryption in production
          sensitiveData[field] = btoa(paymentData[field]).split('').reverse().join('');
        }
      });
      
      return btoa(JSON.stringify(sensitiveData));
    } catch (error) {
      console.error('PaymentSecurityService: Error encrypting payment data:', error);
      throw new Error('Payment data encryption failed');
    }
  }

  // Decrypt sensitive payment data
  static decryptPaymentData(encryptedData: string): any {
    try {
      // In production, use proper decryption
      const decryptedString = atob(encryptedData);
      const sensitiveData = JSON.parse(decryptedString);
      
      const decryptedData = {};
      Object.keys(sensitiveData).forEach(field => {
        // Mock decryption - replace with real decryption in production
        decryptedData[field] = atob(sensitiveData[field].split('').reverse().join(''));
      });
      
      return decryptedData;
    } catch (error) {
      console.error('PaymentSecurityService: Error decrypting payment data:', error);
      throw new Error('Payment data decryption failed');
    }
  }

  // Validate payment request
  static async validatePaymentRequest(paymentData: any, userContext: any): Promise<{
    valid: boolean;
    errors: string[];
    warnings: string[];
    riskLevel: RiskLevel;
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];
    let riskLevel = RiskLevel.LOW;

    try {
      // Amount validation
      if (!paymentData.amount || paymentData.amount < PAYMENT_SECURITY_CONFIG.MIN_PAYMENT_AMOUNT) {
        errors.push(`Minimum payment amount is ₹${PAYMENT_SECURITY_CONFIG.MIN_PAYMENT_AMOUNT}`);
      }

      if (paymentData.amount > PAYMENT_SECURITY_CONFIG.MAX_PAYMENT_AMOUNT) {
        errors.push(`Maximum payment amount is ₹${PAYMENT_SECURITY_CONFIG.MAX_PAYMENT_AMOUNT}`);
      }

      // Currency validation
      if (!PAYMENT_SECURITY_CONFIG.ALLOWED_CURRENCIES.includes(paymentData.currency)) {
        errors.push(`Currency ${paymentData.currency} is not supported`);
      }

      // High-value transaction check
      if (paymentData.amount > PAYMENT_SECURITY_CONFIG.FRAUD_DETECTION_THRESHOLD) {
        riskLevel = RiskLevel.HIGH;
        warnings.push('High-value transaction requires additional verification');
      }

      // Rate limiting check
      const userAttempts = this.tracker.userAttempts.get(userContext.userId) || 0;
      if (userAttempts >= PAYMENT_SECURITY_CONFIG.MAX_PAYMENT_ATTEMPTS) {
        errors.push('Too many payment attempts. Please try again later.');
        riskLevel = RiskLevel.CRITICAL;
      }

      // Velocity check
      const recentTransactions = this.getRecentTransactions(userContext.userId);
      if (recentTransactions.length >= PAYMENT_SECURITY_CONFIG.SUSPICIOUS_VELOCITY_THRESHOLD) {
        riskLevel = RiskLevel.HIGH;
        warnings.push('Multiple transactions detected in short time');
      }

      // Payment method validation
      if (!Object.values(PaymentMethod).includes(paymentData.paymentMethod)) {
        errors.push('Invalid payment method');
      }

      // PCI compliance check for card payments
      if ([PaymentMethod.CREDIT_CARD, PaymentMethod.DEBIT_CARD].includes(paymentData.paymentMethod)) {
        const pciValidation = this.validatePCICompliance(paymentData);
        if (!pciValidation.valid) {
          errors.push(...pciValidation.errors);
        }
      }

      return {
        valid: errors.length === 0,
        errors,
        warnings,
        riskLevel
      };
    } catch (error) {
      console.error('PaymentSecurityService: Error validating payment request:', error);
      return {
        valid: false,
        errors: ['Payment validation failed'],
        warnings: [],
        riskLevel: RiskLevel.CRITICAL
      };
    }
  }

  // Create secure payment transaction
  static async createSecureTransaction(paymentData: any, userContext: any): Promise<PaymentTransaction> {
    try {
      // Generate transaction ID
      const transactionId = `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Encrypt sensitive payment data
      const encryptedPaymentData = this.encryptPaymentData(paymentData);
      
      // Calculate fraud score
      const fraudScore = await this.calculateFraudScore(paymentData, userContext);
      
      // Determine risk level
      const riskLevel = this.determineRiskLevel(fraudScore, paymentData.amount);
      
      // Create transaction object
      const transaction: PaymentTransaction = {
        id: transactionId,
        orderId: paymentData.orderId,
        userId: userContext.userId,
        amount: paymentData.amount,
        currency: paymentData.currency,
        paymentMethod: paymentData.paymentMethod,
        status: PaymentStatus.PENDING,
        riskLevel,
        fraudScore,
        ipAddress: userContext.ipAddress || 'unknown',
        userAgent: userContext.userAgent || 'unknown',
        deviceFingerprint: userContext.deviceFingerprint || 'unknown',
        billingAddress: paymentData.billingAddress,
        encryptedPaymentData,
        metadata: {
          createdBy: 'PaymentSecurityService',
          version: '2.0',
          securityProtocol: 'enhanced',
          ...paymentData.metadata
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        securityChecks: []
      };

      // Run security checks
      const securityChecks = await this.runSecurityChecks(transaction);
      transaction.securityChecks = securityChecks;

      // Store transaction
      this.tracker.transactions.set(transactionId, transaction);
      
      // Update user attempts
      const userAttempts = this.tracker.userAttempts.get(userContext.userId) || 0;
      this.tracker.userAttempts.set(userContext.userId, userAttempts + 1);
      
      // Notify listeners
      this.notifyListeners(transaction);
      
      // Create admin notification for high-risk transactions
      if (riskLevel === RiskLevel.HIGH || riskLevel === RiskLevel.CRITICAL) {
        await this.notifyAdminsHighRiskTransaction(transaction);
      }
      
      console.log(`PaymentSecurityService: Created secure transaction ${transactionId} with risk level ${riskLevel}`);
      return transaction;
    } catch (error) {
      console.error('PaymentSecurityService: Error creating secure transaction:', error);
      throw error;
    }
  }

  // Process payment with real-time updates
  static async processPayment(transactionId: string, gatewayResponse: any): Promise<PaymentTransaction> {
    try {
      const transaction = this.tracker.transactions.get(transactionId);
      if (!transaction) {
        throw new Error('Transaction not found');
      }

      // Update transaction status
      transaction.status = PaymentStatus.PROCESSING;
      transaction.gatewayResponse = gatewayResponse;
      transaction.gatewayTransactionId = gatewayResponse.transactionId;
      transaction.updatedAt = new Date().toISOString();

      // Additional security checks during processing
      const processingChecks = await this.runProcessingSecurityChecks(transaction, gatewayResponse);
      transaction.securityChecks.push(...processingChecks);

      // Determine final status based on gateway response and security checks
      const hasFailedChecks = processingChecks.some(check => check.status === 'failed');
      
      if (gatewayResponse.status === 'success' && !hasFailedChecks) {
        transaction.status = PaymentStatus.COMPLETED;
        transaction.processedAt = new Date().toISOString();
        
        // Create success notification
        await NotificationService.createNotification({
          userId: transaction.userId,
          title: '✅ Payment Successful',
          message: `Payment of ₹${transaction.amount} completed successfully for order #${transaction.orderId}`,
          type: 'system',
          priority: 'normal',
          metadata: {
            transactionId: transaction.id,
            orderId: transaction.orderId,
            amount: transaction.amount
          }
        });
      } else {
        transaction.status = PaymentStatus.FAILED;
        transaction.failureReason = gatewayResponse.error || 'Security checks failed';
        
        // Create failure notification
        await NotificationService.createNotification({
          userId: transaction.userId,
          title: '❌ Payment Failed',
          message: `Payment of ₹${transaction.amount} failed. Please try again or contact support.`,
          type: 'system',
          priority: 'high',
          metadata: {
            transactionId: transaction.id,
            orderId: transaction.orderId,
            failureReason: transaction.failureReason
          }
        });
      }

      // Update stored transaction
      this.tracker.transactions.set(transactionId, transaction);
      
      // Notify listeners of update
      this.notifyListeners(transaction);
      
      console.log(`PaymentSecurityService: Processed payment ${transactionId} with status ${transaction.status}`);
      return transaction;
    } catch (error) {
      console.error('PaymentSecurityService: Error processing payment:', error);
      throw error;
    }
  }

  // Get transaction status with real-time updates
  static getTransactionStatus(transactionId: string): PaymentTransaction | null {
    return this.tracker.transactions.get(transactionId) || null;
  }

  // Get user transaction history
  static getUserTransactions(userId: string): PaymentTransaction[] {
    return Array.from(this.tracker.transactions.values())
      .filter(transaction => transaction.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Private helper methods

  private static registerFraudDetectors() {
    // IP-based fraud detection
    this.tracker.fraudDetectors.push(async (transaction) => ({
      type: 'ip_reputation',
      status: 'passed', // Mock - in production, check against IP reputation databases
      score: 10,
      details: 'IP address reputation check passed',
      timestamp: new Date().toISOString()
    }));

    // Velocity-based fraud detection
    this.tracker.fraudDetectors.push(async (transaction) => {
      const recentTransactions = this.getRecentTransactions(transaction.userId);
      const suspiciousVelocity = recentTransactions.length >= PAYMENT_SECURITY_CONFIG.SUSPICIOUS_VELOCITY_THRESHOLD;
      
      return {
        type: 'velocity_check',
        status: suspiciousVelocity ? 'warning' : 'passed',
        score: suspiciousVelocity ? -20 : 10,
        details: `User has ${recentTransactions.length} recent transactions`,
        timestamp: new Date().toISOString()
      };
    });

    // Amount-based fraud detection
    this.tracker.fraudDetectors.push(async (transaction) => {
      const isHighValue = transaction.amount > PAYMENT_SECURITY_CONFIG.FRAUD_DETECTION_THRESHOLD;
      
      return {
        type: 'amount_analysis',
        status: isHighValue ? 'warning' : 'passed',
        score: isHighValue ? -10 : 5,
        details: `Transaction amount: ₹${transaction.amount}`,
        timestamp: new Date().toISOString()
      };
    });
  }

  private static async runSecurityChecks(transaction: PaymentTransaction): Promise<SecurityCheck[]> {
    const checks: SecurityCheck[] = [];
    
    for (const detector of this.tracker.fraudDetectors) {
      try {
        const check = await detector(transaction);
        checks.push(check);
      } catch (error) {
        console.error('PaymentSecurityService: Fraud detector error:', error);
        checks.push({
          type: 'detector_error',
          status: 'failed',
          score: -50,
          details: 'Fraud detector encountered an error',
          timestamp: new Date().toISOString()
        });
      }
    }
    
    return checks;
  }

  private static async runProcessingSecurityChecks(transaction: PaymentTransaction, gatewayResponse: any): Promise<SecurityCheck[]> {
    const checks: SecurityCheck[] = [];
    
    // Gateway response validation
    checks.push({
      type: 'gateway_validation',
      status: gatewayResponse.status === 'success' ? 'passed' : 'failed',
      score: gatewayResponse.status === 'success' ? 20 : -50,
      details: `Gateway response: ${gatewayResponse.status}`,
      timestamp: new Date().toISOString()
    });
    
    // Transaction integrity check
    const integrityValid = this.validateTransactionIntegrity(transaction, gatewayResponse);
    checks.push({
      type: 'integrity_check',
      status: integrityValid ? 'passed' : 'failed',
      score: integrityValid ? 15 : -30,
      details: 'Transaction integrity validation',
      timestamp: new Date().toISOString()
    });
    
    return checks;
  }

  private static async calculateFraudScore(paymentData: any, userContext: any): Promise<number> {
    let score = 100; // Start with perfect score
    
    // High amount penalty
    if (paymentData.amount > PAYMENT_SECURITY_CONFIG.FRAUD_DETECTION_THRESHOLD) {
      score -= 20;
    }
    
    // Multiple attempts penalty
    const userAttempts = this.tracker.userAttempts.get(userContext.userId) || 0;
    score -= userAttempts * 10;
    
    // Recent transaction velocity
    const recentTransactions = this.getRecentTransactions(userContext.userId);
    score -= recentTransactions.length * 5;
    
    return Math.max(0, Math.min(100, score));
  }

  private static determineRiskLevel(fraudScore: number, amount: number): RiskLevel {
    if (fraudScore < 30 || amount > PAYMENT_SECURITY_CONFIG.FRAUD_DETECTION_THRESHOLD * 2) {
      return RiskLevel.CRITICAL;
    }
    if (fraudScore < 50 || amount > PAYMENT_SECURITY_CONFIG.FRAUD_DETECTION_THRESHOLD) {
      return RiskLevel.HIGH;
    }
    if (fraudScore < 70) {
      return RiskLevel.MEDIUM;
    }
    return RiskLevel.LOW;
  }

  private static getRecentTransactions(userId: string): PaymentTransaction[] {
    const tenMinutesAgo = Date.now() - PAYMENT_SECURITY_CONFIG.RATE_LIMIT_WINDOW;
    return Array.from(this.tracker.transactions.values())
      .filter(transaction => 
        transaction.userId === userId && 
        new Date(transaction.createdAt).getTime() > tenMinutesAgo
      );
  }

  private static validatePCICompliance(paymentData: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Card number validation (basic Luhn algorithm check)
    if (paymentData.cardNumber && !this.isValidCardNumber(paymentData.cardNumber)) {
      errors.push('Invalid card number');
    }
    
    // CVV validation
    if (paymentData.cvv && (paymentData.cvv.length < 3 || paymentData.cvv.length > 4)) {
      errors.push('Invalid CVV');
    }
    
    // Expiry date validation
    if (paymentData.expiryDate && !this.isValidExpiryDate(paymentData.expiryDate)) {
      errors.push('Invalid or expired card');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  private static isValidCardNumber(cardNumber: string): boolean {
    // Basic Luhn algorithm implementation
    const digits = cardNumber.replace(/\s/g, '').split('').reverse();
    let sum = 0;
    
    for (let i = 0; i < digits.length; i++) {
      let digit = parseInt(digits[i]);
      if (i % 2 === 1) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
    }
    
    return sum % 10 === 0;
  }

  private static isValidExpiryDate(expiryDate: string): boolean {
    const [month, year] = expiryDate.split('/');
    const expiry = new Date(parseInt('20' + year), parseInt(month) - 1);
    return expiry > new Date();
  }

  private static validateTransactionIntegrity(transaction: PaymentTransaction, gatewayResponse: any): boolean {
    // Validate that the gateway response matches the original transaction
    return (
      gatewayResponse.amount === transaction.amount &&
      gatewayResponse.currency === transaction.currency &&
      gatewayResponse.orderId === transaction.orderId
    );
  }

  private static notifyListeners(transaction: PaymentTransaction) {
    this.tracker.listeners.forEach(callback => {
      try {
        callback(transaction);
      } catch (error) {
        console.error('PaymentSecurityService: Error notifying listener:', error);
      }
    });
  }

  private static async notifyAdminsHighRiskTransaction(transaction: PaymentTransaction) {
    try {
      await NotificationService.createSystemNotificationForAll({
        title: '🚨 High-Risk Payment Detected',
        message: `High-risk payment of ₹${transaction.amount} detected for order #${transaction.orderId}. Risk level: ${transaction.riskLevel}`,
        priority: 'urgent',
        actionUrl: `/admin/payments/${transaction.id}`
      });
    } catch (error) {
      console.error('PaymentSecurityService: Error notifying admins of high-risk transaction:', error);
    }
  }

  private static startRealTimeMonitoring() {
    setInterval(() => {
      this.cleanupExpiredTransactions();
      this.resetUserAttempts();
    }, 60000); // Run every minute
  }

  private static setupCleanupTasks() {
    // Clean up old transactions daily
    setInterval(() => {
      this.cleanupOldTransactions();
    }, 24 * 60 * 60 * 1000); // Run daily
  }

  private static cleanupExpiredTransactions() {
    const fiveMinutesAgo = Date.now() - PAYMENT_SECURITY_CONFIG.PAYMENT_TIMEOUT;
    
    for (const [id, transaction] of this.tracker.transactions) {
      if (
        transaction.status === PaymentStatus.PENDING &&
        new Date(transaction.createdAt).getTime() < fiveMinutesAgo
      ) {
        transaction.status = PaymentStatus.CANCELLED;
        transaction.failureReason = 'Payment timeout';
        transaction.updatedAt = new Date().toISOString();
        
        this.notifyListeners(transaction);
      }
    }
  }

  private static resetUserAttempts() {
    const tenMinutesAgo = Date.now() - PAYMENT_SECURITY_CONFIG.RATE_LIMIT_WINDOW;
    
    // Reset attempt counts that are older than the rate limit window
    for (const [userId, _] of this.tracker.userAttempts) {
      const userTransactions = this.getRecentTransactions(userId);
      if (userTransactions.length === 0) {
        this.tracker.userAttempts.delete(userId);
      }
    }
  }

  private static cleanupOldTransactions() {
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    
    for (const [id, transaction] of this.tracker.transactions) {
      if (new Date(transaction.createdAt).getTime() < oneDayAgo) {
        this.tracker.transactions.delete(id);
      }
    }
  }
}
