// Environment Configuration Utility
// This file centralizes all environment variable access

export const env = {
  // Application Configuration
  NODE_ENV: import.meta.env.NODE_ENV || 'development',
  PORT: import.meta.env.PORT || '3000',
  APP_NAME: import.meta.env.VITE_APP_NAME || 'MANAfoods',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',

  // EzSite API Configuration
  EZSITE: {
    API_URL: import.meta.env.VITE_EZSITE_API_URL || 'https://api.ezsite.com',
    API_KEY: import.meta.env.VITE_EZSITE_API_KEY || '',
    PROJECT_ID: import.meta.env.VITE_EZSITE_PROJECT_ID || '',
  },

  // EzSite Table IDs
  TABLES: {
    USERS: import.meta.env.VITE_USERS_TABLE_ID || '10400',
    PRODUCTS: import.meta.env.VITE_PRODUCTS_TABLE_ID || '10401',
    ORDERS: import.meta.env.VITE_ORDERS_TABLE_ID || '10402',
    CATEGORIES: import.meta.env.VITE_CATEGORIES_TABLE_ID || '10403',
    CART: import.meta.env.VITE_CART_TABLE_ID || '10404',
    WISHLIST: import.meta.env.VITE_WISHLIST_TABLE_ID || '10399',
    REVIEWS: import.meta.env.VITE_REVIEWS_TABLE_ID || '10405',
    CAMPAIGNS: import.meta.env.VITE_CAMPAIGNS_TABLE_ID || '10406',
    BANNERS: import.meta.env.VITE_BANNERS_TABLE_ID || '10407',
    INVOICES: import.meta.env.VITE_INVOICES_TABLE_ID || '10408',
    PAYMENTS: import.meta.env.VITE_PAYMENTS_TABLE_ID || '10409',
    SHIPPING: import.meta.env.VITE_SHIPPING_TABLE_ID || '10410',
    COUPONS: import.meta.env.VITE_COUPONS_TABLE_ID || '10411',
    NOTIFICATIONS: import.meta.env.VITE_NOTIFICATIONS_TABLE_ID || '10412',
    MESSAGES: import.meta.env.VITE_MESSAGES_TABLE_ID || '10413',
    ANALYTICS: import.meta.env.VITE_ANALYTICS_TABLE_ID || '10414',
    BLOG_POSTS: import.meta.env.VITE_BLOG_POSTS_TABLE_ID || '10420',
    BLOG_CATEGORIES: import.meta.env.VITE_BLOG_CATEGORIES_TABLE_ID || '10421',
    BLOG_AUTHORS: import.meta.env.VITE_BLOG_AUTHORS_TABLE_ID || '10422',
    BLOG_COMMENTS: import.meta.env.VITE_BLOG_COMMENTS_TABLE_ID || '10423',
    LOGO_SETTINGS: import.meta.env.VITE_LOGO_SETTINGS_TABLE_ID || '10424',
  },

  // Email Service Configuration
  EMAIL: {
    SERVICE_URL: import.meta.env.VITE_EMAIL_SERVICE_URL || '',
    API_KEY: import.meta.env.VITE_EMAIL_API_KEY || '',
    FROM_NAME: import.meta.env.VITE_EMAIL_FROM_NAME || 'MANAfoods',
    FROM_ADDRESS: import.meta.env.VITE_EMAIL_FROM_ADDRESS || 'noreply@manafoods.com',
    SUPPORT_ADDRESS: import.meta.env.VITE_EMAIL_SUPPORT_ADDRESS || 'support@manafoods.com',
  },

  // Payment Gateway Configuration
  PAYMENT: {
    STRIPE: {
      PUBLISHABLE_KEY: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '',
      WEBHOOK_SECRET: import.meta.env.VITE_STRIPE_WEBHOOK_SECRET || '',
    },
    PAYPAL: {
      CLIENT_ID: import.meta.env.VITE_PAYPAL_CLIENT_ID || '',
    },
    RAZORPAY: {
      KEY_ID: import.meta.env.VITE_RAZORPAY_KEY_ID || '',
    },
  },

  // Google Services
  GOOGLE: {
    MAPS_API_KEY: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    ANALYTICS_ID: import.meta.env.VITE_GOOGLE_ANALYTICS_ID || '',
    CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  },

  // Firebase Configuration
  FIREBASE: {
    API_KEY: import.meta.env.VITE_FIREBASE_API_KEY || '',
    AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
    PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
    STORAGE_BUCKET: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
    MESSAGING_SENDER_ID: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    APP_ID: import.meta.env.VITE_FIREBASE_APP_ID || '',
  },

  // WhatsApp Business API
  WHATSAPP: {
    BUSINESS_API_URL: import.meta.env.VITE_WHATSAPP_BUSINESS_API_URL || 'https://graph.facebook.com/v18.0',
    ACCESS_TOKEN: import.meta.env.VITE_WHATSAPP_ACCESS_TOKEN || '',
    PHONE_NUMBER_ID: import.meta.env.VITE_WHATSAPP_PHONE_NUMBER_ID || '',
  },

  // Push Notification Services
  PUSH_NOTIFICATIONS: {
    FCM: {
      VAPID_KEY: import.meta.env.VITE_FCM_VAPID_KEY || '',
    },
    ONESIGNAL: {
      APP_ID: import.meta.env.VITE_ONESIGNAL_APP_ID || '',
    },
  },

  // Cloudinary Configuration
  CLOUDINARY: {
    CLOUD_NAME: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '',
  },

  // Analytics and Monitoring
  ANALYTICS: {
    SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN || '',
    MIXPANEL_TOKEN: import.meta.env.VITE_MIXPANEL_TOKEN || '',
    HOTJAR_ID: import.meta.env.VITE_HOTJAR_ID || '',
  },

  // Social Media Integration
  SOCIAL: {
    FACEBOOK: {
      APP_ID: import.meta.env.VITE_FACEBOOK_APP_ID || '',
    },
    TWITTER: {
      API_KEY: import.meta.env.VITE_TWITTER_API_KEY || '',
    },
    INSTAGRAM: {
      CLIENT_ID: import.meta.env.VITE_INSTAGRAM_CLIENT_ID || '',
    },
  },

  // Shipping and Logistics
  SHIPPING: {
    API_KEY: import.meta.env.VITE_SHIPPING_API_KEY || '',
    TRACKING_API_URL: import.meta.env.VITE_TRACKING_API_URL || 'https://api.trackingservice.com',
  },

  // Development Configuration
  DEV: {
    SERVER_PORT: import.meta.env.VITE_DEV_SERVER_PORT || '5173',
    BACKEND_SERVER_PORT: import.meta.env.VITE_BACKEND_SERVER_PORT || '3001',
    DEBUG_MODE: import.meta.env.VITE_DEBUG_MODE === 'true',
    SHOW_DEBUG_INFO: import.meta.env.VITE_SHOW_DEBUG_INFO === 'true',
  },

  // Production Configuration
  PRODUCTION: {
    URL: import.meta.env.VITE_PRODUCTION_URL || 'https://manafoods.com',
    API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://api.manafoods.com',
  },

  // Feature Flags
  FEATURES: {
    ENABLE_BLOG: import.meta.env.VITE_ENABLE_BLOG === 'true',
    ENABLE_WISHLIST: import.meta.env.VITE_ENABLE_WISHLIST === 'true',
    ENABLE_REVIEWS: import.meta.env.VITE_ENABLE_REVIEWS === 'true',
    ENABLE_NOTIFICATIONS: import.meta.env.VITE_ENABLE_NOTIFICATIONS === 'true',
    ENABLE_CHAT_SUPPORT: import.meta.env.VITE_ENABLE_CHAT_SUPPORT === 'true',
    ENABLE_SOCIAL_LOGIN: import.meta.env.VITE_ENABLE_SOCIAL_LOGIN === 'true',
    ENABLE_PAYMENT_GATEWAY: import.meta.env.VITE_ENABLE_PAYMENT_GATEWAY === 'true',
    ENABLE_MULTI_LANGUAGE: import.meta.env.VITE_ENABLE_MULTI_LANGUAGE === 'true',
    ENABLE_DARK_MODE: import.meta.env.VITE_ENABLE_DARK_MODE === 'true',
    ENABLE_PWA: import.meta.env.VITE_ENABLE_PWA === 'true',
  },

  // Utility functions
  isDevelopment: () => import.meta.env.NODE_ENV === 'development',
  isProduction: () => import.meta.env.NODE_ENV === 'production',
  isTest: () => import.meta.env.NODE_ENV === 'test',
};

// Validation function to check if required environment variables are set
export const validateEnv = () => {
  const errors: string[] = [];
  
  // Check required variables
  const requiredVars = [
    { key: 'VITE_EZSITE_API_URL', value: env.EZSITE.API_URL },
    { key: 'VITE_EZSITE_API_KEY', value: env.EZSITE.API_KEY },
    { key: 'VITE_EZSITE_PROJECT_ID', value: env.EZSITE.PROJECT_ID },
  ];

  requiredVars.forEach(({ key, value }) => {
    if (!value || value === '') {
      errors.push(`Missing required environment variable: ${key}`);
    }
  });

  // Check payment gateway configuration (at least one should be configured)
  const paymentConfigured = 
    env.PAYMENT.STRIPE.PUBLISHABLE_KEY || 
    env.PAYMENT.PAYPAL.CLIENT_ID || 
    env.PAYMENT.RAZORPAY.KEY_ID;

  if (!paymentConfigured && env.FEATURES.ENABLE_PAYMENT_GATEWAY) {
    errors.push('Payment gateway is enabled but no payment provider is configured');
  }

  // Check email configuration if notifications are enabled
  if (env.FEATURES.ENABLE_NOTIFICATIONS && !env.EMAIL.SERVICE_URL) {
    errors.push('Email service URL is required when notifications are enabled');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Helper function to get environment-specific configuration
export const getConfig = () => {
  const config = {
    apiUrl: env.isDevelopment() ? 'http://localhost:3001' : env.PRODUCTION.API_BASE_URL,
    appUrl: env.isDevelopment() ? 'http://localhost:5173' : env.PRODUCTION.URL,
    enableDebug: env.isDevelopment() || env.DEV.DEBUG_MODE,
    enableAnalytics: env.isProduction(),
  };

  return config;
};

// Export default for convenience
export default env; 