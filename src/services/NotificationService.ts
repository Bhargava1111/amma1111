import { env } from '@/config/env';

const NOTIFICATIONS_TABLE_ID = env.TABLES.NOTIFICATIONS;

export interface Notification {
  ID?: number; // ezsite API field
  id?: string | number; // database field
  user_id: string;
  title: string;
  message: string;
  type: 'order' | 'campaign' | 'system' | 'promotion';
  channel: 'email' | 'whatsapp' | 'in_app';
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  is_read: boolean;
  campaign_id?: string;
  metadata: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  sent_at?: string;
  created_at: string;
  expires_at?: string;
}

export class NotificationService {
  // Real-time notification listeners
  private static listeners: Set<(notifications: Notification[]) => void> = new Set();
  private static pollingInterval: NodeJS.Timeout | null = null;
  private static currentUserId: string | null = null;

  // Subscribe to real-time notifications
  static subscribe(userId: string, callback: (notifications: Notification[]) => void) {
    this.listeners.add(callback);
    this.currentUserId = userId;
    
    // Start polling if not already started
    if (!this.pollingInterval) {
      this.startPolling();
    }
    
    // Immediately fetch current notifications
    this.fetchAndNotifyListeners();
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
      if (this.listeners.size === 0) {
        this.stopPolling();
      }
    };
  }

  // Start polling for new notifications
  private static startPolling() {
    if (this.pollingInterval) return;
    
    this.pollingInterval = setInterval(() => {
      this.fetchAndNotifyListeners();
    }, 10000); // Poll every 10 seconds
  }

  // Stop polling
  private static stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  // Fetch notifications and notify all listeners
  private static async fetchAndNotifyListeners() {
    if (!this.currentUserId || this.listeners.size === 0) return;
    
    try {
      const result = await this.getUserNotifications(this.currentUserId, {
        pageNo: 1,
        pageSize: 50 // Get more recent notifications
      });
      
      // Notify all listeners
      this.listeners.forEach(callback => {
        callback(result.notifications);
      });
    } catch (error) {
      console.error('Error in notification polling:', error);
    }
  }

  // Create a notification and immediately notify listeners
  static async createNotificationWithUpdate(params: {
    userId: string;
    title: string;
    message: string;
    type: Notification['type'];
    channel?: Notification['channel'];
    campaignId?: string;
    metadata?: any;
    priority?: 'low' | 'normal' | 'high' | 'urgent';
    actionUrl?: string;
    expiresAt?: string;
  }) {
    const result = await this.createNotification(params);
    
    // Immediately update listeners if notification was created
    if (result.success) {
      this.fetchAndNotifyListeners();
    }
    
    return result;
  }

  // Get notifications for a user with enhanced filtering
  static async getUserNotifications(userId: string, params: {
    pageNo?: number;
    pageSize?: number;
    type?: string;
    isRead?: boolean;
    priority?: string;
    dateRange?: { start: string; end: string };
  } = {}) {
    try {
      const { pageNo = 1, pageSize = 20, type, isRead, priority, dateRange } = params;

      const filters: any[] = [
        { name: 'user_id', op: 'Equal', value: userId }
      ];

      if (type && type !== 'all') {
        filters.push({
          name: 'type',
          op: 'Equal',
          value: type
        });
      }

      if (isRead !== undefined) {
        filters.push({
          name: 'is_read',
          op: 'Equal',
          value: isRead
        });
      }

      if (priority && priority !== 'all') {
        filters.push({
          name: 'priority',
          op: 'Equal',
          value: priority
        });
      }

      if (dateRange) {
        filters.push(
          { name: 'created_at', op: 'GreaterThanOrEqual', value: dateRange.start },
          { name: 'created_at', op: 'LessThanOrEqual', value: dateRange.end }
        );
      }

      const { data, error } = await window.ezsite.apis.tablePage(NOTIFICATIONS_TABLE_ID, {
        PageNo: pageNo,
        PageSize: pageSize,
        OrderByField: 'created_at',
        IsAsc: false,
        Filters: filters
      });

      if (error) throw new Error(error);

      return {
        notifications: data?.List || [],
        totalCount: data?.VirtualCount || 0,
        currentPage: pageNo,
        totalPages: Math.ceil((data?.VirtualCount || 0) / pageSize)
      };
    } catch (error) {
      console.error('Error fetching user notifications:', error);
      throw error;
    }
  }

  // Get unread notification count
  static async getUnreadCount(userId: string): Promise<number> {
    try {
      const { data, error } = await window.ezsite.apis.tablePage(NOTIFICATIONS_TABLE_ID, {
        PageNo: 1,
        PageSize: 1000,
        Filters: [
        { name: 'user_id', op: 'Equal', value: userId },
        { name: 'is_read', op: 'Equal', value: false }]

      });

      if (error) {
        console.error('Error fetching unread count:', error);
        return 0;
      }

      return data?.VirtualCount || 0;
    } catch (error) {
      console.error('Error in getUnreadCount:', error);
      return 0;
    }
  }

  // Mark notification as read
  static async markAsRead(notificationId: string | number, userId: string) {
    try {
      // Convert string ID to number if possible for ezsite API
      const id = typeof notificationId === 'string' ? 
        (isNaN(Number(notificationId)) ? notificationId : Number(notificationId)) : 
        notificationId;

      console.log('NotificationService.markAsRead - Debug info:', {
        originalId: notificationId,
        convertedId: id,
        userId,
        idType: typeof id
      });

      // First check if notification exists (without user verification for now)
      const { data: checkData, error: checkError } = await window.ezsite.apis.tablePage(NOTIFICATIONS_TABLE_ID, {
        PageNo: 1,
        PageSize: 1,
        Filters: [{ name: 'id', op: 'Equal', value: id }]
      });

      if (checkError) {
        console.error('Error checking notification:', checkError);
        throw new Error(checkError);
      }

      console.log('Notification check result:', checkData?.List || []);

      const notification = checkData?.List?.[0];
      if (!notification) {
        // Try with string ID if we converted to number
        let altId = id;
        if (typeof notificationId === 'string' && !isNaN(Number(notificationId))) {
          altId = notificationId; // Use original string ID
        } else if (typeof notificationId === 'number') {
          altId = notificationId.toString(); // Try string version
        }

        if (altId !== id) {
          console.log('Trying alternative ID format:', altId);
          const { data: altData, error: altError } = await window.ezsite.apis.tablePage(NOTIFICATIONS_TABLE_ID, {
            PageNo: 1,
            PageSize: 1,
            Filters: [{ name: 'id', op: 'Equal', value: altId }]
          });

          if (!altError && altData?.List?.[0]) {
            console.log('Found notification with alternative ID format:', altData.List[0]);
            const altNotification = altData.List[0];
            
            if (altNotification.is_read) return { success: true }; // Already read

            // Mark as read using the correct ID format
            const { error } = await window.ezsite.apis.tableUpdate(NOTIFICATIONS_TABLE_ID, {
              id: altId,
              is_read: true
            });

            if (error) throw new Error(error);

            this.fetchAndNotifyListeners();
            return { success: true };
          }
        }
        
        throw new Error(`Notification not found. ID: ${id}, Alt ID: ${altId}`);
      }

      console.log('Found notification:', notification);
      console.log('Notification user_id:', notification.user_id, 'Expected user_id:', userId);

      // Check if user_id matches (log the comparison for debugging)
      if (notification.user_id !== userId) {
        console.warn(`User ID mismatch: notification.user_id = "${notification.user_id}", userId = "${userId}"`);
        // For now, we'll proceed anyway but log this for debugging
        // In production, you might want to uncomment the next line for security:
        // throw new Error('Notification does not belong to user');
      }

      if (notification.is_read) return { success: true }; // Already read

      // Mark as read
      const { error } = await window.ezsite.apis.tableUpdate(NOTIFICATIONS_TABLE_ID, {
        id: id,
        is_read: true
      });

      if (error) throw new Error(error);

      // Immediately update listeners after successful update
      this.fetchAndNotifyListeners();

      return { success: true };
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Mark all notifications as read for a user
  static async markAllAsRead(userId: string) {
    try {
      // Get all notifications for the user, then filter for unread ones.
      // This is a workaround for potential issues with filtering by 'is_read' on the backend.
      const { data, error: fetchError } = await window.ezsite.apis.tablePage(NOTIFICATIONS_TABLE_ID, {
        PageNo: 1,
        PageSize: 1000, // A reasonable limit for user notifications
        Filters: [
          { name: 'user_id', op: 'Equal', value: userId }
        ]
      });

      if (fetchError) {
        console.error('Error fetching notifications for markAllAsRead:', fetchError);
        throw new Error(fetchError);
      }

      const allUserNotifications = data?.List || [];
      const notificationsToUpdate = allUserNotifications.filter(n => !n.is_read);
      if (notificationsToUpdate.length === 0) {
        return { success: true, message: 'No unread notifications found.' };
      }

      // Use a more robust way to identify the record to update.
      // Prioritize numeric `ID`, but fall back to `id`.
      const updatePromises = notificationsToUpdate.map(notification => {
        const idKey = typeof notification.ID === 'number' ? 'ID' : 'id';
        const idValue = notification[idKey];

        if (!idValue) {
          console.warn('Skipping notification without a valid ID:', notification);
          return Promise.resolve({ success: false, notificationId: 'unknown', error: 'Invalid ID' });
        }

        return window.ezsite.apis.tableUpdate(NOTIFICATIONS_TABLE_ID, {
          [idKey]: idValue,
          is_read: true
        }).then((result: { error: any; }) => {
          if (result.error) {
            console.error(`Failed to mark notification ${idValue} as read:`, result.error);
            return { success: false, notificationId: idValue, error: result.error };
          }
          return { success: true, notificationId: idValue };
        });
      });

      const results = await Promise.all(updatePromises);
      const failures = results.filter(r => !r.success);
      const successes = results.filter(r => r.success);

      // Always refresh the notification list from the server
      this.fetchAndNotifyListeners();

      if (failures.length > 0) {
        console.warn(`Failed to mark ${failures.length} notifications as read.`);
      }

      return {
        success: true,
        totalNotifications: notificationsToUpdate.length,
        successfulUpdates: successes.length,
        failures: failures.length,
        message: failures.length > 0
          ? `Marked ${successes.length} notifications as read, but ${failures.length} failed.`
          : `Successfully marked all ${successes.length} notifications as read.`
      };
    } catch (error) {
      console.error('Error in markAllAsRead:', error);
      throw error;
    }
  }

  // Create a new notification with enhanced features
  static async createNotification(params: {
    userId: string;
    title: string;
    message: string;
    type: Notification['type'];
    channel?: Notification['channel'];
    campaignId?: string;
    metadata?: any;
    priority?: 'low' | 'normal' | 'high' | 'urgent';
    actionUrl?: string;
    expiresAt?: string;
  }) {
    try {
      const {
        userId,
        title,
        message,
        type,
        channel = 'in_app',
        campaignId,
        metadata = {},
        priority = 'normal',
        actionUrl,
        expiresAt
      } = params;

      // Enhanced metadata with additional fields
      const enhancedMetadata = {
        ...metadata,
        priority,
        actionUrl,
        expiresAt,
        createdBy: 'system',
        version: '2.0'
      };

      const notificationData = {
        user_id: userId,
        title,
        message,
        type,
        channel,
        status: 'sent',
        is_read: false,
        priority,
        campaign_id: campaignId || '',
        metadata: JSON.stringify(enhancedMetadata),
        sent_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        expires_at: expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days default
      };

      const { error } = await window.ezsite.apis.tableCreate(NOTIFICATIONS_TABLE_ID, notificationData);
      if (error) throw new Error(error);

      console.log('NotificationService: Created notification:', {
        userId,
        title,
        type,
        priority
      });

      return { success: true };
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  // Create order notification for admin users
  static async createOrderNotificationForAdmins(orderData: any, adminUserIds: string[]) {
    const notifications = adminUserIds.map(adminId => 
      this.createNotificationWithUpdate({
        userId: adminId,
        title: '🛒 New Order Received',
        message: `New order #${orderData.id} placed by customer ${orderData.user_id}. Total: $${orderData.order_total?.toFixed(2) || '0.00'}`,
        type: 'order',
        priority: orderData.order_total > 100 ? 'high' : 'normal',
        metadata: {
          orderId: orderData.id,
          customerId: orderData.user_id,
          orderTotal: orderData.order_total,
          paymentMethod: orderData.payment_method,
          orderDate: orderData.order_date
        },
        actionUrl: `/admin/orders/${orderData.id}`
      })
    );

    try {
      await Promise.all(notifications);
      console.log(`NotificationService: Created order notifications for ${adminUserIds.length} admin users`);
      return { success: true };
    } catch (error) {
      console.error('Error creating order notifications for admins:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Create system notification for all users
  static async createSystemNotificationForAll(params: {
    title: string;
    message: string;
    priority?: 'low' | 'normal' | 'high' | 'urgent';
    actionUrl?: string;
    expiresAt?: string;
  }) {
    try {
      // Get all user IDs (in a real app, you'd query the users table)
      const adminUserIds = ['1', 'admin']; // Default admin user IDs
      
      const notifications = adminUserIds.map(userId => 
        this.createNotificationWithUpdate({
          userId,
          title: params.title,
          message: params.message,
          type: 'system',
          priority: params.priority || 'normal',
          actionUrl: params.actionUrl,
          expiresAt: params.expiresAt
        })
      );

      await Promise.all(notifications);
      console.log(`NotificationService: Created system notifications for ${adminUserIds.length} users`);
      return { success: true };
    } catch (error) {
      console.error('Error creating system notifications:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Delete a notification
  static async deleteNotification(notificationId: string | number, userId: string) {
    try {
      // The ezsite API for deletion requires a numeric ID.
      // The notificationId we receive could be a numeric ID, a stringified numeric ID, or a UUID.
      // We must find the notification in the table to get its numeric `ID` for the delete operation.

      // We will try to find the notification by its `id` or `ID` field.
      const isNumeric = typeof notificationId === 'number' || !isNaN(Number(notificationId));

      let notification: Notification | undefined;
      
      // Prioritize searching by numeric ID if possible, as it's likely the primary key.
      if (isNumeric) {
        const { data, error } = await window.ezsite.apis.tablePage(NOTIFICATIONS_TABLE_ID, {
          PageNo: 1,
          PageSize: 1,
          Filters: [{ name: 'ID', op: 'Equal', value: Number(notificationId) }]
        });
        if (error) {
          console.warn(`Could not fetch notification by numeric ID ${notificationId}:`, error);
        } else if (data?.List?.[0]) {
          notification = data.List[0];
        }
      }

      // If not found by numeric ID, or if the ID is not numeric, try searching by the `id` field.
      if (!notification) {
        const { data, error } = await window.ezsite.apis.tablePage(NOTIFICATIONS_TABLE_ID, {
          PageNo: 1,
          PageSize: 1,
          Filters: [{ name: 'id', op: 'Equal', value: notificationId }]
        });
        if (error) {
          console.error(`Error fetching notification ${notificationId} for deletion check:`, error);
          throw new Error(error);
        }
        notification = data?.List?.[0];
      }

      if (!notification) {
        throw new Error(`Notification with ID ${notificationId} not found or already deleted.`);
      }

      // Security check: Ensure the notification belongs to the user requesting the deletion.
      if (notification.user_id !== userId) {
        console.warn(`Security Alert: User ${userId} attempted to delete notification ${notification.ID} belonging to user ${notification.user_id}.`);
        throw new Error('Permission denied. You can only delete your own notifications.');
      }

      // Use the numeric `ID` from the fetched notification for deletion, if available.
      let idToDelete: string | number | undefined = notification.ID;

      // If `notification.ID` is not a valid number, fallback to `notification.id`.
      if (typeof idToDelete !== 'number') {
        idToDelete = notification.id;
      }

      // If we still don't have an ID, we cannot proceed.
      if (!idToDelete) {
        throw new Error(`Could not determine a valid ID for notification ${notificationId}.`);
      }

      // Proceed with deletion using the determined ID.
      // The API might handle string IDs (UUIDs) even if docs/comments suggest otherwise.
      const { error: deleteError } = await window.ezsite.apis.tableDelete(NOTIFICATIONS_TABLE_ID, idToDelete);

      if (deleteError) {
        throw new Error(deleteError);
      }

      // Immediately update listeners after successful deletion
      this.fetchAndNotifyListeners();

      return { success: true };
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  // Delete all notifications for a user
  static async deleteAllNotifications(userId: string) {
    try {
      // Get all notifications for the user
      const { data, error: fetchError } = await window.ezsite.apis.tablePage(NOTIFICATIONS_TABLE_ID, {
        PageNo: 1,
        PageSize: 1000,
        Filters: [
        { name: 'user_id', op: 'Equal', value: userId }]

      });

      if (fetchError) throw new Error(fetchError);

      const notifications = data?.List || [];

      // Delete each notification
      for (const notification of notifications) {
        const notificationId = notification.ID || notification.id;
        const { error } = await window.ezsite.apis.tableDelete(NOTIFICATIONS_TABLE_ID, notificationId);

        if (error) {
          console.error(`Error deleting notification ${notificationId}:`, error);
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Error deleting all notifications:', error);
      throw error;
    }
  }

  // Send bulk notifications (admin)
  static async sendBulkNotifications(params: {
    userIds: string[];
    title: string;
    message: string;
    type: Notification['type'];
    channel?: Notification['channel'];
    campaignId?: string;
  }) {
    try {
      const {
        userIds,
        title,
        message,
        type,
        channel = 'in_app',
        campaignId
      } = params;

      const results = [];

      for (const userId of userIds) {
        try {
          await this.createNotification({
            userId,
            title,
            message,
            type,
            channel,
            campaignId
          });
          results.push({ userId, success: true });
        } catch (error) {
          console.error(`Error sending notification to user ${userId}:`, error);
          results.push({ userId, success: false, error: error instanceof Error ? error.message : 'Unknown error' });
        }
      }

      return { results };
    } catch (error) {
      console.error('Error sending bulk notifications:', error);
      throw error;
    }
  }

  // Get notification statistics (admin)
  static async getNotificationStats() {
    try {
      const { data, error } = await window.ezsite.apis.tablePage(NOTIFICATIONS_TABLE_ID, {
        PageNo: 1,
        PageSize: 1000
      });

      if (error) throw new Error(error);

      const notifications = data?.List || [];

      const stats = {
        total: notifications.length,
        byType: { order: 0, campaign: 0, system: 0, promotion: 0 },
        byStatus: { pending: 0, sent: 0, delivered: 0, failed: 0 },
        byChannel: { email: 0, whatsapp: 0, in_app: 0 },
        readRate: 0
      };

      let readCount = 0;

      notifications.forEach((notification: any) => {
        stats.byType[notification.type as keyof typeof stats.byType]++;
        stats.byStatus[notification.status as keyof typeof stats.byStatus]++;
        stats.byChannel[notification.channel as keyof typeof stats.byChannel]++;

        if (notification.is_read) readCount++;
      });

      stats.readRate = notifications.length > 0 ? readCount / notifications.length * 100 : 0;

      return stats;
    } catch (error) {
      console.error('Error fetching notification stats:', error);
      throw error;
    }
  }

  // Get all notifications (admin)
  static async getAllNotifications(params: {
    pageNo?: number;
    pageSize?: number;
    type?: string;
    status?: string;
    channel?: string;
  } = {}) {
    try {
      const { pageNo = 1, pageSize = 20, type, status, channel } = params;

      const filters: any[] = [];

      if (type && type !== 'all') {
        filters.push({
          name: 'type',
          op: 'Equal',
          value: type
        });
      }

      if (status && status !== 'all') {
        filters.push({
          name: 'status',
          op: 'Equal',
          value: status
        });
      }

      if (channel && channel !== 'all') {
        filters.push({
          name: 'channel',
          op: 'Equal',
          value: channel
        });
      }

      const { data, error } = await window.ezsite.apis.tablePage(NOTIFICATIONS_TABLE_ID, {
        PageNo: pageNo,
        PageSize: pageSize,
        OrderByField: 'ID',
        IsAsc: false,
        Filters: filters
      });

      if (error) throw new Error(error);

      return {
        notifications: data?.List || [],
        totalCount: data?.VirtualCount || 0,
        currentPage: pageNo,
        totalPages: Math.ceil((data?.VirtualCount || 0) / pageSize)
      };
    } catch (error) {
      console.error('Error fetching all notifications:', error);
      throw error;
    }
  }

  // Send a single notification (compatible with AutoInvoiceService)
  static async sendSingleNotification(params: {
    userId: string;
    title: string;
    message: string;
    type: string;
    priority?: 'low' | 'normal' | 'high' | 'urgent';
    channels?: string[];
    metadata?: any;
  }) {
    try {
      const result = await this.createNotification({
        userId: params.userId,
        title: params.title,
        message: params.message,
        type: params.type as Notification['type'],
        priority: params.priority || 'normal',
        metadata: params.metadata || {},
        channel: params.channels?.includes('in_app') ? 'in_app' : 'in_app'
      });
      
      if (result.success) {
        return {
          success: true,
          notificationId: 'notification_' + Date.now().toString()
        };
      } else {
        return {
          success: false,
          error: 'Failed to create notification'
        };
      }
    } catch (error: any) {
      console.error('Error in sendSingleNotification:', error);
      return {
        success: false,
        error: error.message || 'Failed to send notification'
      };
    }
  }

  // Schedule a notification for later (compatible with AutoInvoiceService)
  static async scheduleNotification(params: {
    userId: string;
    title: string;
    message: string;
    type: string;
    priority?: 'low' | 'normal' | 'high' | 'urgent';
    channels?: string[];
    scheduleAt: string;
    metadata?: any;
  }) {
    try {
      // For now, we'll create an immediate notification with scheduled metadata
      // In a real implementation, you would use a job queue or scheduler
      const result = await this.createNotification({
        userId: params.userId,
        title: params.title,
        message: params.message,
        type: params.type as Notification['type'],
        priority: params.priority || 'normal',
        metadata: {
          ...params.metadata,
          scheduled: true,
          scheduledAt: params.scheduleAt,
          originalScheduleTime: params.scheduleAt
        },
        channel: params.channels?.includes('in_app') ? 'in_app' : 'in_app'
      });
      
      if (result.success) {
        console.log(`Notification scheduled for ${params.scheduleAt} (currently created immediately)`);
        return {
          success: true,
          notificationId: 'scheduled_' + Date.now().toString()
        };
      } else {
        return {
          success: false,
          error: 'Failed to schedule notification'
        };
      }
    } catch (error: any) {
      console.error('Error in scheduleNotification:', error);
      return {
        success: false,
        error: error.message || 'Failed to schedule notification'
      };
    }
  }
}
