import Razorpay from 'razorpay';
import crypto from 'crypto';

// Razorpay configuration - use environment variables in production
const RAZORPAY_CONFIG = {
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_demo_key',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'demo_key_secret',
};

// Initialize Razorpay instance
let razorpay = null;

// Check if we have real Razorpay credentials
const hasRealCredentials = () => {
  return RAZORPAY_CONFIG.key_id !== 'rzp_test_demo_key' && 
         RAZORPAY_CONFIG.key_secret !== 'demo_key_secret' &&
         RAZORPAY_CONFIG.key_id.startsWith('rzp_');
};

// Initialize Razorpay only if we have real credentials
if (hasRealCredentials()) {
  try {
    razorpay = new Razorpay(RAZORPAY_CONFIG);
    console.log('Razorpay initialized with real credentials');
  } catch (error) {
    console.error('Failed to initialize Razorpay:', error);
    razorpay = null;
  }
} else {
  console.log('Razorpay running in demo mode - no real credentials provided');
}

export class RazorpayService {
  /**
   * Create a new Razorpay order
   * @param {Object} orderData - Order details
   * @param {number} orderData.amount - Amount in paise (INR)
   * @param {string} orderData.currency - Currency code (default: INR)
   * @param {string} orderData.receipt - Receipt ID
   * @param {Object} orderData.notes - Additional notes
   * @returns {Promise<Object>} Razorpay order response
   */
  static async createOrder(orderData) {
    try {
      const { amount, currency = 'INR', receipt, notes = {} } = orderData;

      // Validate amount
      if (!amount || amount < 100) {
        throw new Error('Amount must be at least ₹1 (100 paise)');
      }

      // If running in demo mode, return mock response
      if (!hasRealCredentials() || !razorpay) {
        console.log('Creating demo Razorpay order:', orderData);
        
        const mockOrderId = `order_demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        return {
          success: true,
          order: {
            id: mockOrderId,
            entity: 'order',
            amount: amount,
            amount_paid: 0,
            amount_due: amount,
            currency: currency,
            receipt: receipt,
            offer_id: null,
            status: 'created',
            attempts: 0,
            notes: notes,
            created_at: Math.floor(Date.now() / 1000)
          },
          demo: true
        };
      }

      // Create real Razorpay order
      const options = {
        amount: Math.round(amount), // Amount in paise
        currency: currency,
        receipt: receipt,
        notes: notes
      };

      console.log('Creating Razorpay order with options:', options);
      const order = await razorpay.orders.create(options);
      console.log('Razorpay order created successfully:', order.id);

      return {
        success: true,
        order: order,
        demo: false
      };

    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      return {
        success: false,
        error: error.message || 'Failed to create Razorpay order',
        demo: !hasRealCredentials()
      };
    }
  }

  /**
   * Verify Razorpay payment signature
   * @param {Object} paymentData - Payment verification data
   * @param {string} paymentData.razorpay_order_id - Razorpay Order ID
   * @param {string} paymentData.razorpay_payment_id - Razorpay Payment ID
   * @param {string} paymentData.razorpay_signature - Razorpay Signature
   * @returns {Promise<Object>} Verification result
   */
  static async verifyPayment(paymentData) {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = paymentData;

      // Validate required fields
      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        throw new Error('Missing required payment verification data');
      }

      // If running in demo mode, always return success
      if (!hasRealCredentials() || !razorpay) {
        console.log('Demo mode: Payment verification simulated for:', paymentData);
        
        return {
          success: true,
          verified: true,
          payment_id: razorpay_payment_id,
          order_id: razorpay_order_id,
          demo: true
        };
      }

      // Verify signature using Razorpay webhook secret
      const body = razorpay_order_id + '|' + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', RAZORPAY_CONFIG.key_secret)
        .update(body.toString())
        .digest('hex');

      const isSignatureValid = expectedSignature === razorpay_signature;

      if (isSignatureValid) {
        console.log('Payment signature verified successfully for order:', razorpay_order_id);
        
        // Optionally fetch payment details from Razorpay
        try {
          const payment = await razorpay.payments.fetch(razorpay_payment_id);
          console.log('Payment details fetched:', payment.id, payment.status);
          
          return {
            success: true,
            verified: true,
            payment_id: razorpay_payment_id,
            order_id: razorpay_order_id,
            payment_details: payment,
            demo: false
          };
        } catch (fetchError) {
          console.error('Error fetching payment details:', fetchError);
          // Return success even if we can't fetch details
          return {
            success: true,
            verified: true,
            payment_id: razorpay_payment_id,
            order_id: razorpay_order_id,
            demo: false
          };
        }
      } else {
        console.error('Payment signature verification failed for order:', razorpay_order_id);
        return {
          success: false,
          verified: false,
          error: 'Payment signature verification failed',
          demo: false
        };
      }

    } catch (error) {
      console.error('Error verifying Razorpay payment:', error);
      return {
        success: false,
        verified: false,
        error: error.message || 'Payment verification failed',
        demo: !hasRealCredentials()
      };
    }
  }

  /**
   * Fetch payment details from Razorpay
   * @param {string} paymentId - Razorpay Payment ID
   * @returns {Promise<Object>} Payment details
   */
  static async fetchPayment(paymentId) {
    try {
      if (!hasRealCredentials() || !razorpay) {
        console.log('Demo mode: Payment fetch simulated for:', paymentId);
        
        return {
          success: true,
          payment: {
            id: paymentId,
            entity: 'payment',
            amount: 100000, // ₹1000 in paise
            currency: 'INR',
            status: 'captured',
            method: 'card',
            captured: true,
            created_at: Math.floor(Date.now() / 1000)
          },
          demo: true
        };
      }

      const payment = await razorpay.payments.fetch(paymentId);
      console.log('Payment fetched successfully:', payment.id);

      return {
        success: true,
        payment: payment,
        demo: false
      };

    } catch (error) {
      console.error('Error fetching payment:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch payment details',
        demo: !hasRealCredentials()
      };
    }
  }

  /**
   * Fetch order details from Razorpay
   * @param {string} orderId - Razorpay Order ID
   * @returns {Promise<Object>} Order details
   */
  static async fetchOrder(orderId) {
    try {
      if (!hasRealCredentials() || !razorpay) {
        console.log('Demo mode: Order fetch simulated for:', orderId);
        
        return {
          success: true,
          order: {
            id: orderId,
            entity: 'order',
            amount: 100000, // ₹1000 in paise
            amount_paid: 100000,
            amount_due: 0,
            currency: 'INR',
            receipt: `receipt_${Date.now()}`,
            status: 'paid',
            created_at: Math.floor(Date.now() / 1000)
          },
          demo: true
        };
      }

      const order = await razorpay.orders.fetch(orderId);
      console.log('Order fetched successfully:', order.id);

      return {
        success: true,
        order: order,
        demo: false
      };

    } catch (error) {
      console.error('Error fetching order:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch order details',
        demo: !hasRealCredentials()
      };
    }
  }

  /**
   * Create a refund for a payment
   * @param {string} paymentId - Razorpay Payment ID
   * @param {Object} refundData - Refund details
   * @param {number} refundData.amount - Refund amount in paise (optional, defaults to full amount)
   * @param {Object} refundData.notes - Refund notes (optional)
   * @returns {Promise<Object>} Refund response
   */
  static async createRefund(paymentId, refundData = {}) {
    try {
      if (!hasRealCredentials() || !razorpay) {
        console.log('Demo mode: Refund creation simulated for payment:', paymentId);
        
        return {
          success: true,
          refund: {
            id: `rfnd_demo_${Date.now()}`,
            entity: 'refund',
            amount: refundData.amount || 100000,
            currency: 'INR',
            payment_id: paymentId,
            notes: refundData.notes || {},
            receipt: null,
            status: 'processed',
            created_at: Math.floor(Date.now() / 1000)
          },
          demo: true
        };
      }

      const refund = await razorpay.payments.refund(paymentId, refundData);
      console.log('Refund created successfully:', refund.id);

      return {
        success: true,
        refund: refund,
        demo: false
      };

    } catch (error) {
      console.error('Error creating refund:', error);
      return {
        success: false,
        error: error.message || 'Failed to create refund',
        demo: !hasRealCredentials()
      };
    }
  }

  /**
   * Get configuration info
   * @returns {Object} Configuration status
   */
  static getConfig() {
    return {
      hasRealCredentials: hasRealCredentials(),
      demoMode: !hasRealCredentials(),
      keyId: RAZORPAY_CONFIG.key_id,
      initialized: razorpay !== null
    };
  }
}

export default RazorpayService;
