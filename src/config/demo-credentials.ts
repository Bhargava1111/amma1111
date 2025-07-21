// Demo Credentials for Testing
export const DEMO_CREDENTIALS = {
  // Razorpay Demo Credentials
  RAZORPAY: {
    KEY_ID: 'rzp_test_demo_key',
    KEY_SECRET: 'demo_secret_key',
    // Demo Card Details
    CARDS: {
      SUCCESS: {
        number: '4111 1111 1111 1111',
        expiry: '12/25',
        cvv: '123',
        name: 'Demo User'
      },
      FAILURE: {
        number: '4000 0000 0000 0002',
        expiry: '12/25',
        cvv: '123',
        name: 'Demo User'
      }
    }
  },

  // Demo User Accounts
  USERS: {
    ADMIN: {
      email: 'admin@example.com',
      password: 'admin123',
      name: 'Admin User',
      role: 'admin'
    },
    CUSTOMER: {
      email: 'customer@example.com',
      password: 'customer123',
      name: 'Demo Customer',
      role: 'customer'
    },
    TEST_USER: {
      email: 'test@example.com',
      password: 'test123',
      name: 'Test User',
      role: 'customer'
    }
  },

  // Demo Payment Methods
  PAYMENT_METHODS: {
    CREDIT_CARD: 'Credit Card',
    DEBIT_CARD: 'Debit Card',
    UPI: 'UPI',
    NET_BANKING: 'Net Banking',
    WALLET: 'Digital Wallet'
  },

  // Demo Shipping Addresses
  SHIPPING_ADDRESSES: {
    DEFAULT: {
      fullName: 'Demo User',
      email: 'demo@example.com',
      address: '123 Demo Street, Demo Area',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      zipCode: '400001',
      phone: '+91 98765 43210'
    }
  }
};

// Demo Environment Configuration
export const DEMO_CONFIG = {
  // Email Configuration (Demo Mode)
  EMAIL: {
    SMTP_HOST: 'smtp.hostinger.com',
    SMTP_PORT: 465,
    FROM_EMAIL: 'no-reply@manaeats.com',
    FROM_NAME: 'MANAfoods',
    // Demo email addresses
    ADMIN_EMAILS: ['admin@manaeats.com', 'orders@manaeats.com', 'support@manaeats.com'],
    CUSTOMER_SUPPORT: 'support@manaeats.com'
  },

  // Payment Configuration
  PAYMENT: {
    CURRENCY: 'INR',
    GATEWAY: 'Razorpay',
    DEMO_MODE: true
  },

  // Order Configuration
  ORDER: {
    DEFAULT_STATUS: 'pending',
    PROCESSING_TIME: '2-3 business days',
    DELIVERY_TIME: '5-7 business days',
    TRACKING_PREFIX: 'TN'
  }
};

// Helper function to get demo credentials
export const getDemoCredentials = (type: keyof typeof DEMO_CREDENTIALS) => {
  return DEMO_CREDENTIALS[type];
};

// Helper function to check if running in demo mode
export const isDemoMode = () => {
  return import.meta.env.VITE_DEMO_MODE === 'true' || 
         !import.meta.env.VITE_RAZERPAY_KEY_ID || 
         import.meta.env.VITE_RAZERPAY_KEY_ID === 'rzp_test_demo_key';
}; 