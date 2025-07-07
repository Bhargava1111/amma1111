# Email Configuration Setup

## Overview
The server uses nodemailer to send emails. To enable email functionality, you need to configure SMTP settings through environment variables.

## Required Environment Variables

Create a `.env` file in the server directory with the following variables:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_NAME=MANAfoods
FROM_EMAIL=noreply@manafoods.com
```

## Gmail Setup Instructions

1. **Enable 2-Factor Authentication**
   - Go to your Google Account settings
   - Enable 2-factor authentication if not already enabled

2. **Generate App Password**
   - Go to Google Account > Security > 2-Step Verification
   - Click on "App passwords" at the bottom
   - Select "Mail" and your device
   - Copy the generated 16-character password

3. **Configure Environment Variables**
   - Set `SMTP_USER` to your Gmail address
   - Set `SMTP_PASS` to the App Password (not your regular password)
   - Keep other settings as shown above

## Alternative Email Providers

For other email providers, adjust the SMTP settings accordingly:

### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
```

### Yahoo
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_SECURE=false
```

## Testing Email Configuration

Once configured, you can test email functionality using:
```bash
curl -X POST http://localhost:3001/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

## Troubleshooting

If you see authentication errors:
1. Make sure you're using an App Password, not your regular password
2. Check that 2-factor authentication is enabled
3. Verify the email address is correct
4. Try regenerating the App Password

The server will automatically disable email functionality if credentials are not properly configured. 