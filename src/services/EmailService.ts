export interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

export interface EmailConfig {
  smtp: {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    };
  };
  from: {
    name: string;
    email: string;
  };
}

// Admin email configuration - Frontend constants only
const ADMIN_EMAIL_CONFIG = {
  ADMIN_EMAILS: ['admin@manaeats.com', 'orders@manaeats.com', 'support@manaeats.com'],
  CUSTOMER_SUPPORT_EMAIL: 'support@manaeats.com',
  NOTIFICATIONS_EMAIL: 'notifications@manaeats.com',
  SENDER_NAME: 'MANAfoods',
  SENDER_EMAIL: 'no-reply@manaeats.com'
};

export interface EmailData {
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  subject: string;
  html: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    content: Uint8Array | string;
    contentType?: string;
  }>;
  headers?: { [key: string]: string };
}

export class EmailService {
  // Email templates
  private static templates = {
    orderConfirmation: (orderData: any): EmailTemplate => ({
      subject: `Order Confirmation #${orderData.id} - MANAfoods`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Confirmation</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
            .order-details { background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e2e8f0; }
            .total { font-weight: bold; font-size: 18px; margin-top: 15px; padding-top: 15px; border-top: 2px solid #2563eb; }
            .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">MANAfoods</div>
              <h1>Order Confirmation</h1>
              <p>Thank you for your order! We're preparing your delicious pickles.</p>
            </div>
            
            <div class="order-details">
              <h2>Order Details</h2>
              <p><strong>Order ID:</strong> ${orderData.id}</p>
              <p><strong>Order Date:</strong> ${new Date(orderData.order_date).toLocaleDateString()}</p>
              <p><strong>Tracking Number:</strong> ${orderData.tracking_number}</p>
              <p><strong>Estimated Delivery:</strong> ${new Date(orderData.estimated_delivery).toLocaleDateString()}</p>
            </div>

            <div class="order-details">
              <h2>Items Ordered</h2>
              ${orderData.items?.map((item: any) => `
                <div class="item">
                  <span>${item.product_name} (x${item.quantity})</span>
                  <span>$${(item.product_price * item.quantity).toFixed(2)}</span>
                </div>
              `).join('') || '<p>Item details will be updated shortly.</p>'}
              
              <div class="total">
                <div style="display: flex; justify-content: space-between;">
                  <span>Total Amount:</span>
                  <span>$${orderData.order_total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div class="order-details">
              <h2>Shipping Information</h2>
              <p><strong>Payment Method:</strong> ${orderData.payment_method}</p>
              <p><strong>Status:</strong> ${orderData.order_status}</p>
            </div>

            <div class="footer">
              <p>Questions? Contact us at ${ADMIN_EMAIL_CONFIG.CUSTOMER_SUPPORT_EMAIL}</p>
              <p>© 2024 MANAfoods. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Order Confirmation - MANAfoods
        
        Thank you for your order!
        
        Order ID: ${orderData.id}
        Order Date: ${new Date(orderData.order_date).toLocaleDateString()}
        Tracking Number: ${orderData.tracking_number}
        Total Amount: $${orderData.order_total.toFixed(2)}
        
        We're preparing your delicious pickles and will notify you when they ship.
        
        Questions? Contact us at ${ADMIN_EMAIL_CONFIG.CUSTOMER_SUPPORT_EMAIL}
      `
    }),

    adminOrderNotification: (orderData: any): EmailTemplate => ({
      subject: `New Order Alert #${orderData.id} - Admin Notification`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Order Alert</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
            .alert { background-color: #fee2e2; border: 1px solid #fecaca; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
            .order-summary { background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .action-buttons { text-align: center; margin: 30px 0; }
            .button { display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 0 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="alert">
              <h1>🔔 New Order Received!</h1>
              <p>A new order has been placed and requires your attention.</p>
            </div>
            
            <div class="order-summary">
              <h2>Order Summary</h2>
              <p><strong>Order ID:</strong> ${orderData.id}</p>
              <p><strong>Customer ID:</strong> ${orderData.user_id}</p>
              <p><strong>Order Total:</strong> $${orderData.order_total.toFixed(2)}</p>
              <p><strong>Payment Method:</strong> ${orderData.payment_method}</p>
              <p><strong>Order Date:</strong> ${new Date(orderData.order_date).toLocaleString()}</p>
              <p><strong>Status:</strong> ${orderData.order_status}</p>
            </div>

            <div class="action-buttons">
              <a href="#" class="button">View Order Details</a>
              <a href="#" class="button">Process Order</a>
            </div>

            <p style="text-align: center; color: #64748b;">
              Please process this order promptly to maintain customer satisfaction.
            </p>
          </div>
        </body>
        </html>
      `,
      text: `
        New Order Alert!
        
        Order ID: ${orderData.id}
        Customer ID: ${orderData.user_id}
        Total: $${orderData.order_total.toFixed(2)}
        Payment: ${orderData.payment_method}
        Date: ${new Date(orderData.order_date).toLocaleString()}
        
        Please process this order promptly.
      `
    }),

    enhancedAdminOrderNotification: (orderData: any, orderItems: any[], customerInfo?: any): EmailTemplate => ({
      subject: `🛒 New Order #${orderData.id} - $${orderData.order_total.toFixed(2)} - Immediate Action Required`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Enhanced Order Notification</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4; }
            .container { max-width: 700px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 15px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 30px; }
            .priority-badge { background-color: #dc2626; color: white; padding: 5px 15px; border-radius: 20px; font-size: 12px; font-weight: bold; display: inline-block; margin-bottom: 10px; }
            .order-details { background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6; }
            .customer-info { background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 15px 0; }
            .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .items-table th, .items-table td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
            .items-table th { background-color: #f3f4f6; font-weight: bold; }
            .total-section { background-color: #ecfdf5; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: right; }
            .action-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 30px 0; }
            .action-button { display: block; padding: 15px; text-align: center; text-decoration: none; border-radius: 8px; font-weight: bold; transition: all 0.3s ease; }
            .primary-action { background-color: #059669; color: white; }
            .secondary-action { background-color: #6366f1; color: white; }
            .urgent-note { background-color: #fef2f2; border: 1px solid #fecaca; padding: 15px; border-radius: 8px; margin: 20px 0; }
            .stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin: 20px 0; }
            .stat-box { background-color: #f9fafb; padding: 15px; border-radius: 8px; text-align: center; }
            .stat-number { font-size: 24px; font-weight: bold; color: #1f2937; }
            .stat-label { font-size: 12px; color: #6b7280; text-transform: uppercase; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="priority-badge">HIGH PRIORITY</div>
              <h1 style="margin: 0; font-size: 28px;">🛒 New Order Received!</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Order #${orderData.id} requires immediate processing</p>
            </div>

            <div class="stats-row">
              <div class="stat-box">
                <div class="stat-number">$${orderData.order_total.toFixed(2)}</div>
                <div class="stat-label">Order Value</div>
              </div>
              <div class="stat-box">
                <div class="stat-number">${orderItems?.length || 0}</div>
                <div class="stat-label">Items</div>
              </div>
              <div class="stat-box">
                <div class="stat-number">${orderData.payment_method}</div>
                <div class="stat-label">Payment</div>
              </div>
            </div>

            <div class="order-details">
              <h2 style="margin-top: 0; color: #1f2937;">📋 Order Details</h2>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div>
                  <p><strong>Order ID:</strong> ${orderData.id}</p>
                  <p><strong>Order Date:</strong> ${new Date(orderData.order_date).toLocaleString()}</p>
                  <p><strong>Status:</strong> <span style="background-color: #fbbf24; color: #92400e; padding: 2px 8px; border-radius: 4px; font-size: 12px;">${orderData.order_status.toUpperCase()}</span></p>
                </div>
                <div>
                  <p><strong>Customer ID:</strong> ${orderData.user_id}</p>
                  <p><strong>Tracking:</strong> ${orderData.tracking_number || 'TBD'}</p>
                  <p><strong>Estimated Delivery:</strong> ${orderData.estimated_delivery ? new Date(orderData.estimated_delivery).toLocaleDateString() : 'TBD'}</p>
                </div>
              </div>
            </div>

            ${customerInfo ? `
            <div class="customer-info">
              <h3 style="margin-top: 0; color: #92400e;">👤 Customer Information</h3>
              <p><strong>Name:</strong> ${customerInfo.name || 'N/A'}</p>
              <p><strong>Email:</strong> ${customerInfo.email || 'N/A'}</p>
              <p><strong>Phone:</strong> ${customerInfo.phone || 'N/A'}</p>
            </div>
            ` : ''}

            ${orderItems && orderItems.length > 0 ? `
            <div style="margin: 25px 0;">
              <h3 style="color: #1f2937;">🛍️ Order Items</h3>
              <table class="items-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${orderItems.map(item => `
                    <tr>
                      <td>
                        <strong>${item.product_name || item.name}</strong>
                        ${item.description ? `<br><small style="color: #6b7280;">${item.description}</small>` : ''}
                      </td>
                      <td>${item.quantity}</td>
                      <td>$${(item.product_price || item.price).toFixed(2)}</td>
                      <td><strong>$${((item.product_price || item.price) * item.quantity).toFixed(2)}</strong></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
            ` : ''}

            <div class="total-section">
              <h3 style="margin: 0; color: #065f46;">💰 Order Total: $${orderData.order_total.toFixed(2)}</h3>
            </div>

            <div class="urgent-note">
              <h4 style="margin-top: 0; color: #dc2626;">⚠️ Action Required</h4>
              <p style="margin-bottom: 0; color: #7f1d1d;">This order requires immediate attention. Please process within the next 2 hours to maintain our service level agreement.</p>
            </div>

            <div class="action-grid">
              <a href="/admin/orders/${orderData.id}" class="action-button primary-action">
                📋 Process Order Now
              </a>
              <a href="/admin/orders" class="action-button secondary-action">
                📊 View All Orders
              </a>
            </div>

            <div style="text-align: center; margin-top: 30px; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
              <p style="margin: 0; color: #6b7280; font-size: 14px;">
                📧 This is an automated notification from MANAfoods Order Management System<br>
                🕐 Received at ${new Date().toLocaleString()}
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
🛒 NEW ORDER ALERT - HIGH PRIORITY

Order Details:
- Order ID: ${orderData.id}
- Total: $${orderData.order_total.toFixed(2)}
- Items: ${orderItems?.length || 0}
- Customer: ${orderData.user_id}
- Payment: ${orderData.payment_method}
- Date: ${new Date(orderData.order_date).toLocaleString()}
- Status: ${orderData.order_status}
${customerInfo ? `
Customer Info:
- Name: ${customerInfo.name || 'N/A'}
- Email: ${customerInfo.email || 'N/A'}
- Phone: ${customerInfo.phone || 'N/A'}` : ''}
${orderItems && orderItems.length > 0 ? `
Order Items:
${orderItems.map(item => `- ${item.product_name || item.name} (${item.quantity}x) - $${((item.product_price || item.price) * item.quantity).toFixed(2)}`).join('\n')}` : ''}

⚠️ ACTION REQUIRED
This order requires immediate attention. Please process within the next 2 hours.

📧 MANAfoods Order Management System
🕐 ${new Date().toLocaleString()}
      `
    }),

    invoiceEmail: (invoiceData: any): EmailTemplate => ({
      subject: `Invoice #${invoiceData.invoice_number} - MANAfoods`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Invoice</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
            .invoice-info { background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .attachment-note { background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">MANAfoods</div>
              <h1>Invoice</h1>
            </div>
            
            <p>Dear Customer,</p>
            <p>Thank you for your purchase! Please find your invoice attached to this email.</p>
            
            <div class="invoice-info">
              <h2>Invoice Details</h2>
              <p><strong>Invoice Number:</strong> ${invoiceData.invoice_number}</p>
              <p><strong>Order ID:</strong> ${invoiceData.order_id}</p>
              <p><strong>Invoice Date:</strong> ${new Date(invoiceData.invoice_date).toLocaleDateString()}</p>
              <p><strong>Total Amount:</strong> $${invoiceData.total_amount.toFixed(2)}</p>
            </div>

            <div class="attachment-note">
              <p><strong>📎 Attachment:</strong> Your detailed invoice is attached as a PDF file.</p>
            </div>

            <p>If you have any questions about this invoice, please contact our support team.</p>
            
            <div style="text-align: center; margin-top: 30px; color: #64748b; font-size: 14px;">
              <p>Questions? Contact us at ${ADMIN_EMAIL_CONFIG.CUSTOMER_SUPPORT_EMAIL}</p>
              <p>© 2024 MANAfoods. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Invoice - MANAfoods
        
        Dear Customer,
        
        Thank you for your purchase! Please find your invoice attached.
        
        Invoice Number: ${invoiceData.invoice_number}
        Order ID: ${invoiceData.order_id}
        Invoice Date: ${new Date(invoiceData.invoice_date).toLocaleDateString()}
        Total Amount: $${invoiceData.total_amount.toFixed(2)}
        
        Questions? Contact us at ${ADMIN_EMAIL_CONFIG.CUSTOMER_SUPPORT_EMAIL}
      `
    })
  };

  // Send email using server-side SMTP configuration
  static async sendEmail(emailData: EmailData): Promise<{ success: boolean; error?: string }> {
    try {
      // Send email data to server (server handles SMTP configuration)
      const emailPayload = {
        ...emailData,
        from: `${ADMIN_EMAIL_CONFIG.SENDER_NAME} <${ADMIN_EMAIL_CONFIG.SENDER_EMAIL}>`
      };

      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailPayload)
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to send email');
      }

      console.log('Email sent successfully:', {
        to: emailData.to,
        subject: emailData.subject,
        from: ADMIN_EMAIL_CONFIG.SENDER_EMAIL
      });

      return { success: true };
    } catch (error) {
      console.error('Error sending email:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  // Send order confirmation email
  static async sendOrderConfirmation(orderData: any, customerEmail: string): Promise<{ success: boolean; error?: string }> {
    const template = this.templates.orderConfirmation(orderData);
    
    return this.sendEmail({
      to: customerEmail,
      subject: template.subject,
      html: template.html,
      text: template.text
    });
  }

  // Send admin order notification with enhanced error handling and retry logic
  static async sendAdminOrderNotification(orderData: any, adminEmails?: string[]): Promise<{ success: boolean; error?: string }> {
    const template = this.templates.adminOrderNotification(orderData);
    
    // Use provided admin emails or default to configured admin emails
    const emailsToSend = adminEmails || ADMIN_EMAIL_CONFIG.ADMIN_EMAILS;
    
    console.log('EmailService: Sending admin order notification to:', emailsToSend);
    
    // Try sending with retry logic
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
      attempts++;
      console.log(`EmailService: Admin order notification attempt ${attempts}/${maxAttempts}`);
      
      const result = await this.sendEmail({
        to: emailsToSend,
        subject: template.subject,
        html: template.html,
        text: template.text,
        // Add high priority for admin notifications
        headers: {
          'X-Priority': '1',
          'X-MSMail-Priority': 'High',
          'Importance': 'high'
        }
      });
      
      if (result.success) {
        console.log('EmailService: Admin order notification sent successfully');
        return result;
      }
      
      console.error(`EmailService: Admin order notification attempt ${attempts} failed:`, result.error);
      
      // If not the last attempt, wait before retrying
      if (attempts < maxAttempts) {
        console.log('EmailService: Waiting 2 seconds before retry...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    return {
      success: false,
      error: `Failed to send admin order notification after ${maxAttempts} attempts`
    };
  }

  // Send enhanced admin order notification with order details
  static async sendEnhancedAdminOrderNotification(orderData: any, orderItems: any[], customerInfo?: any): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('EmailService: Sending enhanced admin order notification');
      
      const template = this.templates.enhancedAdminOrderNotification(orderData, orderItems, customerInfo);
      
      return this.sendAdminOrderNotification(orderData, ADMIN_EMAIL_CONFIG.ADMIN_EMAILS);
    } catch (error) {
      console.error('EmailService: Error in enhanced admin order notification:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error in enhanced notification'
      };
    }
  }

  // Send urgent admin notification (for high-value orders or issues)
  static async sendUrgentAdminNotification(orderData: any, reason: string): Promise<{ success: boolean; error?: string }> {
    const urgentTemplate = {
      subject: `🚨 URGENT: ${reason} - Order #${orderData.id}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Urgent Order Notification</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
            .urgent-alert { background-color: #fee2e2; border: 2px solid #fecaca; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
            .urgent-title { color: #dc2626; font-size: 24px; font-weight: bold; margin: 0; }
            .order-summary { background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; }
            .action-buttons { text-align: center; margin: 30px 0; }
            .button { display: inline-block; padding: 15px 30px; background-color: #dc2626; color: white; text-decoration: none; border-radius: 6px; margin: 0 10px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="urgent-alert">
              <h1 class="urgent-title">🚨 URGENT ATTENTION REQUIRED</h1>
              <p style="color: #dc2626; font-size: 16px; margin: 10px 0 0 0;"><strong>Reason:</strong> ${reason}</p>
            </div>
            
            <div class="order-summary">
              <h2 style="color: #92400e; margin-top: 0;">Order Details</h2>
              <p><strong>Order ID:</strong> ${orderData.id}</p>
              <p><strong>Customer ID:</strong> ${orderData.user_id}</p>
              <p><strong>Order Total:</strong> $${orderData.order_total?.toFixed(2) || '0.00'}</p>
              <p><strong>Payment Method:</strong> ${orderData.payment_method}</p>
              <p><strong>Order Date:</strong> ${new Date(orderData.order_date).toLocaleString()}</p>
              <p><strong>Status:</strong> ${orderData.order_status}</p>
            </div>

            <div class="action-buttons">
              <a href="#" class="button">Review Order Immediately</a>
              <a href="#" class="button" style="background-color: #1f2937;">Contact Customer</a>
            </div>

            <p style="text-align: center; color: #dc2626; font-weight: bold; margin-top: 30px;">
              ⚠️ This order requires immediate attention. Please take action promptly.
            </p>
          </div>
        </body>
        </html>
      `,
      text: `
URGENT ATTENTION REQUIRED!

Reason: ${reason}

Order ID: ${orderData.id}
Customer ID: ${orderData.user_id}
Total: $${orderData.order_total?.toFixed(2) || '0.00'}
Payment: ${orderData.payment_method}
Date: ${new Date(orderData.order_date).toLocaleString()}

This order requires immediate attention. Please take action promptly.
      `
    };

    return this.sendEmail({
      to: ADMIN_EMAIL_CONFIG.ADMIN_EMAILS,
      subject: urgentTemplate.subject,
      html: urgentTemplate.html,
      text: urgentTemplate.text,
      // Highest priority for urgent notifications
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'high'
      }
    });
  }

  // Send invoice email with PDF attachment
  static async sendInvoiceEmail(
    invoiceData: any, 
    customerEmail: string, 
    pdfData: Uint8Array
  ): Promise<{ success: boolean; error?: string }> {
    const template = this.templates.invoiceEmail(invoiceData);
    
    return this.sendEmail({
      to: customerEmail,
      subject: template.subject,
      html: template.html,
      text: template.text,
      attachments: [
        {
          filename: `invoice-${invoiceData.invoice_number}.pdf`,
          content: pdfData,
          contentType: 'application/pdf'
        }
      ]
    });
  }

  // Send password reset email
  static async sendPasswordResetEmail(userEmail: string, resetToken: string): Promise<{ success: boolean; error?: string }> {
    const resetUrl = `${window.location.origin}/reset-password?token=${resetToken}`;
    
    return this.sendEmail({
      to: userEmail,
      subject: 'Password Reset - MANAfoods',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1>Password Reset Request</h1>
          <p>You requested a password reset for your MANAfoods account.</p>
          <p>Click the button below to reset your password:</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px;">Reset Password</a>
          <p>If you didn't request this reset, please ignore this email.</p>
          <p>This link will expire in 1 hour.</p>
        </div>
      `,
      text: `Password Reset Request\n\nClick this link to reset your password: ${resetUrl}\n\nIf you didn't request this reset, please ignore this email.`
    });
  }

  // Send notification email
  static async sendNotificationEmail(
    userEmail: string, 
    notification: { title: string; message: string; type: string }
  ): Promise<{ success: boolean; error?: string }> {
    return this.sendEmail({
      to: userEmail,
      subject: `${notification.title} - MANAfoods`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1>${notification.title}</h1>
          <p>${notification.message}</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #64748b; font-size: 14px;">
            <p>© 2024 MANAfoods. All rights reserved.</p>
          </div>
        </div>
      `,
      text: `${notification.title}\n\n${notification.message}`
    });
  }

  // Send contact form email to admin
  static async sendContactFormEmail(formData: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }): Promise<{ success: boolean; error?: string }> {
    return this.sendEmail({
      to: ADMIN_EMAIL_CONFIG.ADMIN_EMAILS,
      subject: `New Contact Form Submission: ${formData.subject}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Contact Form Submission</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
            .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #2563eb; }
            .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
            .contact-info { background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .message-content { background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; }
            .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">MANAfoods</div>
              <h1>New Contact Form Submission</h1>
            </div>
            
            <div class="contact-info">
              <h2>Contact Details</h2>
              <p><strong>Name:</strong> ${formData.name}</p>
              <p><strong>Email:</strong> ${formData.email}</p>
              <p><strong>Subject:</strong> ${formData.subject}</p>
              <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
            </div>

            <div class="message-content">
              <h2>Message</h2>
              <p style="white-space: pre-wrap; line-height: 1.6;">${formData.message}</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <p><strong>Action Required:</strong> Please respond to this inquiry promptly.</p>
              <p>Reply directly to: <a href="mailto:${formData.email}">${formData.email}</a></p>
            </div>

            <div class="footer">
              <p>This message was sent from the MANAfoods contact form.</p>
              <p>© 2024 MANAfoods. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        New Contact Form Submission - MANAfoods
        
        Contact Details:
        Name: ${formData.name}
        Email: ${formData.email}
        Subject: ${formData.subject}
        Submitted: ${new Date().toLocaleString()}
        
        Message:
        ${formData.message}
        
        Please respond to this inquiry promptly.
        Reply directly to: ${formData.email}
      `
    });
  }

  // Send contact confirmation email to user
  static async sendContactConfirmationEmail(
    userEmail: string, 
    userName: string
  ): Promise<{ success: boolean; error?: string }> {
    return this.sendEmail({
      to: userEmail,
      subject: 'Thank you for contacting MANAfoods - We\'ll be in touch soon!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Contact Confirmation</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
            .confirmation-box { background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb; }
            .next-steps { background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">MANAfoods</div>
              <h1>Thank You for Contacting Us!</h1>
            </div>
            
            <div class="confirmation-box">
              <h2>✅ Message Received</h2>
              <p>Dear ${userName},</p>
              <p>Thank you for reaching out to MANAfoods! We have successfully received your message and our team will review it shortly.</p>
            </div>

            <div class="next-steps">
              <h2>What happens next?</h2>
              <ul>
                <li>🔍 Our team will review your inquiry within 24 hours</li>
                <li>📧 You'll receive a personalized response via email</li>
                <li>📞 For urgent matters, we may contact you directly</li>
              </ul>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <p><strong>Need immediate assistance?</strong></p>
              <p>Email: ${ADMIN_EMAIL_CONFIG.CUSTOMER_SUPPORT_EMAIL}</p>
              <p>Phone: +91 98765 43210</p>
            </div>

            <div class="footer">
              <p>Questions? Contact us at ${ADMIN_EMAIL_CONFIG.CUSTOMER_SUPPORT_EMAIL}</p>
              <p>© 2024 MANAfoods. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Thank You for Contacting MANAfoods!
        
        Dear ${userName},
        
        Thank you for reaching out to MANAfoods! We have successfully received your message and our team will review it shortly.
        
        What happens next?
        - Our team will review your inquiry within 24 hours
        - You'll receive a personalized response via email
        - For urgent matters, we may contact you directly
        
        Need immediate assistance?
        Email: ${ADMIN_EMAIL_CONFIG.CUSTOMER_SUPPORT_EMAIL}
        Phone: +91 98765 43210
        
        Questions? Contact us at ${ADMIN_EMAIL_CONFIG.CUSTOMER_SUPPORT_EMAIL}
      `
    });
  }
} 