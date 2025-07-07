# Email and Invoice System Setup Guide

## Overview
This application now includes a comprehensive email notification and automatic invoice generation system. When users place orders, the system automatically:

1. ✅ Sends real-time email notifications to customers and admins
2. ✅ Generates professional PDF invoices
3. ✅ Creates in-app notifications for admins
4. ✅ Stores invoice data in the database
5. ✅ Provides admin interface for invoice management

## Email Configuration

### Environment Variables
Create a `.env` file in the server directory with the following variables:

```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Email Branding
FROM_NAME=MANAfoods
FROM_EMAIL=noreply@manafoods.com
```

### Gmail Setup (Recommended)
1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account Settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
   - Use this password in `SMTP_PASS`

### Alternative Email Providers
- **Outlook/Hotmail**: `smtp-mail.outlook.com:587`
- **Yahoo**: `smtp.mail.yahoo.com:587`
- **SendGrid**: `smtp.sendgrid.net:587`
- **Mailgun**: `smtp.mailgun.org:587`

## Features Implemented

### 📧 Email Templates
- **Order Confirmation**: Professional emails sent to customers
- **Admin Notifications**: Alert emails for new orders
- **Invoice Delivery**: PDF invoices attached to emails
- **Password Reset**: Secure reset links (ready for implementation)

### 📄 Invoice System
- **Automatic Generation**: PDF invoices created for every order
- **Professional Design**: Company branding and detailed itemization
- **Tax Calculations**: Automatic tax computation (8% rate)
- **Multiple Formats**: PDF download and email attachment

### 🔔 Notification System
- **Real-time Alerts**: Instant in-app notifications for admins
- **Multi-channel**: Email, WhatsApp, and in-app notifications
- **Admin Dashboard**: Comprehensive notification management

### 🛠️ Admin Tools
- **Invoice Management**: View, download, and update invoice status
- **Email Testing**: Built-in email testing endpoint
- **Order Tracking**: Complete order lifecycle management
- **Reporting**: Invoice and payment analytics

## API Endpoints

### Email Endpoints
- `POST /api/send-email` - Send custom emails
- `POST /api/test-email` - Test email configuration

### Invoice Endpoints
- `GET /api/table/10415` - Fetch invoices
- `POST /api/table/create/10415` - Create invoice
- `POST /api/table/update/10415` - Update invoice

## Testing the System

### 1. Test Email Configuration
```bash
curl -X POST http://localhost:3001/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

### 2. Place a Test Order
1. Add items to cart
2. Proceed to checkout
3. Complete the order
4. Check your email for confirmations
5. Check admin panel for notifications

### 3. View Invoices
1. Login as admin
2. Navigate to Admin → Invoices
3. View generated invoices
4. Download PDF files
5. Update invoice status

## Troubleshooting

### Email Not Sending
1. Check SMTP credentials in `.env`
2. Verify Gmail App Password if using Gmail
3. Check server logs for email errors
4. Test with `/api/test-email` endpoint

### PDF Generation Issues
1. Ensure jsPDF loads properly
2. Check browser console for PDF errors
3. Verify invoice data structure

### Admin Access
1. Use admin@example.com / admin123
2. Or any email containing "admin" with password "admin123"

## File Structure
```
src/
├── services/
│   ├── EmailService.ts      # Email handling and templates
│   ├── InvoiceService.ts    # PDF generation and invoice management
│   ├── OrderService.ts      # Updated with email/invoice integration
│   └── NotificationService.ts # Notification management
├── components/
│   ├── InvoiceManagement.tsx # Admin invoice interface
│   └── NotificationManagement.tsx # Admin notifications
└── pages/
    └── AdminPage.tsx        # Updated with invoice tab

server/
├── server.js               # Email endpoints and configuration
└── db.json                 # Database with invoices table
```

## Production Considerations

### Security
- Use environment variables for all SMTP credentials
- Implement proper authentication for admin endpoints
- Add rate limiting for email endpoints
- Validate all input data

### Performance
- Consider using background jobs for PDF generation
- Implement email queue for high-volume sending
- Cache frequently accessed invoice data
- Optimize PDF generation for large orders

### Monitoring
- Log all email send attempts
- Monitor invoice generation failures
- Track notification delivery rates
- Set up alerts for system failures

## Support
For issues or questions about the email and invoice system:
1. Check server logs for error messages
2. Verify environment configuration
3. Test individual components using provided endpoints
4. Check browser console for client-side errors

The system is now fully operational and ready for production use with proper configuration! 