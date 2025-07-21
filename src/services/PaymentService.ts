import { CartItem } from '../contexts/CartContext';
import { env } from '../config/env';

// Razorpay is already declared in global.d.ts

export interface PaymentOptions {
  amount: number; // Amount in INR
  currency: string;
  orderId: string;
  customerInfo: {
    name: string;
    email: string;
    phone?: string;
  };
  orderItems: CartItem[];
  shippingAddress: any;
  onSuccess: (response: RazorpayResponse) => void;
  onFailure: (error: any) => void;
}

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface CreateOrderResponse {
  success: boolean;
  razorpayOrderId?: string;
  orderId?: string;
  message?: string;
  error?: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  verified?: boolean;
  message?: string;
  error?: string;
}

export class PaymentService {
  private static razorpayKeyId = env.PAYMENT.RAZORPAY.KEY_ID || 'rzp_test_demo_key';

  /**
   * Initialize Razorpay script
   */
  static async initializeRazorpay(): Promise<boolean> {
    return new Promise((resolve) => {
      // Check if Razorpay is already loaded
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      // Create script element
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;

      script.onload = () => {
        console.log('Razorpay script loaded successfully');
        resolve(true);
      };

      script.onerror = () => {
        console.error('Failed to load Razorpay script');
        resolve(false);
      };

      document.body.appendChild(script);
    });
  }

  /**
   * Create Razorpay order
   */
  static async createOrder(params: {
    amount: number;
    currency: string;
    receipt: string;
    userId: string;
    cartItems: CartItem[];
    shippingAddress: any;
  }): Promise<CreateOrderResponse> {
    try {
      const response = await fetch('/api/razerpay/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(params.amount * 100), // Convert to paise
          currency: params.currency,
          receipt: params.receipt,
          notes: {
            user_id: params.userId,
            items_count: params.cartItems.length,
            shipping_address: JSON.stringify(params.shippingAddress)
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        return {
          success: false,
          error: data.error || 'Failed to create order'
        };
      }

      return {
        success: true,
        razorpayOrderId: data.data.id,
        message: 'Order created successfully'
      };
    } catch (error: any) {
      console.error('Error creating Razorpay order:', error);
      return {
        success: false,
        error: error.message || 'Failed to create order'
      };
    }
  }

  /**
   * Verify Razorpay payment
   */
  static async verifyPayment(params: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
    orderId?: string;
  }): Promise<VerifyPaymentResponse> {
    try {
      const response = await fetch('/api/razerpay/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          razerpay_payment_id: params.razorpay_payment_id,
          razerpay_order_id: params.razorpay_order_id,
          razerpay_signature: params.razorpay_signature,
          internal_order_id: params.orderId
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        success: data.success,
        verified: data.success,
        message: data.success ? 'Payment verified successfully' : data.error,
        error: data.success ? undefined : data.error
      };
    } catch (error: any) {
      console.error('Error verifying payment:', error);
      return {
        success: false,
        verified: false,
        error: error.message || 'Failed to verify payment'
      };
    }
  }

  /**
   * Open Razorpay checkout
   */
  static async openCheckout(options: PaymentOptions): Promise<void> {
    try {
      // Initialize Razorpay if not already loaded
      const isInitialized = await this.initializeRazorpay();
      if (!isInitialized) {
        throw new Error('Failed to initialize Razorpay');
      }

      // Check if we're in demo mode
      const isDemoMode = env.isDevelopment() || 
                        this.razorpayKeyId === 'rzp_test_demo_key' || 
                        !this.razorpayKeyId.startsWith('rzp_');

      if (isDemoMode) {
        console.log('PaymentService: Running in demo mode');
        // Simulate payment process in demo mode
        setTimeout(() => {
          const mockResponse: RazorpayResponse = {
            razorpay_payment_id: `pay_demo_${Date.now()}`,
            razorpay_order_id: options.orderId,
            razorpay_signature: `sig_demo_${Date.now()}`
          };
          options.onSuccess(mockResponse);
        }, 2000);
        return;
      }

      // Create Razorpay order first
      const createOrderResult = await this.createOrder({
        amount: options.amount,
        currency: options.currency,
        receipt: `receipt_${Date.now()}`,
        userId: options.customerInfo.email,
        cartItems: options.orderItems,
        shippingAddress: options.shippingAddress
      });

      if (!createOrderResult.success || !createOrderResult.razorpayOrderId) {
        throw new Error(createOrderResult.error || 'Failed to create Razorpay order');
      }

      // Configure Razorpay options
      const razorpayOptions = {
        key: this.razorpayKeyId,
        amount: Math.round(options.amount * 100).toString(), // Amount in paise as string
        currency: options.currency,
        name: 'MANAfoods',
        description: 'Purchase from MANAfoods - Traditional Indian Pickles',
        order_id: createOrderResult.razorpayOrderId,
        handler: async (response: RazorpayResponse) => {
          try {
            // Verify payment
            const verifyResult = await this.verifyPayment({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              orderId: options.orderId
            });

            if (verifyResult.success && verifyResult.verified) {
              options.onSuccess(response);
            } else {
              options.onFailure(new Error(verifyResult.error || 'Payment verification failed'));
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            options.onFailure(error);
          }
        },
        prefill: {
          name: options.customerInfo.name,
          email: options.customerInfo.email,
          contact: options.customerInfo.phone || '',
        },
        notes: {
          address: JSON.stringify(options.shippingAddress),
          items_count: options.orderItems.length
        },
        theme: {
          color: '#3399CC',
        },
        modal: {
          ondismiss: () => {
            console.log('Payment modal closed by user');
            options.onFailure(new Error('Payment cancelled by user'));
          }
        }
      };

      // Open Razorpay checkout
      const rzp = new window.Razorpay(razorpayOptions);
      
      rzp.on('payment.failed', (response: any) => {
        console.error('Payment failed:', response.error);
        options.onFailure(new Error(response.error.description || 'Payment failed'));
      });

      rzp.open();
    } catch (error: any) {
      console.error('Error opening Razorpay checkout:', error);
      options.onFailure(error);
    }
  }

  /**
   * Process payment with error handling and retry logic
   */
  static async processPayment(params: {
    amount: number;
    currency: string;
    customerInfo: {
      name: string;
      email: string;
      phone?: string;
    };
    orderItems: CartItem[];
    shippingAddress: any;
    onSuccess: (response: RazorpayResponse) => void;
    onError: (error: string) => void;
    onCancel?: () => void;
  }): Promise<void> {
    try {
      const orderId = `order_${Date.now()}`;
      
      await this.openCheckout({
        amount: params.amount,
        currency: params.currency,
        orderId: orderId,
        customerInfo: params.customerInfo,
        orderItems: params.orderItems,
        shippingAddress: params.shippingAddress,
        onSuccess: params.onSuccess,
        onFailure: (error) => {
          console.error('Payment processing failed:', error);
          if (error.message?.includes('cancelled') && params.onCancel) {
            params.onCancel();
          } else {
            params.onError(error.message || 'Payment failed');
          }
        }
      });
    } catch (error: any) {
      console.error('Error processing payment:', error);
      params.onError(error.message || 'Payment processing failed');
    }
  }

  /**
   * Get payment configuration
   */
  static getConfig() {
    return {
      keyId: this.razorpayKeyId,
      isDemoMode: env.isDevelopment() || 
                  this.razorpayKeyId === 'rzp_test_demo_key' || 
                  !this.razorpayKeyId.startsWith('rzp_'),
      supportedCurrencies: ['INR'],
      supportedPaymentMethods: ['card', 'netbanking', 'wallet', 'upi']
    };
  }

  /**
   * Format amount for display
   */
  static formatAmount(amount: number, currency: string = 'INR'): string {
    if (currency === 'INR') {
      return `₹${amount.toFixed(2)}`;
    }
    return `${currency} ${amount.toFixed(2)}`;
  }

  /**
   * Validate payment amount
   */
  static validateAmount(amount: number): { valid: boolean; error?: string } {
    if (amount <= 0) {
      return { valid: false, error: 'Amount must be greater than 0' };
    }
    if (amount < 1) {
      return { valid: false, error: 'Minimum amount is ₹1' };
    }
    if (amount > 200000) {
      return { valid: false, error: 'Maximum amount is ₹2,00,000' };
    }
    return { valid: true };
  }

  /**
   * Get payment status message
   */
  static getPaymentStatusMessage(status: string): string {
    switch (status.toLowerCase()) {
      case 'created':
        return 'Payment order created';
      case 'attempted':
        return 'Payment in progress';
      case 'paid':
        return 'Payment successful';
      case 'captured':
        return 'Payment captured successfully';
      case 'failed':
        return 'Payment failed';
      case 'cancelled':
        return 'Payment cancelled';
      default:
        return `Payment ${status}`;
    }
  }
}

export default PaymentService;
