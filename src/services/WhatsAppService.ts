const WHATSAPP_MESSAGES_TABLE_ID = '10414';

export interface WhatsAppMessage {
  id: string;
  phone_number: string;
  message_type: 'text' | 'image' | 'template' | 'document';
  message_content: string;
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  user_id?: string;
  campaign_id?: string;
  order_id?: string;
  invoice_id?: string;
  media_url?: string;
  template_name?: string;
  template_params?: any;
  whatsapp_message_id?: string;
  error_message?: string;
  sent_at?: string;
  delivered_at?: string;
  read_at?: string;
  created_at: string;
  updated_at: string;
}

export interface WhatsAppTemplate {
  name: string;
  language: string;
  category: 'marketing' | 'utility' | 'authentication';
  components: WhatsAppTemplateComponent[];
}

export interface WhatsAppTemplateComponent {
  type: 'header' | 'body' | 'footer' | 'button';
  text?: string;
  parameters?: WhatsAppTemplateParameter[];
}

export interface WhatsAppTemplateParameter {
  type: 'text' | 'currency' | 'date_time';
  text?: string;
}

export class WhatsAppService {
  private static readonly TWILIO_CONFIG = {
    accountSid: import.meta.env.VITE_TWILIO_ACCOUNT_SID || 'your_twilio_account_sid',
    authToken: import.meta.env.VITE_TWILIO_AUTH_TOKEN || 'your_twilio_auth_token',
    whatsappNumber: import.meta.env.VITE_TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886', // Twilio Sandbox
    apiUrl: 'https://api.twilio.com/2010-04-01',
  };

  private static readonly BUSINESS_CONFIG = {
    businessName: 'MANAfoods',
    businessPhone: '+91 98765 43210',
    businessEmail: 'support@manaeats.com',
    businessAddress: '123 Pickle Street, Flavor City, FC 12345',
    websiteUrl: 'https://manaeats.com',
    supportUrl: 'https://manaeats.com/support',
  };

  // Send a simple text message
  static async sendTextMessage(phoneNumber: string, message: string, metadata?: any): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      console.log('WhatsAppService: Sending text message to', phoneNumber);
      
      // Format phone number
      const formattedPhone = this.formatPhoneNumber(phoneNumber);
      
      // Create message record
      const messageData: Partial<WhatsAppMessage> = {
        phone_number: formattedPhone,
        message_type: 'text',
        message_content: message,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...metadata
      };

      // Save to database first
      const { error: dbError } = await window.ezsite.apis.tableCreate(WHATSAPP_MESSAGES_TABLE_ID, messageData);
      if (dbError) {
        throw new Error(`Database error: ${dbError}`);
      }

      // Send via Twilio (or simulate for demo)
      const result = await this.sendViaProvider(formattedPhone, message);
      
      // Update message status
      await window.ezsite.apis.tableUpdate(WHATSAPP_MESSAGES_TABLE_ID, {
        id: messageData.id,
        status: result.success ? 'sent' : 'failed',
        whatsapp_message_id: result.messageId,
        error_message: result.error,
        sent_at: result.success ? new Date().toISOString() : undefined,
        updated_at: new Date().toISOString()
      });

      return result;
    } catch (error) {
      console.error('WhatsAppService: Error sending text message:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Send template message (for order confirmations, etc.)
  static async sendTemplateMessage(
    phoneNumber: string, 
    templateName: string, 
    parameters: string[], 
    metadata?: any
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      console.log('WhatsAppService: Sending template message', templateName, 'to', phoneNumber);
      
      const formattedPhone = this.formatPhoneNumber(phoneNumber);
      
      // Create message record
      const messageData: Partial<WhatsAppMessage> = {
        phone_number: formattedPhone,
        message_type: 'template',
        message_content: `Template: ${templateName}`,
        template_name: templateName,
        template_params: JSON.stringify(parameters),
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...metadata
      };

      // Save to database
      const { error: dbError } = await window.ezsite.apis.tableCreate(WHATSAPP_MESSAGES_TABLE_ID, messageData);
      if (dbError) {
        throw new Error(`Database error: ${dbError}`);
      }

      // Send template via provider
      const result = await this.sendTemplateViaProvider(formattedPhone, templateName, parameters);
      
      // Update status
      await window.ezsite.apis.tableUpdate(WHATSAPP_MESSAGES_TABLE_ID, {
        id: messageData.id,
        status: result.success ? 'sent' : 'failed',
        whatsapp_message_id: result.messageId,
        error_message: result.error,
        sent_at: result.success ? new Date().toISOString() : undefined,
        updated_at: new Date().toISOString()
      });

      return result;
    } catch (error) {
      console.error('WhatsAppService: Error sending template message:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Send order confirmation via WhatsApp
  static async sendOrderConfirmation(order: any, customerPhone: string): Promise<{ success: boolean; error?: string }> {
    try {
      const message = `
🛒 *Order Confirmation - MANAfoods*

Hello! Your order has been confirmed.

📦 *Order Details:*
• Order ID: ${order.id}
• Total: ₹${order.order_total?.toFixed(2) || '0.00'}
• Items: ${order.items?.length || 0} item(s)
• Status: ${order.order_status}
${order.tracking_number ? `• Tracking: ${order.tracking_number}` : ''}

🚚 *Delivery Info:*
${order.estimated_delivery ? `• Estimated Delivery: ${new Date(order.estimated_delivery).toLocaleDateString()}` : ''}
${order.delivery_partner_name ? `• Delivery Partner: ${order.delivery_partner_name}` : ''}

📞 *Need Help?*
• Call: ${this.BUSINESS_CONFIG.businessPhone}
• Email: ${this.BUSINESS_CONFIG.businessEmail}
• Web: ${this.BUSINESS_CONFIG.websiteUrl}

Thank you for choosing MANAfoods! 🥒
`;

      return await this.sendTextMessage(customerPhone, message, {
        order_id: order.id,
        user_id: order.user_id
      });
    } catch (error) {
      console.error('WhatsAppService: Error sending order confirmation:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Send order status update
  static async sendOrderStatusUpdate(order: any, customerPhone: string, newStatus: string): Promise<{ success: boolean; error?: string }> {
    try {
      const statusEmojis = {
        pending: '⏳',
        processing: '🔄',
        shipped: '🚚',
        delivered: '✅',
        cancelled: '❌'
      };

      const statusMessages = {
        pending: 'Your order is being prepared',
        processing: 'Your order is being processed',
        shipped: 'Your order has been shipped',
        delivered: 'Your order has been delivered',
        cancelled: 'Your order has been cancelled'
      };

      const message = `
${statusEmojis[newStatus as keyof typeof statusEmojis] || '📦'} *Order Update - MANAfoods*

Your order status has been updated!

📦 *Order ID:* ${order.id}
📊 *New Status:* ${newStatus.toUpperCase()}
💡 *Info:* ${statusMessages[newStatus as keyof typeof statusMessages] || 'Status updated'}

${order.tracking_number ? `🔍 *Track Your Order:* ${order.tracking_number}` : ''}
${order.delivery_partner_name && order.delivery_partner_link ? 
  `🚚 *Track with ${order.delivery_partner_name}:* ${order.delivery_partner_link}` : ''}

${newStatus === 'shipped' ? `🎉 Great news! Your delicious pickles are on their way!` : ''}
${newStatus === 'delivered' ? `🎉 Enjoy your MANAfoods pickles! Please rate your experience.` : ''}

📞 *Questions?* Call ${this.BUSINESS_CONFIG.businessPhone}
`;

      return await this.sendTextMessage(customerPhone, message, {
        order_id: order.id,
        user_id: order.user_id
      });
    } catch (error) {
      console.error('WhatsAppService: Error sending status update:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Send invoice via WhatsApp
  static async sendInvoiceNotification(invoice: any, customerPhone: string): Promise<{ success: boolean; error?: string }> {
    try {
      const message = `
🧾 *Invoice Ready - MANAfoods*

Your invoice is now available!

📄 *Invoice Details:*
• Invoice #: ${invoice.invoice_number}
• Order #: ${invoice.order_id}
• Amount: ₹${invoice.total_amount?.toFixed(2) || '0.00'}
• Date: ${new Date(invoice.invoice_date).toLocaleDateString()}
• Status: ${invoice.status?.toUpperCase()}

💳 *Payment Info:*
${invoice.status === 'sent' ? '• Payment pending' : ''}
${invoice.status === 'paid' ? '• ✅ Payment received' : ''}
${invoice.due_date ? `• Due Date: ${new Date(invoice.due_date).toLocaleDateString()}` : ''}

📧 *Download Invoice:*
Check your email for the PDF invoice or visit our website.

💰 *Pay Online:*
${this.BUSINESS_CONFIG.websiteUrl}/invoices/${invoice.id}

📞 *Support:* ${this.BUSINESS_CONFIG.businessPhone}

Thank you for your business! 🙏
`;

      return await this.sendTextMessage(customerPhone, message, {
        invoice_id: invoice.id,
        order_id: invoice.order_id,
        user_id: invoice.user_id
      });
    } catch (error) {
      console.error('WhatsAppService: Error sending invoice notification:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Send promotional message
  static async sendPromotionalMessage(phoneNumber: string, campaignData: any): Promise<{ success: boolean; error?: string }> {
    try {
      const message = `
🎉 *Special Offer - MANAfoods*

${campaignData.title || 'Limited Time Offer!'}

${campaignData.description || 'Don\'t miss out on our delicious pickles!'}

🏷️ *Discount:* ${campaignData.discount || '20% OFF'}
⏰ *Valid Until:* ${campaignData.validUntil || 'Limited time'}
🛒 *Shop Now:* ${this.BUSINESS_CONFIG.websiteUrl}

Use code: ${campaignData.promoCode || 'PICKLE20'}

📞 *Questions?* Call ${this.BUSINESS_CONFIG.businessPhone}

*T&C Apply. MANAfoods - Taste the Tradition! 🥒*
`;

      return await this.sendTextMessage(phoneNumber, message, {
        campaign_id: campaignData.id,
        user_id: campaignData.user_id
      });
    } catch (error) {
      console.error('WhatsAppService: Error sending promotional message:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Get all WhatsApp messages (admin)
  static async getAllMessages(params: { pageNo?: number; pageSize?: number; status?: string } = {}) {
    try {
      const { pageNo = 1, pageSize = 20, status } = params;
      
      const filters: any[] = [];
      if (status && status !== 'all') {
        filters.push({
          name: 'status',
          op: 'Equal',
          value: status
        });
      }

      const { data, error } = await window.ezsite.apis.tablePage(WHATSAPP_MESSAGES_TABLE_ID, {
        PageNo: pageNo,
        PageSize: pageSize,
        OrderByField: 'created_at',
        IsAsc: false,
        Filters: filters
      });

      if (error) throw new Error(error);

      return {
        messages: data?.List || [],
        totalCount: data?.VirtualCount || 0,
        currentPage: pageNo,
        totalPages: Math.ceil((data?.VirtualCount || 0) / pageSize)
      };
    } catch (error) {
      console.error('WhatsAppService: Error fetching messages:', error);
      throw error;
    }
  }

  // Get messages for a specific user
  static async getUserMessages(userId: string, params: { pageNo?: number; pageSize?: number } = {}) {
    try {
      const { pageNo = 1, pageSize = 20 } = params;
      
      const { data, error } = await window.ezsite.apis.tablePage(WHATSAPP_MESSAGES_TABLE_ID, {
        PageNo: pageNo,
        PageSize: pageSize,
        OrderByField: 'created_at',
        IsAsc: false,
        Filters: [
          { name: 'user_id', op: 'Equal', value: userId }
        ]
      });

      if (error) throw new Error(error);

      return {
        messages: data?.List || [],
        totalCount: data?.VirtualCount || 0,
        currentPage: pageNo,
        totalPages: Math.ceil((data?.VirtualCount || 0) / pageSize)
      };
    } catch (error) {
      console.error('WhatsAppService: Error fetching user messages:', error);
      throw error;
    }
  }

  // Webhook handler for status updates
  static async handleWebhook(webhookData: any): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('WhatsAppService: Processing webhook:', webhookData);
      
      const { MessageSid, MessageStatus, To, From } = webhookData;
      
      if (!MessageSid) {
        throw new Error('Invalid webhook data: Missing MessageSid');
      }

      // Find message by WhatsApp message ID
      const { data, error } = await window.ezsite.apis.tablePage(WHATSAPP_MESSAGES_TABLE_ID, {
        PageNo: 1,
        PageSize: 1,
        Filters: [
          { name: 'whatsapp_message_id', op: 'Equal', value: MessageSid }
        ]
      });

      if (error) throw new Error(error);

      const message = data?.List?.[0];
      if (!message) {
        console.log('WhatsAppService: Message not found for webhook:', MessageSid);
        return { success: true }; // Not an error, just not our message
      }

      // Update message status
      const updateData: any = {
        id: message.id,
        status: MessageStatus,
        updated_at: new Date().toISOString()
      };

      if (MessageStatus === 'delivered') {
        updateData.delivered_at = new Date().toISOString();
      } else if (MessageStatus === 'read') {
        updateData.read_at = new Date().toISOString();
      }

      const { error: updateError } = await window.ezsite.apis.tableUpdate(WHATSAPP_MESSAGES_TABLE_ID, updateData);
      if (updateError) throw new Error(updateError);

      console.log('WhatsAppService: Message status updated:', MessageSid, MessageStatus);
      return { success: true };
    } catch (error) {
      console.error('WhatsAppService: Error handling webhook:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Bulk send messages
  static async sendBulkMessages(phoneNumbers: string[], message: string, campaignId?: string): Promise<{ results: any[] }> {
    const results = [];
    
    for (const phoneNumber of phoneNumbers) {
      const result = await this.sendTextMessage(phoneNumber, message, { campaign_id: campaignId });
      results.push({
        phoneNumber,
        success: result.success,
        messageId: result.messageId,
        error: result.error
      });
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    return { results };
  }

  // Private helper methods
  private static formatPhoneNumber(phoneNumber: string): string {
    // Remove any non-digit characters except +
    let formatted = phoneNumber.replace(/[^\d+]/g, '');
    
    // Add + if not present
    if (!formatted.startsWith('+')) {
      formatted = '+' + formatted;
    }
    
    // Add country code if Indian number without country code
    if (formatted.match(/^\+[0-9]{10}$/)) {
      formatted = '+91' + formatted.substring(1);
    }
    
    return formatted;
  }

  private static async sendViaProvider(phoneNumber: string, message: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // For demo purposes, simulate sending
      // In production, integrate with Twilio, WhatsApp Business API, or other providers
      
      if (import.meta.env.DEV) {
        console.log(`📱 WhatsApp Message (DEMO):`, {
          to: phoneNumber,
          message: message,
          timestamp: new Date().toISOString()
        });
        
        // Simulate success with delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        return {
          success: true,
          messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        };
      }

      // Production Twilio integration would go here
      // const client = require('twilio')(this.TWILIO_CONFIG.accountSid, this.TWILIO_CONFIG.authToken);
      // const result = await client.messages.create({
      //   from: this.TWILIO_CONFIG.whatsappNumber,
      //   to: `whatsapp:${phoneNumber}`,
      //   body: message
      // });
      // return { success: true, messageId: result.sid };

      throw new Error('Production WhatsApp API not configured');
    } catch (error) {
      console.error('WhatsAppService: Provider error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Provider error'
      };
    }
  }

  private static async sendTemplateViaProvider(phoneNumber: string, templateName: string, parameters: string[]): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // For demo purposes, simulate template sending
      if (import.meta.env.DEV) {
        console.log(`📱 WhatsApp Template (DEMO):`, {
          to: phoneNumber,
          template: templateName,
          parameters: parameters,
          timestamp: new Date().toISOString()
        });
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        return {
          success: true,
          messageId: `tmpl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        };
      }

      // Production implementation would send actual template
      throw new Error('Production WhatsApp template API not configured');
    } catch (error) {
      console.error('WhatsAppService: Template provider error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Template provider error'
      };
    }
  }

  // Get message statistics
  static async getMessageStats(): Promise<any> {
    try {
      const { data, error } = await window.ezsite.apis.tablePage(WHATSAPP_MESSAGES_TABLE_ID, {
        PageNo: 1,
        PageSize: 1000,
        OrderByField: 'created_at',
        IsAsc: false
      });

      if (error) throw new Error(error);

      const messages = data?.List || [];
      
      const stats = {
        total: messages.length,
        sent: messages.filter(m => m.status === 'sent').length,
        delivered: messages.filter(m => m.status === 'delivered').length,
        read: messages.filter(m => m.status === 'read').length,
        failed: messages.filter(m => m.status === 'failed').length,
        pending: messages.filter(m => m.status === 'pending').length,
        byType: {
          text: messages.filter(m => m.message_type === 'text').length,
          template: messages.filter(m => m.message_type === 'template').length,
          image: messages.filter(m => m.message_type === 'image').length,
          document: messages.filter(m => m.message_type === 'document').length
        },
        recentMessages: messages.slice(0, 10)
      };

      return stats;
    } catch (error) {
      console.error('WhatsAppService: Error fetching message stats:', error);
      throw error;
    }
  }

  // NOTIFICATION INTEGRATION METHODS
  
  // Send notification via WhatsApp (integrated with NotificationService)
  static async sendNotification(phoneNumber: string, notification: {
    title: string;
    message: string;
    type: 'order' | 'system' | 'promotion' | 'campaign';
    priority?: 'low' | 'normal' | 'high' | 'urgent';
    actionUrl?: string;
    metadata?: any;
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const { title, message, type, priority = 'normal', actionUrl, metadata = {} } = notification;
      
      // Format notification for WhatsApp
      const formattedMessage = this.formatNotificationForWhatsApp(notification);
      
      // Send via WhatsApp
      const result = await this.sendTextMessage(phoneNumber, formattedMessage, {
        user_id: metadata.userId,
        notification_type: type,
        priority,
        action_url: actionUrl,
        original_notification: JSON.stringify(notification)
      });

      return result;
    } catch (error) {
      console.error('WhatsAppService: Error sending notification:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Format notification for WhatsApp display
  private static formatNotificationForWhatsApp(notification: {
    title: string;
    message: string;
    type: 'order' | 'system' | 'promotion' | 'campaign';
    priority?: 'low' | 'normal' | 'high' | 'urgent';
    actionUrl?: string;
  }): string {
    const { title, message, type, priority = 'normal', actionUrl } = notification;

    // Get appropriate emoji based on type and priority
    const getNotificationEmoji = (type: string, priority: string) => {
      if (priority === 'urgent') return '🚨';
      if (priority === 'high') return '⚡';
      
      switch (type) {
        case 'order': return '🛒';
        case 'system': return '🔔';
        case 'promotion': return '🎉';
        case 'campaign': return '📢';
        default: return '💬';
      }
    };

    const emoji = getNotificationEmoji(type, priority);
    const priorityText = priority === 'urgent' ? ' *[URGENT]*' : priority === 'high' ? ' *[HIGH]*' : '';

    let formattedMessage = `${emoji} *${title}*${priorityText}\n\n${message}`;

    // Add action URL if provided
    if (actionUrl) {
      formattedMessage += `\n\n🔗 *Take Action:* ${actionUrl}`;
    }

    // Add footer
    formattedMessage += `\n\n📱 *MANAfoods Notification*`;
    formattedMessage += `\n⏰ ${new Date().toLocaleTimeString()}`;

    return formattedMessage;
  }

  // Send bulk notifications via WhatsApp
  static async sendBulkNotifications(recipients: Array<{
    phoneNumber: string;
    userId?: string;
  }>, notification: {
    title: string;
    message: string;
    type: 'order' | 'system' | 'promotion' | 'campaign';
    priority?: 'low' | 'normal' | 'high' | 'urgent';
    actionUrl?: string;
  }): Promise<{ results: Array<{ phoneNumber: string; success: boolean; messageId?: string; error?: string }> }> {
    const results = [];
    
    for (const recipient of recipients) {
      const result = await this.sendNotification(recipient.phoneNumber, {
        ...notification,
        metadata: { userId: recipient.userId }
      });
      
      results.push({
        phoneNumber: recipient.phoneNumber,
        success: result.success,
        messageId: result.messageId,
        error: result.error
      });
      
      // Add delay to avoid rate limiting (adjust as needed)
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    return { results };
  }

  // Send order-related notifications
  static async sendOrderNotification(phoneNumber: string, orderData: any, notificationType: 'confirmation' | 'status_update' | 'delivery'): Promise<{ success: boolean; error?: string }> {
    try {
      switch (notificationType) {
        case 'confirmation':
          return await this.sendOrderConfirmation(orderData, phoneNumber);
        case 'status_update':
          return await this.sendOrderStatusUpdate(orderData, phoneNumber, orderData.order_status);
        case 'delivery':
          return await this.sendDeliveryNotification(orderData, phoneNumber);
        default:
          throw new Error(`Unknown notification type: ${notificationType}`);
      }
    } catch (error) {
      console.error('WhatsAppService: Error sending order notification:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Send delivery notification
  static async sendDeliveryNotification(order: any, customerPhone: string): Promise<{ success: boolean; error?: string }> {
    try {
      const message = `
🎉 *Order Delivered - MANAfoods*

Great news! Your order has been successfully delivered.

📦 *Order Details:*
• Order ID: ${order.id}
• Total: ₹${order.order_total?.toFixed(2) || '0.00'}
• Delivered At: ${new Date().toLocaleString()}
${order.delivery_partner_name ? `• Delivered By: ${order.delivery_partner_name}` : ''}

⭐ *Rate Your Experience:*
We'd love to hear your feedback! Please rate your experience:
${this.BUSINESS_CONFIG.websiteUrl}/orders/${order.id}/review

🛒 *Order Again:*
Loved our pickles? Order more at ${this.BUSINESS_CONFIG.websiteUrl}

📞 *Need Help?*
• Call: ${this.BUSINESS_CONFIG.businessPhone}
• Email: ${this.BUSINESS_CONFIG.businessEmail}

Thank you for choosing MANAfoods! 🥒
Enjoy your delicious pickles! 😋
`;

      return await this.sendTextMessage(customerPhone, message, {
        order_id: order.id,
        user_id: order.user_id,
        notification_type: 'delivery'
      });
    } catch (error) {
      console.error('WhatsAppService: Error sending delivery notification:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Send system notification
  static async sendSystemNotification(phoneNumber: string, notificationData: {
    title: string;
    message: string;
    priority?: 'low' | 'normal' | 'high' | 'urgent';
    actionUrl?: string;
    userId?: string;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const { title, message, priority = 'normal', actionUrl, userId } = notificationData;
      
      const priorityEmoji = priority === 'urgent' ? '🚨' : priority === 'high' ? '⚡' : '🔔';
      const priorityText = priority === 'urgent' ? ' *[URGENT]*' : priority === 'high' ? ' *[HIGH]*' : '';

      let formattedMessage = `${priorityEmoji} *${title}*${priorityText}\n\n${message}`;

      if (actionUrl) {
        formattedMessage += `\n\n🔗 *More Info:* ${actionUrl}`;
      }

      formattedMessage += `\n\n📱 *MANAfoods System*`;
      formattedMessage += `\n⏰ ${new Date().toLocaleString()}`;

      return await this.sendTextMessage(phoneNumber, formattedMessage, {
        user_id: userId,
        notification_type: 'system',
        priority
      });
    } catch (error) {
      console.error('WhatsAppService: Error sending system notification:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Send campaign notification
  static async sendCampaignNotification(phoneNumber: string, campaignData: {
    title: string;
    message: string;
    campaignId?: string;
    userId?: string;
    actionUrl?: string;
    promoCode?: string;
    validUntil?: string;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const { title, message, campaignId, userId, actionUrl, promoCode, validUntil } = campaignData;

      let formattedMessage = `📢 *${title}*\n\n${message}`;

      if (promoCode) {
        formattedMessage += `\n\n🎟️ *Promo Code:* ${promoCode}`;
      }

      if (validUntil) {
        formattedMessage += `\n⏰ *Valid Until:* ${validUntil}`;
      }

      if (actionUrl) {
        formattedMessage += `\n\n🛒 *Shop Now:* ${actionUrl}`;
      }

      formattedMessage += `\n\n📱 *MANAfoods Campaign*`;
      formattedMessage += `\n*Terms & Conditions Apply*`;

      return await this.sendTextMessage(phoneNumber, formattedMessage, {
        user_id: userId,
        campaign_id: campaignId,
        notification_type: 'campaign'
      });
    } catch (error) {
      console.error('WhatsAppService: Error sending campaign notification:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Test notification method
  static async sendTestNotification(phoneNumber: string, userId?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const testMessage = `
🧪 *Test Notification - MANAfoods*

This is a test notification to verify that WhatsApp notifications are working correctly.

✅ *Test Details:*
• Service: WhatsApp Notifications
• Time: ${new Date().toLocaleString()}
• Status: Active

📱 *MANAfoods Test System*
If you received this message, everything is working perfectly!

📞 *Support:* ${this.BUSINESS_CONFIG.businessPhone}
`;

      return await this.sendTextMessage(phoneNumber, testMessage, {
        user_id: userId,
        notification_type: 'test'
      });
    } catch (error) {
      console.error('WhatsAppService: Error sending test notification:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Get notification delivery stats
  static async getNotificationStats(timeRange: 'today' | 'week' | 'month' = 'today'): Promise<any> {
    try {
      const { data, error } = await window.ezsite.apis.tablePage(WHATSAPP_MESSAGES_TABLE_ID, {
        PageNo: 1,
        PageSize: 1000,
        OrderByField: 'created_at',
        IsAsc: false
      });

      if (error) throw new Error(error);

      const messages = data?.List || [];
      
      // Filter by time range
      const now = new Date();
      const filteredMessages = messages.filter(msg => {
        const msgDate = new Date(msg.created_at);
        
        switch (timeRange) {
          case 'today':
            return msgDate.toDateString() === now.toDateString();
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return msgDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            return msgDate >= monthAgo;
          default:
            return true;
        }
      });

      const stats = {
        total: filteredMessages.length,
        sent: filteredMessages.filter(m => m.status === 'sent').length,
        delivered: filteredMessages.filter(m => m.status === 'delivered').length,
        read: filteredMessages.filter(m => m.status === 'read').length,
        failed: filteredMessages.filter(m => m.status === 'failed').length,
        byNotificationType: {
          order: filteredMessages.filter(m => m.notification_type === 'order').length,
          system: filteredMessages.filter(m => m.notification_type === 'system').length,
          promotion: filteredMessages.filter(m => m.notification_type === 'promotion').length,
          campaign: filteredMessages.filter(m => m.notification_type === 'campaign').length,
          test: filteredMessages.filter(m => m.notification_type === 'test').length
        },
        deliveryRate: filteredMessages.length > 0 ? 
          (filteredMessages.filter(m => m.status === 'delivered').length / filteredMessages.length * 100).toFixed(2) : 0,
        readRate: filteredMessages.length > 0 ? 
          (filteredMessages.filter(m => m.status === 'read').length / filteredMessages.length * 100).toFixed(2) : 0
      };

      return stats;
    } catch (error) {
      console.error('WhatsAppService: Error fetching notification stats:', error);
      throw error;
    }
  }

  // Check WhatsApp service health
  static async checkServiceHealth(): Promise<{ healthy: boolean; details: any }> {
    try {
      // Check if we can access the messages table
      const { data, error } = await window.ezsite.apis.tablePage(WHATSAPP_MESSAGES_TABLE_ID, {
        PageNo: 1,
        PageSize: 1
      });

      if (error) {
        return {
          healthy: false,
          details: {
            error: error,
            timestamp: new Date().toISOString()
          }
        };
      }

      return {
        healthy: true,
        details: {
          messagesTableAccessible: true,
          configurationValid: !!(this.TWILIO_CONFIG.accountSid && this.TWILIO_CONFIG.authToken),
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      return {
        healthy: false,
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        }
      };
    }
  }
}
