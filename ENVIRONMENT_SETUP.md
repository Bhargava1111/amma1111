# Environment Variables Setup Guide

This guide will help you configure environment variables for the MANAfoods e-commerce application.

## 🚀 Quick Setup

### Option 1: Automated Setup (Recommended)
```bash
# Run the setup script
node setup-env.js
```

### Option 2: Manual Setup
```bash
# Copy the example file
cp env.example .env

# Edit the .env file with your actual values
# Use your preferred text editor
nano .env
```

## 📋 Configuration Categories

### 🔑 Essential Variables (Required)

These variables are **required** for the application to work properly:

```env
# EzSite API Configuration
VITE_EZSITE_API_URL=https://api.ezsite.com
VITE_EZSITE_API_KEY=your_ezsite_api_key_here
VITE_EZSITE_PROJECT_ID=your_project_id_here
```

### 📊 Table IDs Configuration

Update these IDs based on your EzSite project setup:

```env
# EzSite Table IDs
VITE_USERS_TABLE_ID=10400
VITE_PRODUCTS_TABLE_ID=10401
VITE_ORDERS_TABLE_ID=10402
VITE_CATEGORIES_TABLE_ID=10403
VITE_CART_TABLE_ID=10404
VITE_WISHLIST_TABLE_ID=10399
VITE_REVIEWS_TABLE_ID=10405
VITE_CAMPAIGNS_TABLE_ID=10406
VITE_BANNERS_TABLE_ID=10407
VITE_INVOICES_TABLE_ID=10408
VITE_PAYMENTS_TABLE_ID=10409
VITE_SHIPPING_TABLE_ID=10410
VITE_COUPONS_TABLE_ID=10411
VITE_NOTIFICATIONS_TABLE_ID=10412
VITE_MESSAGES_TABLE_ID=10413
VITE_ANALYTICS_TABLE_ID=10414
VITE_BLOG_POSTS_TABLE_ID=10420
VITE_BLOG_CATEGORIES_TABLE_ID=10421
VITE_BLOG_AUTHORS_TABLE_ID=10422
VITE_BLOG_COMMENTS_TABLE_ID=10423
```

### 💳 Payment Gateway Configuration

#### Stripe (Credit/Debit Cards)
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
VITE_STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

#### PayPal
```env
VITE_PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
```

#### Razorpay (For Indian market)
```env
VITE_RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

### 📧 Email Configuration

```env
# Email Service Configuration
VITE_EMAIL_SERVICE_URL=https://your-email-service.com/api
VITE_EMAIL_API_KEY=your_email_api_key_here

# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password_here

# Email Templates
VITE_EMAIL_FROM_NAME=MANAfoods
VITE_EMAIL_FROM_ADDRESS=noreply@manafoods.com
VITE_EMAIL_SUPPORT_ADDRESS=support@manafoods.com
```

### 🔔 Notification Services

#### Firebase Cloud Messaging (Push Notifications)
```env
VITE_FCM_VAPID_KEY=your_fcm_vapid_key
FCM_SERVER_KEY=your_fcm_server_key
```

#### WhatsApp Business API
```env
VITE_WHATSAPP_BUSINESS_API_URL=https://graph.facebook.com/v18.0
VITE_WHATSAPP_ACCESS_TOKEN=your_whatsapp_access_token
VITE_WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
```

### 🗺️ Google Services

```env
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
VITE_GOOGLE_ANALYTICS_ID=GA-XXXXX-X
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
```

### 🔥 Firebase Configuration

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

### 📈 Analytics and Monitoring

```env
# Sentry (Error Tracking)
VITE_SENTRY_DSN=your_sentry_dsn_here

# Mixpanel (Analytics)
VITE_MIXPANEL_TOKEN=your_mixpanel_token

# Hotjar (User Behavior)
VITE_HOTJAR_ID=your_hotjar_id
```

### 🔒 Security Configuration

```env
# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=your_refresh_token_secret_here
JWT_REFRESH_EXPIRES_IN=7d

# Encryption Keys
ENCRYPTION_KEY=your_32_character_encryption_key_here
HASH_SALT_ROUNDS=12
```

### 🎛️ Feature Flags

Enable or disable features by setting these to `true` or `false`:

```env
VITE_ENABLE_BLOG=true
VITE_ENABLE_WISHLIST=true
VITE_ENABLE_REVIEWS=true
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_CHAT_SUPPORT=true
VITE_ENABLE_SOCIAL_LOGIN=true
VITE_ENABLE_PAYMENT_GATEWAY=true
VITE_ENABLE_MULTI_LANGUAGE=false
VITE_ENABLE_DARK_MODE=true
VITE_ENABLE_PWA=true
```

## 🔧 Development vs Production

### Development Environment
```env
NODE_ENV=development
VITE_DEBUG_MODE=true
VITE_SHOW_DEBUG_INFO=true
```

### Production Environment
```env
NODE_ENV=production
VITE_DEBUG_MODE=false
VITE_SHOW_DEBUG_INFO=false
VITE_PRODUCTION_URL=https://manafoods.com
VITE_API_BASE_URL=https://api.manafoods.com
```

## 🛡️ Security Best Practices

### ✅ DO:
- Keep your `.env` file in `.gitignore`
- Use different API keys for development and production
- Regularly rotate your API keys and secrets
- Use environment-specific configurations
- Validate environment variables in your code

### ❌ DON'T:
- Commit `.env` files to version control
- Share API keys in public channels
- Use production keys in development
- Hardcode sensitive values in your code

## 📝 Getting API Keys

### EzSite API
1. Sign up at [EzSite](https://ezsite.com)
2. Create a new project
3. Navigate to API settings
4. Copy your API key and project ID

### Stripe
1. Sign up at [Stripe](https://stripe.com)
2. Go to Dashboard → Developers → API keys
3. Copy your publishable and secret keys
4. Set up webhooks for payment events

### Firebase
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Go to Project Settings → General
4. Copy your config values

### WhatsApp Business API
1. Set up [WhatsApp Business API](https://developers.facebook.com/docs/whatsapp)
2. Get your access token from Facebook Developer Console
3. Configure webhook endpoints

## 🔍 Validation

The application includes built-in validation for environment variables:

```typescript
import { validateEnv } from '@/config/env';

const validation = validateEnv();
if (!validation.isValid) {
  console.error('Environment validation failed:', validation.errors);
}
```

## 🆘 Troubleshooting

### Common Issues

1. **"Missing required environment variable"**
   - Check if the variable is set in your `.env` file
   - Ensure there are no typos in variable names
   - Restart your development server

2. **"API key invalid"**
   - Verify your API key is correct
   - Check if the key has the required permissions
   - Ensure you're using the right environment (dev/prod)

3. **"Environment variables not loading"**
   - Make sure `.env` file is in the project root
   - Check file permissions
   - Ensure variables start with `VITE_` for client-side access

### Getting Help

- Check the [EzSite Documentation](https://docs.ezsite.com)
- Review the application logs for specific error messages
- Contact support with your configuration (without sharing sensitive keys)

## 📁 File Structure

```
project-root/
├── .env                 # Your actual environment variables (DO NOT commit)
├── env.example          # Template file (safe to commit)
├── setup-env.js         # Automated setup script
├── src/config/env.ts    # Environment configuration utility
└── ENVIRONMENT_SETUP.md # This documentation
```

## 🎯 Next Steps

1. Complete the environment setup
2. Test your configuration by running the development server
3. Configure payment gateways for your region
4. Set up analytics and monitoring
5. Configure email templates
6. Test all integrations before going live

---

**Need help?** Check the troubleshooting section or contact support with your configuration details (without sharing sensitive keys). 