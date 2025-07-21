import { CartItem } from '../contexts/CartContext';
import { EmailService } from './EmailService';
import { InvoiceService } from './InvoiceService';
import { WhatsAppService } from './WhatsAppService';
import { AutoInvoiceService } from './AutoInvoiceService';
import { env } from '../config/env'; // Import env

const ORDERS_TABLE_ID = '10401';
const ORDER_ITEMS_TABLE_ID = 'order_items';
const NOTIFICATIONS_TABLE_ID = '10412';

// Admin configuration - make this configurable
const ADMIN_CONFIG = {
  ADMIN_USER_IDS: ['1', 'admin'], // Support multiple admin user IDs
  ADMIN_EMAILS: ['admin@manaeats.com', 'orders@manaeats.com', 'support@manaeats.com'], // Updated to use manaeats.com
  NOTIFICATION_SETTINGS: {
    NEW_ORDER: true,
    LOW_STOCK: true,
    PAYMENT_ISSUES: true,
    CUSTOMER_MESSAGES: true
  }
};

export interface Order {
  id: string;
  user_id: string;
  order_total: number;
  order_status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shipping_address: string;
  payment_method: string;
  order_date: string;
  tracking_number: string;
  estimated_delivery: string;
  delivery_partner_name?: string; // Added delivery partner name
  delivery_partner_link?: string; // Added delivery partner link
  razerpay_order_id?: string; // Updated field for Razer Pay Order ID
  razerpay_payment_id?: string; // Updated field for Razer Pay Payment ID
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_price: number;
  quantity: number;
  product_image: string;
}

export class OrderService {
  // Create a new order (initial creation before payment)
  static async createOrder(params: {
    userId: string;
    cartItems: CartItem[];
    shippingAddress: any;
    paymentMethod: string;
    razerpayOrderId?: string; // Updated for Razer Pay Order ID
    razerpayPaymentId?: string; // Updated for Razer Pay Payment ID
  }) {
    try {
      const { userId, cartItems, shippingAddress, paymentMethod, razerpayOrderId, razerpayPaymentId } = params;

      const orderTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const orderId = `ORDER_${Date.now()}`;

      // Create order
      const orderData = {
        user_id: userId,
        order_total: orderTotal,
        order_status: 'pending', // Initial status is pending
        shipping_address: JSON.stringify(shippingAddress),
        payment_method: paymentMethod,
        order_date: new Date().toISOString(),
        tracking_number: `TN${Date.now().toString().slice(-8)}`,
        estimated_delivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        razerpay_order_id: razerpayOrderId,
        razerpay_payment_id: razerpayPaymentId,
      };

      // Add a unique ID to the order
      const orderDataWithId = {
        ...orderData,
        id: orderId
      };

      // Defensive: Ensure tracking_number is always set
      if (!orderDataWithId.tracking_number) {
        orderDataWithId.tracking_number = `TN${Date.now().toString().slice(-8)}`;
      }

      console.log(`OrderService: Creating order in table ${ORDERS_TABLE_ID} with data:`, orderDataWithId);
      const { error: orderError } = await window.ezsite.apis.tableCreate(ORDERS_TABLE_ID, orderDataWithId);
      if (orderError) {
        console.error('OrderService: Error creating order:', orderError);
        throw new Error(orderError);
      }
      console.log('OrderService: Order created successfully.');

      // Use the orderId we generated instead of fetching
      const createdOrder = {
        ...orderDataWithId
      };

      // Create order items
      for (const item of cartItems) {
        const orderItemData = {
          id: `${orderId}_${item.id}_${Date.now()}`,
          order_id: orderId,
          product_id: item.id,
          product_name: item.name,
          product_price: item.price,
          quantity: item.quantity,
          product_image: item.image
        };

        console.log(`OrderService: Creating order item in table ${ORDER_ITEMS_TABLE_ID} with data:`, orderItemData);
        const { error: itemError } = await window.ezsite.apis.tableCreate(ORDER_ITEMS_TABLE_ID, orderItemData);
        if (itemError) {
          console.error('OrderService: Error creating order item:', itemError);
        } else {
          console.log('OrderService: Order item created successfully.');
        }
      }

      // Create notification for user
      console.log(`OrderService: Creating notification for user ${userId} in table ${NOTIFICATIONS_TABLE_ID}`);
      try {
        await window.ezsite.apis.tableCreate(NOTIFICATIONS_TABLE_ID, {
          user_id: userId,
          title: 'Order Confirmed',
          message: `Your order #${createdOrder.id} has been confirmed and is being processed.`,
          type: 'order',
          channel: 'in_app',
          status: 'sent',
          created_at: new Date().toISOString(),
          sent_at: new Date().toISOString()
        });
        console.log('OrderService: Order confirmation notification created successfully.');
      } catch (notifError) {
        console.error('OrderService: Error creating order notification:', notifError);
      }

      // Create enhanced notifications for all admin users using NotificationService
      console.log(`OrderService: Creating enhanced admin notifications for new order`);
      
      try {
        // Import NotificationService dynamically to avoid circular imports
        const { NotificationService } = await import('./NotificationService');
        
        const priority = orderTotal >= 100 ? 'high' : 'normal';
        const adminNotificationResult = await NotificationService.createOrderNotificationForAdmins(
          {
            id: createdOrder.id,
            user_id: userId,
            order_total: orderTotal,
            payment_method: paymentMethod,
            order_date: new Date().toISOString(),
            order_status: 'pending',
            tracking_number: orderDataWithId.tracking_number,
            item_count: cartItems.length
          },
          ADMIN_CONFIG.ADMIN_USER_IDS
        );
        
        if (adminNotificationResult.success) {
          console.log('OrderService: Enhanced admin notifications created successfully');
        } else {
          console.error('OrderService: Failed to create enhanced admin notifications:', adminNotificationResult.error);
          
          // Fallback to manual notification creation
          console.log('OrderService: Attempting fallback notification creation...');
          const fallbackPromises = ADMIN_CONFIG.ADMIN_USER_IDS.map(async (adminUserId) => {
            try {
              await window.ezsite.apis.tableCreate(NOTIFICATIONS_TABLE_ID, {
                user_id: adminUserId,
                title: '🛒 New Order Received',
                message: `New order #${createdOrder.id} received from customer ${userId}. Total: $${orderTotal.toFixed(2)} with ${cartItems.length} item(s). Payment: ${paymentMethod}`,
                type: 'order',
                channel: 'in_app',
                status: 'sent',
                is_read: false,
                priority: priority,
                metadata: JSON.stringify({
                  order_id: createdOrder.id,
                  customer_id: userId,
                  order_total: orderTotal,
                  item_count: cartItems.length,
                  payment_method: paymentMethod,
                  order_date: new Date().toISOString(),
                  actionUrl: `/admin/orders/${createdOrder.id}`,
                  priority: priority
                }),
                created_at: new Date().toISOString(),
                sent_at: new Date().toISOString()
              });
              console.log(`OrderService: Fallback notification created for admin ${adminUserId}`);
            } catch (adminNotifError) {
              console.error(`OrderService: Error creating fallback notification for admin ${adminUserId}:`, adminNotifError);
            }
          });
          
          await Promise.allSettled(fallbackPromises);
        }
      } catch (importError) {
        console.error('OrderService: Error importing NotificationService, using fallback:', importError);
        
        // Direct fallback notification creation
        const directFallbackPromises = ADMIN_CONFIG.ADMIN_USER_IDS.map(async (adminUserId) => {
          try {
            await window.ezsite.apis.tableCreate(NOTIFICATIONS_TABLE_ID, {
              user_id: adminUserId,
              title: '🛒 New Order Received',
              message: `New order #${createdOrder.id} received from customer ${userId}. Total: $${orderTotal.toFixed(2)} with ${cartItems.length} item(s). Payment: ${paymentMethod}`,
              type: 'order',
              channel: 'in_app',
              status: 'sent',
              is_read: false,
              priority: orderTotal >= 100 ? 'high' : 'normal',
              metadata: JSON.stringify({
                order_id: createdOrder.id,
                customer_id: userId,
                order_total: orderTotal,
                item_count: cartItems.length,
                payment_method: paymentMethod,
                order_date: new Date().toISOString(),
                actionUrl: `/admin/orders/${createdOrder.id}`
              }),
              created_at: new Date().toISOString(),
              sent_at: new Date().toISOString()
            });
            console.log(`OrderService: Direct fallback notification created for admin ${adminUserId}`);
          } catch (adminNotifError) {
            console.error(`OrderService: Error creating direct fallback notification for admin ${adminUserId}:`, adminNotifError);
          }
        });
        
        await Promise.allSettled(directFallbackPromises);
      }
      
      console.log('OrderService: Admin notification process completed.');

      // Auto-generate and deliver invoice with complete notification system
      console.log(`OrderService: Auto-generating invoice and notifications for order ${createdOrder.id}`);
      try {
        // Get customer info from shipping address and user data
        const customerInfo = {
          name: shippingAddress?.fullName || `Customer ${userId}`,
          email: shippingAddress?.email || `customer${userId}@example.com`,
          phone: shippingAddress?.phone || shippingAddress?.phoneNumber || '+919390872628',
          address: shippingAddress,
          userId: userId
        };

        // Use AutoInvoiceService to handle complete invoice generation and delivery
        const autoInvoiceResult = await AutoInvoiceService.generateAndDeliverInvoice(
          createdOrder as Order,
          cartItems.map(item => ({
            id: `${createdOrder.id}_${item.id}_${Date.now()}`,
            order_id: createdOrder.id,
            product_id: item.id,
            product_name: item.name,
            product_price: item.price,
            quantity: item.quantity,
            product_image: item.image
          })),
          customerInfo,
          {
            sendEmail: true,
            sendWhatsApp: true,
            createNotification: true,
            priority: orderTotal >= 100 ? 'high' : 'normal',
            includeTrackingInfo: true,
            emailTemplate: 'standard'
          }
        );

        if (autoInvoiceResult.success) {
          console.log(`OrderService: Auto-invoice generation completed successfully for invoice ${autoInvoiceResult.invoiceNumber}`);
          
          // Log delivery results
          const deliveryResults = autoInvoiceResult.deliveryResults;
          console.log('OrderService: Delivery Summary:', {
            email: deliveryResults.email?.success ? 'Sent' : `Failed: ${deliveryResults.email?.error}`,
            whatsapp: deliveryResults.whatsapp?.success ? 'Sent' : `Failed: ${deliveryResults.whatsapp?.error}`,
            notification: deliveryResults.notification?.success ? 'Created' : `Failed: ${deliveryResults.notification?.error}`
          });
          
          // Update order with invoice reference
          await window.ezsite.apis.tableUpdate(ORDERS_TABLE_ID, {
            id: createdOrder.id,
            invoice_id: autoInvoiceResult.invoiceId,
            invoice_number: autoInvoiceResult.invoiceNumber,
            auto_invoice_status: 'completed',
            updated_at: new Date().toISOString()
          });
          
        } else {
          console.error('OrderService: Auto-invoice generation failed:', autoInvoiceResult.error);
          
          // Update order with failure status
          await window.ezsite.apis.tableUpdate(ORDERS_TABLE_ID, {
            id: createdOrder.id,
            auto_invoice_status: 'failed',
            auto_invoice_error: autoInvoiceResult.error,
            updated_at: new Date().toISOString()
          });
          
          // Fallback to basic notifications
          await this.sendFallbackNotifications(createdOrder, cartItems, customerInfo);
        }

        // Send enhanced admin notification email with retry logic
        const adminEmails = ADMIN_CONFIG.ADMIN_EMAILS;
        console.log('OrderService: Attempting to send enhanced admin notification email to:', adminEmails);
        
        // Prepare order with items for email notification
        const orderWithItems = { ...createdOrder, items: cartItems };
        
        const adminEmailResult = await EmailService.sendEnhancedAdminOrderNotification(
          orderWithItems, 
          cartItems.map(item => ({
            product_id: item.id,
            product_name: item.name,
            product_price: item.price,
            quantity: item.quantity,
            product_image: item.image
          })), 
          customerInfo
        );
        
        if (adminEmailResult.success) {
          console.log('OrderService: Enhanced admin notification email sent successfully');
        } else {
          console.error('OrderService: Failed to send enhanced admin notification email:', adminEmailResult.error);
          
          // Fallback to basic admin notification if enhanced fails
          console.log('OrderService: Attempting fallback admin notification...');
          const fallbackResult = await EmailService.sendAdminOrderNotification(orderWithItems, adminEmails);
          
          if (fallbackResult.success) {
            console.log('OrderService: Fallback admin notification sent successfully');
          } else {
            console.error('OrderService: Fallback admin notification also failed:', fallbackResult.error);
          }
        }
        
        // Check if this is a high-value order that needs urgent attention
        if (orderTotal >= 100) { // Orders over $100 get urgent notification
          console.log('OrderService: High-value order detected, sending urgent notification');
          const urgentResult = await EmailService.sendUrgentAdminNotification(
            orderWithItems, 
            `High-value order ($${orderTotal.toFixed(2)})`
          );
          
          if (urgentResult.success) {
            console.log('OrderService: Urgent admin notification sent successfully');
          } else {
            console.error('OrderService: Failed to send urgent admin notification:', urgentResult.error);
          }
        }

        console.log('OrderService: Auto-invoice integration completed successfully');

      } catch (emailInvoiceError) {
        console.error('OrderService: Error with email/invoice generation:', emailInvoiceError);
        // Don't fail the order creation if email/invoice fails
      }

      // Send order confirmation email (legacy fallback)
      console.log('OrderService: Sending legacy order confirmation email to admin.');
      try {
        if (window.ezsite.apis.sendEmail) {
          await window.ezsite.apis.sendEmail({
            from: 'no-reply@manaeats.com',
            to: ADMIN_CONFIG.ADMIN_EMAILS,
            subject: 'New Order Received - MANAfoods',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2>New Order #${createdOrder.id}</h2>
                <p><strong>Customer ID:</strong> ${userId}</p>
                <p><strong>Total:</strong> $${orderTotal.toFixed(2)}</p>
                <p><strong>Items:</strong> ${cartItems.length}</p>
                <p><strong>Payment Method:</strong> ${paymentMethod}</p>
                <p><strong>Order Date:</strong> ${new Date().toLocaleString()}</p>
                <p><strong>Tracking Number:</strong> ${orderDataWithId.tracking_number}</p>
                
                <h3>Order Items:</h3>
                <ul>
                  ${cartItems.map(item => `
                    <li>${item.name} - Qty: ${item.quantity} - $${(item.price * item.quantity).toFixed(2)}</li>
                  `).join('')}
                </ul>
                
                <p style="margin-top: 20px; padding: 15px; background-color: #f0f9ff; border-radius: 8px;">
                  Please process this order promptly to maintain customer satisfaction.
                </p>
              </div>
            `
          });
          console.log('OrderService: Legacy order confirmation email sent successfully.');
        } else {
          console.log('OrderService: Legacy email service not available, skipping email');
        }
      } catch (emailError) {
        console.error('OrderService: Error sending legacy order email:', emailError);
      }

      return {
        success: true,
        orderId: orderId,
        trackingNumber: orderDataWithId.tracking_number || `TN${Date.now().toString().slice(-8)}`
      };
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  // Method to create a Razorpay order (integrated with backend)
  static async createRazerPayOrder(params: {
    amount: number;
    currency: string;
    receipt: string;
    userId: string;
    cartItems: CartItem[];
    shippingAddress: any;
  }) {
    try {
      const { amount, currency, receipt, userId, cartItems, shippingAddress } = params;

      // First, create an internal order with 'pending' status
      const createOrderResult = await this.createOrder({
        userId,
        cartItems,
        shippingAddress,
        paymentMethod: 'Razorpay',
        razerpayOrderId: '', // Will be updated after Razorpay order creation
        razerpayPaymentId: '', // Will be updated after payment success
      });

      if (!createOrderResult.success) {
        throw new Error('Failed to create internal order for Razorpay.');
      }

      const internalOrderId = createOrderResult.orderId;

      console.log(`OrderService: Creating Razorpay order for internal order ID ${internalOrderId}`);
      
      // Create Razorpay order via backend API
      const razorpayResponse = await fetch('/api/razerpay/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // Convert to paise
          currency: currency,
          receipt: receipt,
          notes: {
            order_id: internalOrderId,
            user_id: userId,
            items_count: cartItems.length
          }
        })
      });

      if (!razorpayResponse.ok) {
        throw new Error(`HTTP error! status: ${razorpayResponse.status}`);
      }

      const razorpayData = await razorpayResponse.json();
      
      if (!razorpayData.success) {
        throw new Error(razorpayData.error || 'Failed to create Razorpay order');
      }

      const razorpayOrderId = razorpayData.data.id;
      
      // Update the internal order with the Razorpay Order ID
      await window.ezsite.apis.tableUpdate(ORDERS_TABLE_ID, {
        id: internalOrderId,
        razerpay_order_id: razorpayOrderId,
      });

      return {
        success: true,
        razerpayOrderId: razorpayOrderId,
        orderId: internalOrderId, // Return your internal order ID
        message: 'Razorpay order created successfully.'
      };
    } catch (error: any) {
      console.error('Error creating Razorpay order:', error);
      return { success: false, message: error.message || 'An unknown error occurred.' };
    }
  }

  // Method to verify Razorpay payment (integrated with backend)
  static async verifyRazerPayPayment(params: {
    razerpay_payment_id: string;
    razerpay_order_id: string;
    razerpay_signature: string;
    orderId: string; // Your internal order ID
  }) {
    try {
      const { razerpay_payment_id, razerpay_order_id, razerpay_signature, orderId } = params;

      console.log(`OrderService: Verifying Razorpay payment for internal order ID ${orderId}`);
      console.log(`OrderService: Payment details:`, { razerpay_payment_id, razerpay_order_id, razerpay_signature });
      
      // Verify payment via backend API
      const verifyResponse = await fetch('/api/razerpay/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          razerpay_payment_id,
          razerpay_order_id,
          razerpay_signature,
          internal_order_id: orderId
        })
      });

      if (!verifyResponse.ok) {
        throw new Error(`HTTP error! status: ${verifyResponse.status}`);
      }

      const verifyData = await verifyResponse.json();
      
      if (!verifyData.success) {
        console.error('Payment verification failed:', verifyData.error);
        // Update order status to failed
        try {
          await window.ezsite.apis.tableUpdate(ORDERS_TABLE_ID, {
            id: orderId,
            order_status: 'failed',
          });
        } catch (updateError) {
          console.error(`OrderService: Exception updating order ${orderId} to failed:`, updateError);
        }
        return { success: false, message: verifyData.error || 'Payment verification failed' };
      }

      // Payment verified successfully, update order status
      try {
        const updateResult = await window.ezsite.apis.tableUpdate(ORDERS_TABLE_ID, {
          id: orderId,
          order_status: 'processing',
          razerpay_payment_id: razerpay_payment_id,
        });
        
        if (updateResult.error) {
          console.error(`OrderService: Error updating order ${orderId}:`, updateResult.error);
          return { success: false, message: `Failed to update order: ${updateResult.error}` };
        }
        
        console.log(`OrderService: Payment verified and internal order ${orderId} updated to 'processing'.`);
        return { success: true, message: 'Payment verified successfully.' };
      } catch (updateError) {
        console.error(`OrderService: Exception updating order ${orderId}:`, updateError);
        return { success: false, message: `Failed to update order: ${updateError}` };
      }
    } catch (error: any) {
      console.error('Error verifying Razorpay payment:', error);
      
      // In case of network error, try to update order status to failed
      try {
        await window.ezsite.apis.tableUpdate(ORDERS_TABLE_ID, {
          id: params.orderId,
          order_status: 'failed',
        });
      } catch (updateError) {
        console.error(`OrderService: Exception updating order ${params.orderId} to failed:`, updateError);
      }
      
      return { success: false, message: error.message || 'An unknown error occurred during verification.' };
    }
  }

  // Get orders for a user
  static async getUserOrders(userId: string) {
    try {
      if (!window.ezsite || !window.ezsite.apis) {
        console.error('OrderService: window.ezsite.apis is not defined. Cannot get user orders.');
        throw new Error('API not available');
      }
      console.log(`OrderService: Fetching orders for user ${userId} from table ${ORDERS_TABLE_ID}`);
      const { data, error } = await window.ezsite.apis.tablePage(ORDERS_TABLE_ID, {
        PageNo: 1,
        PageSize: 100,
        OrderByField: 'ID',
        IsAsc: false,
        Filters: [
          { name: 'user_id', op: 'Equal', value: userId }
        ]
      });
      if (error) {
        console.error('OrderService: Error fetching user orders:', error);
        throw new Error(error.message || 'Failed to fetch user orders');
      }
      return data;
    } catch (error) {
      console.error('Error fetching user orders:', error);
      throw error;
    }
  }

  // Add this inside the OrderService class
  static async getAllOrders(params?: { pageNo?: number; pageSize?: number; status?: string }) {
    try {
      if (!window.ezsite || !window.ezsite.apis) {
        throw new Error('API client not initialized. Please refresh the page.');
      }
      const { pageNo = 1, pageSize = 20, status } = params || {};
      const filters: any[] = [];
      if (status && status !== 'all') {
        filters.push({
          name: 'order_status',
          op: 'Equal',
          value: status
        });
      }
      const response = await window.ezsite.apis.tablePage(ORDERS_TABLE_ID, {
        PageNo: pageNo,
        PageSize: pageSize,
        OrderByField: 'id',
        IsAsc: false,
        Filters: filters
      });
      if (!response || typeof response !== 'object') {
        throw new Error('Invalid response from server');
      }
      if (response.error) {
        throw new Error(response.error);
      }
      const { data } = response;
      if (!data || !Array.isArray(data.List)) {
        throw new Error('Invalid data format received from server');
      }
      return {
        orders: data.List,
        totalCount: data.VirtualCount || 0,
        currentPage: pageNo,
        totalPages: Math.ceil((data.VirtualCount || 0) / pageSize)
      };
    } catch (error) {
      console.error('Error fetching all orders:', error);
      throw error;
    }
  }

  static async getOrderById(orderId: string | number) {
    try {
      if (!window.ezsite || !window.ezsite.apis) {
        throw new Error('API client not initialized. Please refresh the page.');
      }
      // Fetch the order
      const { data: orderData, error: orderError } = await window.ezsite.apis.tablePage(ORDERS_TABLE_ID, {
        PageNo: 1,
        PageSize: 1,
        Filters: [
          { name: 'id', op: 'Equal', value: orderId }
        ]
      });
      if (orderError || !orderData?.List?.[0]) {
        throw new Error(orderError || 'Order not found');
      }
      const order = orderData.List[0];
      // Fetch order items
      const { data: itemsData, error: itemsError } = await window.ezsite.apis.tablePage(ORDER_ITEMS_TABLE_ID, {
        PageNo: 1,
        PageSize: 100,
        Filters: [
          { name: 'order_id', op: 'Equal', value: String(orderId) }
        ]
      });
      if (itemsError) {
        throw new Error(itemsError);
      }
      const items = Array.isArray(itemsData?.List) ? itemsData.List : [];
      return { order, items };
    } catch (error) {
      console.error('Error fetching order by ID:', error);
      throw error;
    }
  }

  static async trackOrder(trackingNumber: string) {
    try {
      if (!trackingNumber) {
        throw new Error('Invalid tracking number.');
      }
      if (!window.ezsite || !window.ezsite.apis) {
        throw new Error('API client not initialized. Please refresh the page.');
      }
      // Fetch the order by tracking number
      const { data: orderData, error: orderError } = await window.ezsite.apis.tablePage(ORDERS_TABLE_ID, {
        PageNo: 1,
        PageSize: 1,
        Filters: [
          { name: 'tracking_number', op: 'Equal', value: trackingNumber }
        ]
      });
      if (orderError || !orderData?.List?.[0]) {
        throw new Error(orderError || 'Order not found with this tracking number');
      }
      return orderData.List[0];
    } catch (error) {
      console.error('Error tracking order:', error);
      throw error;
    }
  }

  static async updateOrderStatus(
    orderId: string, 
    newStatus: string, 
    trackingNumber: string, 
    deliveryPartnerName?: string, 
    deliveryPartnerLink?: string
  ) {
    try {
      if (!window.ezsite || !window.ezsite.apis) {
        throw new Error('API client not initialized. Please refresh the page.');
      }
      
      console.log(`OrderService: Updating order status for order ${orderId}`);
      console.log(`OrderService: New status: ${newStatus}, Tracking: ${trackingNumber}`);
      console.log(`OrderService: Delivery partner: ${deliveryPartnerName}, Link: ${deliveryPartnerLink}`);
      
      // Get current order details for notifications
      const { order, items } = await this.getOrderById(orderId);
      
      // Use the correct table ID for orders
      const ORDERS_TABLE_ID = '10401';
      const updateData: any = {
        id: orderId, // Use lowercase 'id' to match the field used in other methods
        order_status: newStatus,
        tracking_number: trackingNumber,
        updated_at: new Date().toISOString(), // Add timestamp for when the order was updated
      };
      
      // Add delivery partner fields if provided
      if (deliveryPartnerName) {
        updateData.delivery_partner_name = deliveryPartnerName;
      }
      if (deliveryPartnerLink) {
        updateData.delivery_partner_link = deliveryPartnerLink;
      }
      
      console.log(`OrderService: Update data:`, updateData);
      
      const response = await window.ezsite.apis.tableUpdate(ORDERS_TABLE_ID, updateData);
      
      console.log(`OrderService: Update response:`, response);
      
      if (response.error) {
        console.error(`OrderService: Update error:`, response.error);
        throw new Error(response.error);
      }
      
      console.log(`OrderService: Order ${orderId} updated successfully`);

      // Send status update notifications
      try {
        console.log('OrderService: Sending status update notifications');
        
        // Update order object with new status
        const updatedOrder = {
          ...order,
          order_status: newStatus,
          tracking_number: trackingNumber,
          delivery_partner_name: deliveryPartnerName,
          delivery_partner_link: deliveryPartnerLink,
          items: items
        };

        // Get customer info for notifications
        const shippingAddress = typeof order.shipping_address === 'string' 
          ? JSON.parse(order.shipping_address) 
          : order.shipping_address;
        
        const customerPhone = shippingAddress?.phone || shippingAddress?.phoneNumber || '+919390872628';
        const customerEmail = shippingAddress?.email || `customer${order.user_id}@example.com`;

        // Send WhatsApp status update
        try {
          const whatsappResult = await WhatsAppService.sendOrderStatusUpdate(updatedOrder, customerPhone, newStatus);
          if (whatsappResult.success) {
            console.log('OrderService: WhatsApp status update sent successfully');
          } else {
            console.error('OrderService: Failed to send WhatsApp status update:', whatsappResult.error);
          }
        } catch (whatsappError) {
          console.error('OrderService: WhatsApp status update error:', whatsappError);
        }

        // Send email status update
        try {
          const emailTemplate = {
            subject: `Order Status Update - ${newStatus.toUpperCase()} - MANAfoods`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1>Order Status Update</h1>
                <p>Your order status has been updated!</p>
                
                <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h2>Order Details</h2>
                  <p><strong>Order ID:</strong> ${orderId}</p>
                  <p><strong>New Status:</strong> ${newStatus.toUpperCase()}</p>
                  <p><strong>Tracking Number:</strong> ${trackingNumber}</p>
                  ${deliveryPartnerName ? `<p><strong>Delivery Partner:</strong> ${deliveryPartnerName}</p>` : ''}
                  ${deliveryPartnerLink ? `<p><strong>Track Shipment:</strong> <a href="${deliveryPartnerLink}">${deliveryPartnerLink}</a></p>` : ''}
                </div>
                
                <p>Thank you for choosing MANAfoods!</p>
              </div>
            `,
            text: `Order Status Update\n\nYour order ${orderId} status has been updated to: ${newStatus.toUpperCase()}\n\nTracking: ${trackingNumber}\n\nThank you for choosing MANAfoods!`
          };

          const emailResult = await EmailService.sendEmail({
            to: customerEmail,
            subject: emailTemplate.subject,
            html: emailTemplate.html,
            text: emailTemplate.text
          });

          if (emailResult.success) {
            console.log('OrderService: Email status update sent successfully');
          } else {
            console.error('OrderService: Failed to send email status update:', emailResult.error);
          }
        } catch (emailError) {
          console.error('OrderService: Email status update error:', emailError);
        }

        // Create notification for user
        try {
          await window.ezsite.apis.tableCreate(NOTIFICATIONS_TABLE_ID, {
            user_id: order.user_id,
            title: 'Order Status Updated',
            message: `Your order #${orderId} status has been updated to ${newStatus.toUpperCase()}`,
            type: 'order',
            channel: 'in_app',
            status: 'sent',
            is_read: false,
            metadata: JSON.stringify({
              order_id: orderId,
              old_status: order.order_status,
              new_status: newStatus,
              tracking_number: trackingNumber,
              delivery_partner_name: deliveryPartnerName,
              delivery_partner_link: deliveryPartnerLink
            }),
            created_at: new Date().toISOString(),
            sent_at: new Date().toISOString()
          });
          console.log('OrderService: In-app notification created successfully');
        } catch (notifError) {
          console.error('OrderService: Error creating in-app notification:', notifError);
        }
      } catch (notificationError) {
        console.error('OrderService: Error sending status update notifications:', notificationError);
      }
      
      return response;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }

  /**
   * Send fallback notifications when AutoInvoiceService fails
   */
  private static async sendFallbackNotifications(order: any, cartItems: CartItem[], customerInfo: any): Promise<void> {
    try {
      console.log('OrderService: Sending fallback notifications for order:', order.id);
      
      // Basic order confirmation email
      try {
        const emailResult = await EmailService.sendEmail({
          to: customerInfo.email,
          subject: `Order Confirmation - ${order.id} - MANAfoods`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1>Order Confirmation</h1>
              <p>Dear ${customerInfo.name},</p>
              <p>Thank you for your order! Your order has been received and is being processed.</p>
              
              <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h2>Order Details</h2>
                <p><strong>Order ID:</strong> ${order.id}</p>
                <p><strong>Order Total:</strong> ₹${order.order_total.toFixed(2)}</p>
                <p><strong>Order Date:</strong> ${new Date(order.order_date).toLocaleString()}</p>
                <p><strong>Payment Method:</strong> ${order.payment_method}</p>
              </div>
              
              <h3>Items Ordered:</h3>
              <ul>
                ${cartItems.map(item => `
                  <li>${item.name} - Qty: ${item.quantity} - ₹${(item.price * item.quantity).toFixed(2)}</li>
                `).join('')}
              </ul>
              
              <p>We will send you a detailed invoice and tracking information shortly.</p>
              <p>Thank you for choosing MANAfoods!</p>
            </div>
          `
        });
        
        if (emailResult.success) {
          console.log('OrderService: Fallback order confirmation email sent successfully');
        } else {
          console.error('OrderService: Failed to send fallback email:', emailResult.error);
        }
      } catch (emailError) {
        console.error('OrderService: Fallback email error:', emailError);
      }
      
      // Basic WhatsApp notification
      try {
        const message = `🛒 *Order Confirmed!*\n\nHello ${customerInfo.name},\n\nYour order #${order.id} has been confirmed.\n\n💰 *Total:* ₹${order.order_total.toFixed(2)}\n📅 *Date:* ${new Date(order.order_date).toLocaleString()}\n💳 *Payment:* ${order.payment_method}\n\nWe will send you invoice and tracking details shortly.\n\nThank you for choosing MANAfoods! 🙏`;
        
        const whatsappResult = await WhatsAppService.sendTextMessage(customerInfo.phone, message);
        
        if (whatsappResult.success) {
          console.log('OrderService: Fallback WhatsApp notification sent successfully');
        } else {
          console.error('OrderService: Failed to send fallback WhatsApp:', whatsappResult.error);
        }
      } catch (whatsappError) {
        console.error('OrderService: Fallback WhatsApp error:', whatsappError);
      }
      
      // Basic in-app notification
      try {
        await window.ezsite.apis.tableCreate(NOTIFICATIONS_TABLE_ID, {
          user_id: customerInfo.userId,
          title: '🛒 Order Confirmed',
          message: `Your order #${order.id} has been confirmed and is being processed. Total: ₹${order.order_total.toFixed(2)}`,
          type: 'order',
          channel: 'in_app',
          status: 'sent',
          is_read: false,
          priority: 'normal',
          metadata: JSON.stringify({
            order_id: order.id,
            order_total: order.order_total,
            fallback_notification: true
          }),
          created_at: new Date().toISOString(),
          sent_at: new Date().toISOString()
        });
        
        console.log('OrderService: Fallback in-app notification created successfully');
      } catch (notificationError) {
        console.error('OrderService: Fallback notification error:', notificationError);
      }
      
    } catch (error) {
      console.error('OrderService: Error in fallback notifications:', error);
    }
  }
}
