import { EmailService } from './EmailService';
import { WhatsAppService } from './WhatsAppService';
import { InvoiceService } from './InvoiceService';
import { NotificationService } from './NotificationService';
import { Order, OrderItem } from './OrderService';

export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  address?: any;
  userId?: string;
}

export interface InvoiceDeliveryOptions {
  sendEmail: boolean;
  sendWhatsApp: boolean;
  createNotification: boolean;
  emailTemplate?: 'standard' | 'premium' | 'custom';
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  includeTrackingInfo?: boolean;
  customMessage?: string;
}

export interface AutoInvoiceResult {
  success: boolean;
  invoiceId?: string;
  invoiceNumber?: string;
  deliveryResults: {
    email?: { success: boolean; messageId?: string; error?: string };
    whatsapp?: { success: boolean; messageId?: string; error?: string };
    notification?: { success: boolean; notificationId?: string; error?: string };
  };
  invoice?: any;
  error?: string;
}

export class AutoInvoiceService {
  /**
   * Generate and auto-deliver invoice for an order
   */
  static async generateAndDeliverInvoice(
    order: Order,
    orderItems: OrderItem[],
    customerInfo: CustomerInfo,
    options: InvoiceDeliveryOptions = {
      sendEmail: true,
      sendWhatsApp: true,
      createNotification: true,
      priority: 'normal',
      includeTrackingInfo: true
    }
  ): Promise<AutoInvoiceResult> {
    try {
      console.log(`AutoInvoiceService: Processing order ${order.id} for customer ${customerInfo.name}`);

      // 1. Generate the invoice
      const invoice = await InvoiceService.createInvoiceFromOrder(order, orderItems, customerInfo);
      
      if (!invoice) {
        throw new Error('Failed to generate invoice');
      }

      console.log(`AutoInvoiceService: Invoice ${invoice.invoice_number} generated successfully`);

      // 2. Generate PDF
      const invoicePDF = await InvoiceService.generateInvoicePDF(invoice);
      console.log(`AutoInvoiceService: PDF generated for invoice ${invoice.invoice_number}`);

      const deliveryResults: AutoInvoiceResult['deliveryResults'] = {};

      // 3. Send Email if requested
      if (options.sendEmail && customerInfo.email) {
        try {
          console.log(`AutoInvoiceService: Sending invoice email to ${customerInfo.email}`);
          
          const emailResult = await EmailService.sendInvoiceEmail(
            invoice, 
            customerInfo.email, 
            invoicePDF
          );

          deliveryResults.email = {
            success: emailResult.success,
            error: emailResult.error
          };

          if (emailResult.success) {
            console.log(`AutoInvoiceService: Invoice email sent successfully to ${customerInfo.email}`);
          } else {
            console.error(`AutoInvoiceService: Failed to send invoice email: ${emailResult.error}`);
          }
        } catch (emailError: any) {
          console.error('AutoInvoiceService: Email delivery error:', emailError);
          deliveryResults.email = {
            success: false,
            error: emailError.message || 'Failed to send email'
          };
        }
      }

      // 4. Send WhatsApp if requested
      if (options.sendWhatsApp && customerInfo.phone) {
        try {
          console.log(`AutoInvoiceService: Sending WhatsApp invoice notification to ${customerInfo.phone}`);
          
          const whatsappResult = await WhatsAppService.sendInvoiceNotification(
            invoice, 
            customerInfo.phone
          );

          deliveryResults.whatsapp = {
            success: whatsappResult.success,
            error: whatsappResult.error
          };

          if (whatsappResult.success) {
            console.log(`AutoInvoiceService: WhatsApp notification sent successfully to ${customerInfo.phone}`);
          } else {
            console.error(`AutoInvoiceService: Failed to send WhatsApp notification: ${whatsappResult.error}`);
          }
        } catch (whatsappError: any) {
          console.error('AutoInvoiceService: WhatsApp delivery error:', whatsappError);
          deliveryResults.whatsapp = {
            success: false,
            error: whatsappError.message || 'Failed to send WhatsApp'
          };
        }
      }

      // 5. Create in-app notification if requested
      if (options.createNotification && customerInfo.userId) {
        try {
          console.log(`AutoInvoiceService: Creating in-app notification for user ${customerInfo.userId}`);
          
          const notificationResult = await NotificationService.sendSingleNotification({
            userId: customerInfo.userId,
            title: '📄 Invoice Generated',
            message: `Your invoice ${invoice.invoice_number} for order ${order.id} is ready. Total amount: ₹${invoice.total_amount.toFixed(2)}`,
            type: 'invoice',
            priority: options.priority || 'normal',
            channels: ['in_app'],
            metadata: {
              invoice_id: invoice.id,
              invoice_number: invoice.invoice_number,
              order_id: order.id,
              amount: invoice.total_amount,
              actionUrl: `/invoices/${invoice.id}`
            }
          });

          deliveryResults.notification = {
            success: notificationResult.success,
            notificationId: notificationResult.notificationId,
            error: notificationResult.error
          };

          if (notificationResult.success) {
            console.log(`AutoInvoiceService: In-app notification created successfully`);
          } else {
            console.error(`AutoInvoiceService: Failed to create notification: ${notificationResult.error}`);
          }
        } catch (notificationError: any) {
          console.error('AutoInvoiceService: Notification creation error:', notificationError);
          deliveryResults.notification = {
            success: false,
            error: notificationError.message || 'Failed to create notification'
          };
        }
      }

      // 6. Send admin notifications
      await this.sendAdminInvoiceNotifications(invoice, order, customerInfo, deliveryResults);

      // 7. Schedule follow-up actions
      await this.scheduleFollowUpActions(invoice, order, customerInfo, options);

      return {
        success: true,
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoice_number,
        deliveryResults,
        invoice
      };

    } catch (error: any) {
      console.error('AutoInvoiceService: Failed to generate and deliver invoice:', error);
      return {
        success: false,
        error: error.message || 'Failed to process invoice',
        deliveryResults: {}
      };
    }
  }

  /**
   * Send notifications to admins about invoice generation
   */
  private static async sendAdminInvoiceNotifications(
    invoice: any,
    order: Order,
    customerInfo: CustomerInfo,
    deliveryResults: any
  ): Promise<void> {
    try {
      const adminUserIds = ['1', 'admin']; // Configure as needed
      const adminEmails = ['admin@manaeats.com', 'accounts@manaeats.com'];

      // Create admin notifications
      const adminNotificationPromises = adminUserIds.map(async (adminId) => {
        try {
          await NotificationService.sendSingleNotification({
            userId: adminId,
            title: '💼 New Invoice Generated',
            message: `Invoice ${invoice.invoice_number} generated for customer ${customerInfo.name}. Order: ${order.id}, Amount: ₹${invoice.total_amount.toFixed(2)}`,
            type: 'admin_invoice',
            priority: 'normal',
            channels: ['in_app'],
            metadata: {
              invoice_id: invoice.id,
              invoice_number: invoice.invoice_number,
              order_id: order.id,
              customer_name: customerInfo.name,
              customer_email: customerInfo.email,
              amount: invoice.total_amount,
              delivery_status: deliveryResults,
              actionUrl: `/admin/invoices/${invoice.id}`
            }
          });
          console.log(`AutoInvoiceService: Admin notification sent to ${adminId}`);
        } catch (error) {
          console.error(`AutoInvoiceService: Failed to send admin notification to ${adminId}:`, error);
        }
      });

      await Promise.allSettled(adminNotificationPromises);

      // Send admin email summary
      try {
        const deliveryStatusSummary = [
          deliveryResults.email ? `Email: ${deliveryResults.email.success ? '✅ Sent' : '❌ Failed'}` : '',
          deliveryResults.whatsapp ? `WhatsApp: ${deliveryResults.whatsapp.success ? '✅ Sent' : '❌ Failed'}` : '',
          deliveryResults.notification ? `Notification: ${deliveryResults.notification.success ? '✅ Sent' : '❌ Failed'}` : ''
        ].filter(Boolean).join(', ');

        await EmailService.sendEmail({
          to: adminEmails,
          subject: `📄 New Invoice Generated - ${invoice.invoice_number}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2>📄 Invoice Generated Successfully</h2>
              
              <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>Invoice Details</h3>
                <p><strong>Invoice Number:</strong> ${invoice.invoice_number}</p>
                <p><strong>Order ID:</strong> ${order.id}</p>
                <p><strong>Customer:</strong> ${customerInfo.name} (${customerInfo.email})</p>
                <p><strong>Amount:</strong> ₹${invoice.total_amount.toFixed(2)}</p>
                <p><strong>Generated At:</strong> ${new Date().toLocaleString()}</p>
              </div>
              
              <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>Delivery Status</h3>
                <p>${deliveryStatusSummary || 'No delivery methods configured'}</p>
              </div>
              
              <div style="background-color: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; color: #166534;">
                  <strong>✅ Action Required:</strong> Please review the invoice and ensure customer payment processing.
                </p>
              </div>
              
              <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
                This is an automated notification from MANAfoods invoice system.
              </p>
            </div>
          `
        });

        console.log('AutoInvoiceService: Admin email summary sent successfully');
      } catch (emailError) {
        console.error('AutoInvoiceService: Failed to send admin email summary:', emailError);
      }

    } catch (error) {
      console.error('AutoInvoiceService: Failed to send admin notifications:', error);
    }
  }

  /**
   * Schedule follow-up actions for the invoice
   */
  private static async scheduleFollowUpActions(
    invoice: any,
    order: Order,
    customerInfo: CustomerInfo,
    options: InvoiceDeliveryOptions
  ): Promise<void> {
    try {
      // Schedule payment reminder (after 24 hours if unpaid)
      const reminderDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
      
      if (customerInfo.userId) {
        await NotificationService.scheduleNotification({
          userId: customerInfo.userId,
          title: '💰 Payment Reminder',
          message: `Friendly reminder: Payment for invoice ${invoice.invoice_number} (₹${invoice.total_amount.toFixed(2)}) is pending. Please complete your payment to avoid any delays.`,
          type: 'payment_reminder',
          priority: 'normal',
          channels: ['in_app', 'email'],
          scheduleAt: reminderDate.toISOString(),
          metadata: {
            invoice_id: invoice.id,
            invoice_number: invoice.invoice_number,
            order_id: order.id,
            amount: invoice.total_amount,
            actionUrl: `/invoices/${invoice.id}`
          }
        });

        console.log(`AutoInvoiceService: Payment reminder scheduled for ${reminderDate.toLocaleString()}`);
      }

      // Schedule delivery tracking reminder (after order ships)
      if (options.includeTrackingInfo && order.tracking_number) {
        const trackingReminderDate = new Date(Date.now() + 6 * 60 * 60 * 1000); // 6 hours later
        
        if (customerInfo.userId) {
          await NotificationService.scheduleNotification({
            userId: customerInfo.userId,
            title: '📦 Track Your Order',
            message: `Your order ${order.id} is being processed. Track your shipment using tracking number: ${order.tracking_number}`,
            type: 'shipping_update',
            priority: 'normal',
            channels: ['in_app', 'whatsapp'],
            scheduleAt: trackingReminderDate.toISOString(),
            metadata: {
              order_id: order.id,
              tracking_number: order.tracking_number,
              actionUrl: `/orders/${order.id}/track`
            }
          });

          console.log(`AutoInvoiceService: Tracking reminder scheduled for ${trackingReminderDate.toLocaleString()}`);
        }
      }

    } catch (error) {
      console.error('AutoInvoiceService: Failed to schedule follow-up actions:', error);
    }
  }

  /**
   * Resend invoice to customer
   */
  static async resendInvoice(
    invoiceId: string,
    customerInfo: CustomerInfo,
    options: InvoiceDeliveryOptions = {
      sendEmail: true,
      sendWhatsApp: false,
      createNotification: true,
      priority: 'normal'
    }
  ): Promise<AutoInvoiceResult> {
    try {
      // Fetch invoice details
      const invoice = await InvoiceService.getInvoiceById(invoiceId);
      if (!invoice) {
        throw new Error('Invoice not found');
      }

      // Generate fresh PDF
      const invoicePDF = await InvoiceService.generateInvoicePDF(invoice);
      
      const deliveryResults: AutoInvoiceResult['deliveryResults'] = {};

      // Resend via requested channels
      if (options.sendEmail && customerInfo.email) {
        const emailResult = await EmailService.sendInvoiceEmail(
          invoice, 
          customerInfo.email, 
          invoicePDF
        );

        deliveryResults.email = {
          success: emailResult.success,
          error: emailResult.error
        };
      }

      if (options.sendWhatsApp && customerInfo.phone) {
        const whatsappResult = await WhatsAppService.sendInvoiceNotification(
          invoice, 
          customerInfo.phone
        );

        deliveryResults.whatsapp = {
          success: whatsappResult.success,
          error: whatsappResult.error
        };
      }

      if (options.createNotification && customerInfo.userId) {
        const notificationResult = await NotificationService.sendSingleNotification({
          userId: customerInfo.userId,
          title: '📄 Invoice Resent',
          message: `Your invoice ${invoice.invoice_number} has been resent as requested.`,
          type: 'invoice_resent',
          priority: options.priority || 'normal',
          channels: ['in_app'],
          metadata: {
            invoice_id: invoice.id,
            invoice_number: invoice.invoice_number,
            actionUrl: `/invoices/${invoice.id}`
          }
        });

        deliveryResults.notification = {
          success: notificationResult.success,
          notificationId: notificationResult.notificationId,
          error: notificationResult.error
        };
      }

      return {
        success: true,
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoice_number,
        deliveryResults,
        invoice
      };

    } catch (error: any) {
      console.error('AutoInvoiceService: Failed to resend invoice:', error);
      return {
        success: false,
        error: error.message || 'Failed to resend invoice',
        deliveryResults: {}
      };
    }
  }

  /**
   * Send invoice payment confirmation
   */
  static async sendPaymentConfirmation(
    invoiceId: string,
    customerInfo: CustomerInfo,
    paymentDetails: {
      amount: number;
      paymentMethod: string;
      transactionId?: string;
      paidAt: string;
    }
  ): Promise<AutoInvoiceResult> {
    try {
      const invoice = await InvoiceService.getInvoiceById(invoiceId);
      if (!invoice) {
        throw new Error('Invoice not found');
      }

      const deliveryResults: AutoInvoiceResult['deliveryResults'] = {};

      // Send payment confirmation email
      if (customerInfo.email) {
        const emailResult = await EmailService.sendEmail({
          to: customerInfo.email,
          subject: `✅ Payment Confirmed - Invoice ${invoice.invoice_number}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #059669; margin-bottom: 10px;">✅ Payment Confirmed</h1>
                <p style="color: #6b7280; margin: 0;">MANAfoods</p>
              </div>
              
              <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h2 style="color: #166534; margin-top: 0;">Payment Successfully Received</h2>
                <p style="color: #166534; margin: 0;">
                  Thank you ${customerInfo.name}! Your payment has been confirmed and processed successfully.
                </p>
              </div>
              
              <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h3 style="margin-top: 0;">Payment Details</h3>
                <p><strong>Invoice Number:</strong> ${invoice.invoice_number}</p>
                <p><strong>Amount Paid:</strong> ₹${paymentDetails.amount.toFixed(2)}</p>
                <p><strong>Payment Method:</strong> ${paymentDetails.paymentMethod}</p>
                ${paymentDetails.transactionId ? `<p><strong>Transaction ID:</strong> ${paymentDetails.transactionId}</p>` : ''}
                <p><strong>Payment Date:</strong> ${new Date(paymentDetails.paidAt).toLocaleString()}</p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <p style="color: #4b5563;">
                  Your order will be processed and shipped shortly. You will receive tracking information once your order ships.
                </p>
              </div>
              
              <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                  Thank you for choosing MANAfoods!<br>
                  For any questions, contact us at support@manaeats.com
                </p>
              </div>
            </div>
          `
        });

        deliveryResults.email = {
          success: emailResult.success,
          error: emailResult.error
        };
      }

      // Send WhatsApp confirmation
      if (customerInfo.phone) {
        const message = `✅ *Payment Confirmed!*\n\nHello ${customerInfo.name},\n\nYour payment of ₹${paymentDetails.amount.toFixed(2)} for invoice ${invoice.invoice_number} has been confirmed.\n\n💳 *Payment Method:* ${paymentDetails.paymentMethod}\n📅 *Date:* ${new Date(paymentDetails.paidAt).toLocaleString()}\n${paymentDetails.transactionId ? `🆔 *Transaction ID:* ${paymentDetails.transactionId}\n` : ''}\nYour order will be processed shortly. Thank you for choosing MANAfoods! 🛒\n\n📞 Need help? Contact us anytime.`;
        
        const whatsappResult = await WhatsAppService.sendTextMessage(customerInfo.phone, message);

        deliveryResults.whatsapp = {
          success: whatsappResult.success,
          error: whatsappResult.error
        };
      }

      // Create notification
      if (customerInfo.userId) {
        const notificationResult = await NotificationService.sendSingleNotification({
          userId: customerInfo.userId,
          title: '✅ Payment Confirmed',
          message: `Your payment of ₹${paymentDetails.amount.toFixed(2)} for invoice ${invoice.invoice_number} has been confirmed. Your order will be processed shortly.`,
          type: 'payment_confirmed',
          priority: 'high',
          channels: ['in_app'],
          metadata: {
            invoice_id: invoice.id,
            invoice_number: invoice.invoice_number,
            payment_amount: paymentDetails.amount,
            transaction_id: paymentDetails.transactionId,
            actionUrl: `/invoices/${invoice.id}`
          }
        });

        deliveryResults.notification = {
          success: notificationResult.success,
          notificationId: notificationResult.notificationId,
          error: notificationResult.error
        };
      }

      return {
        success: true,
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoice_number,
        deliveryResults,
        invoice
      };

    } catch (error: any) {
      console.error('AutoInvoiceService: Failed to send payment confirmation:', error);
      return {
        success: false,
        error: error.message || 'Failed to send payment confirmation',
        deliveryResults: {}
      };
    }
  }

  /**
   * Get delivery statistics for invoices
   */
  static async getDeliveryStats(dateRange?: { from: Date; to: Date }): Promise<any> {
    try {
      // This would typically query your database for statistics
      // For now, return mock data structure
      return {
        totalInvoices: 0,
        emailDeliveries: { sent: 0, failed: 0, pending: 0 },
        whatsappDeliveries: { sent: 0, failed: 0, pending: 0 },
        notifications: { created: 0, read: 0, unread: 0 },
        paymentConfirmations: { sent: 0, pending: 0 },
        deliveryRate: 0
      };
    } catch (error) {
      console.error('AutoInvoiceService: Failed to get delivery stats:', error);
      throw error;
    }
  }
}

export default AutoInvoiceService;
