# Email Configuration Setup

## Environment Variables

Create a `.env` file in your project root with the following configuration:

```env
# Email Configuration
EMAIL_PASSWORD=Your_mailbox_password_here

# Server Configuration
PORT=3001

# Email Settings for MANAfoods (already configured)
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=no-reply@manaeats.com

# Admin Email Addresses
ADMIN_EMAILS=admin@manaeats.com,orders@manaeats.com,support@manaeats.com
```

## Current Email Configuration

Your email system is now configured with the following settings:

### SMTP Settings ✅
- **Host**: smtp.hostinger.com
- **Port**: 465
- **Security**: SSL
- **Username**: no-reply@manaeats.com
- **Password**: Set via EMAIL_PASSWORD environment variable

### Email Addresses ✅
- **Sender**: no-reply@manaeats.com
- **Admin Emails**: 
  - admin@manaeats.com
  - orders@manaeats.com
  - support@manaeats.com

## Test Email Endpoint

Test your email configuration by making a POST request to:
```
POST http://localhost:3001/api/test-email
```

This will send a test email to admin@manaeats.com

## Email Types Configured

1. **Order Confirmation Emails** - Sent to customers
2. **Admin Order Notifications** - Sent to admin emails when new orders are placed
3. **Invoice Emails** - Sent with PDF attachments
4. **Password Reset Emails** - For account recovery
5. **General Notifications** - System notifications

## Security Notes

- Store your email password in environment variables, not in code
- Use strong passwords for your email account
- Enable 2FA on your email account if possible
- Consider using app-specific passwords if available 