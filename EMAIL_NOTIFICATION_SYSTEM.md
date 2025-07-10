# Email Notification System for Order Management

## Overview

This enhanced email notification system automatically sends notifications to administrators when customers place orders. The system includes both email notifications and in-app notifications with robust error handling, retry logic, and multiple notification types.

## Features

### 🔔 **Admin Email Notifications**
- **Basic Admin Notifications**: Simple order alerts with essential information
- **Enhanced Admin Notifications**: Detailed order summaries with customer info and order items
- **Urgent Admin Notifications**: High-priority alerts for high-value orders or special cases
- **Retry Logic**: Automatic retry mechanism for failed email deliveries
- **Fallback System**: Falls back to basic notifications if enhanced notifications fail

### 📱 **In-App Notifications**
- Real-time notifications for admin users
- Unread count badges
- Notification management (mark as read, delete)
- Rich notification metadata

### 📧 **Customer Email Notifications**
- Order confirmation emails
- Invoice emails with PDF attachments
- Professional email templates with MANAfoods branding

## Implementation Details

### Email Service (`src/services/EmailService.ts`)

#### Key Features:
- **Professional Email Templates**: HTML and text versions for all email types
- **Priority Headers**: High-priority emails for admin notifications
- **Retry Logic**: Automatic retry for failed admin notifications (up to 3 attempts)
- **Enhanced Templates**: Rich HTML templates with order details, customer info, and action buttons

#### Email Types:
1. **Order Confirmation** - Sent to customers
2. **Admin Order Notification** - Basic admin alert
3. **Enhanced Admin Order Notification** - Detailed admin alert with full order breakdown
4. **Urgent Admin Notification** - High-priority alerts for special cases
5. **Invoice Email** - Invoice delivery with PDF attachment

### Order Service Integration (`src/services/OrderService.ts`)

#### Enhanced Notification Flow:
1. **Order Creation**: When a customer places an order
2. **In-App Notifications**: Creates notifications for all admin users
3. **Email Notifications**: Sends enhanced admin notifications with fallback
4. **High-Value Detection**: Automatically detects orders over $100 for urgent notifications
5. **Customer Communications**: Sends order confirmation and invoice emails

### Server Configuration (`server/server.js`)

#### Email Server Setup:
- **SMTP Configuration**: Hostinger SMTP with SSL/TLS
- **Email Headers Support**: Priority and importance headers
- **Attachment Support**: PDF invoices and other attachments
- **Error Handling**: Comprehensive error logging and reporting

## Configuration

### Email Settings

Update the email configuration in `server/server.js`:

```javascript
const emailConfig = {
  host: 'smtp.hostinger.com',
  port: 465,
  secure: true, // SSL
  auth: {
    user: 'no-reply@manaeats.com',
    pass: process.env.EMAIL_PASSWORD || 'your-email-password'
  }
};
```

### Admin Email Configuration

Update admin emails in `src/services/EmailService.ts`:

```typescript
const ADMIN_EMAIL_CONFIG = {
  ADMIN_EMAILS: ['admin@manaeats.com', 'orders@manaeats.com', 'support@manaeats.com'],
  CUSTOMER_SUPPORT_EMAIL: 'support@manaeats.com',
  NOTIFICATIONS_EMAIL: 'notifications@manaeats.com',
  SENDER_NAME: 'MANAfoods',
  SENDER_EMAIL: 'no-reply@manaeats.com'
};
```

## Testing

### Email Notification Tester

A comprehensive testing utility is available at `src/utils/EmailNotificationTester.ts`.

#### Usage in Browser Console:

```javascript
// Test email configuration
await EmailNotificationTester.testEmailConfiguration();

// Test individual notification types
await EmailNotificationTester.testBasicAdminNotification();
await EmailNotificationTester.testEnhancedAdminNotification();
await EmailNotificationTester.testUrgentAdminNotification();
await EmailNotificationTester.testCustomerOrderConfirmation();

// Run all tests
await EmailNotificationTester.runAllTests();
```

### Manual Testing

1. **Place a Test Order**: Use the application to place an order
2. **Check Admin Notifications**: Verify in-app notifications appear for admin users
3. **Check Email Delivery**: Verify emails are received at configured admin addresses
4. **Test High-Value Orders**: Place orders over $100 to test urgent notifications

## Notification Types

### 1. Basic Admin Notification
- **Trigger**: Every new order
- **Content**: Essential order information
- **Priority**: Standard

### 2. Enhanced Admin Notification
- **Trigger**: Every new order (primary notification)
- **Content**: Detailed order breakdown with customer info and items
- **Priority**: High
- **Features**: Rich HTML template, order items table, customer details

### 3. Urgent Admin Notification
- **Trigger**: High-value orders (>$100) or special conditions
- **Content**: Critical order alert with immediate action required
- **Priority**: Highest
- **Features**: Red alert styling, urgent action buttons

### 4. Customer Order Confirmation
- **Trigger**: Successful order placement
- **Content**: Order details and tracking information
- **Recipients**: Customer email

### 5. Invoice Email
- **Trigger**: Invoice generation
- **Content**: Invoice details with PDF attachment
- **Recipients**: Customer email

## Email Template Features

### Professional Design
- **Responsive Design**: Works on desktop and mobile devices
- **Brand Consistency**: MANAfoods branding and colors
- **Rich Content**: Order details, customer info, action buttons
- **Accessibility**: Proper contrast and readable fonts

### Content Sections
1. **Header**: Brand logo and notification type
2. **Alert Section**: Priority indicators and main message
3. **Order Details**: Comprehensive order information
4. **Customer Information**: Contact details (when available)
5. **Order Items**: Detailed product breakdown
6. **Action Buttons**: Direct links to admin interface
7. **Footer**: System information and timestamp

## Error Handling

### Retry Logic
- **Automatic Retries**: Up to 3 attempts for admin notifications
- **Delay Between Retries**: 2-second wait between attempts
- **Fallback System**: Falls back to basic notifications if enhanced fails

### Error Logging
- **Comprehensive Logging**: All email attempts are logged
- **Error Details**: Specific error messages for troubleshooting
- **Success Tracking**: Confirmation of successful deliveries

### Graceful Degradation
- **Service Availability**: Order processing continues even if emails fail
- **Multiple Notification Channels**: Both email and in-app notifications
- **Configuration Validation**: Checks email settings before sending

## Monitoring and Maintenance

### Log Monitoring
Monitor server logs for email-related messages:
- `EmailService: Sending admin order notification`
- `Email sent successfully`
- `Error sending email`

### Health Checks
- Use the test email endpoint: `POST /api/test-email`
- Run the EmailNotificationTester utility regularly
- Monitor admin notification delivery rates

### Performance Optimization
- **Async Processing**: All email sending is asynchronous
- **Batch Processing**: Multiple admin emails sent efficiently
- **Connection Pooling**: SMTP connections are reused

## Security Considerations

### Email Security
- **Secure SMTP**: SSL/TLS encryption for all email transmission
- **Authentication**: Proper SMTP authentication
- **Content Validation**: Email content is sanitized

### Access Control
- **Admin-Only**: Admin notifications only sent to configured addresses
- **Customer Privacy**: Customer information only shared with authorized personnel
- **API Security**: Email endpoints require proper authentication

## Troubleshooting

### Common Issues

1. **Emails Not Sending**
   - Check SMTP configuration
   - Verify email credentials
   - Check server network connectivity

2. **Emails in Spam Folder**
   - Configure SPF records
   - Set up DKIM authentication
   - Use proper sender reputation

3. **Template Rendering Issues**
   - Check for JavaScript errors in templates
   - Verify data formatting
   - Test with EmailNotificationTester

### Support Commands

```javascript
// Check email configuration
await EmailNotificationTester.testEmailConfiguration();

// Send test admin notification
await EmailNotificationTester.testBasicAdminNotification();

// Debug email service
console.log(EmailService);
```

## Future Enhancements

### Planned Features
1. **SMS Notifications**: Text message alerts for urgent orders
2. **WhatsApp Integration**: Business WhatsApp notifications
3. **Email Analytics**: Delivery and open rate tracking
4. **Template Customization**: Admin interface for email template editing
5. **Notification Preferences**: User-configurable notification settings

### Integration Options
1. **Slack Integration**: Team notifications via Slack
2. **Discord Webhooks**: Community notifications
3. **Mobile Push Notifications**: Real-time mobile alerts
4. **Webhook Support**: Third-party service integrations

## API Reference

### Email Endpoints

#### Send Email
```
POST /api/send-email
Content-Type: application/json

{
  "to": ["admin@manaeats.com"],
  "subject": "Order Notification",
  "html": "<html>...</html>",
  "text": "Order notification text",
  "headers": {
    "X-Priority": "1",
    "Importance": "high"
  }
}
```

#### Test Email
```
POST /api/test-email
```

### Client-Side Methods

#### EmailService Methods
- `EmailService.sendOrderConfirmation(orderData, customerEmail)`
- `EmailService.sendAdminOrderNotification(orderData, adminEmails)`
- `EmailService.sendEnhancedAdminOrderNotification(orderData, items, customerInfo)`
- `EmailService.sendUrgentAdminNotification(orderData, reason)`
- `EmailService.sendInvoiceEmail(invoice, customerEmail, pdfData)`

## Conclusion

This enhanced email notification system provides a robust, scalable solution for order management communications. With multiple notification types, comprehensive error handling, and professional email templates, it ensures that administrators are promptly notified of new orders while maintaining a professional customer experience.

The system is designed for reliability, with fallback mechanisms and retry logic to ensure critical notifications are delivered even under adverse conditions. Regular testing and monitoring will help maintain optimal performance and delivery rates.
