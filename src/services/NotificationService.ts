const NOTIFICATIONS_TABLE_ID = '10412';

export interface Notification {
  id: number;
  user_id: string;
  title: string;
  message: string;
  type: 'order' | 'campaign' | 'system' | 'promotion';
  channel: 'email' | 'whatsapp' | 'in_app';
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  is_read: boolean;
  campaign_id?: string;
  metadata: string;
  sent_at?: string;
  created_at: string;
}

export class NotificationService {
  // Get notifications for a user
  static async getUserNotifications(userId: string, params: {
    pageNo?: number;
    pageSize?: number;
    type?: string;
    isRead?: boolean;
  } = {}) {
    try {
      const { pageNo = 1, pageSize = 20, type, isRead } = params;

      const filters: any[] = [
      { name: 'user_id', op: 'Equal', value: userId }];


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
  static async markAsRead(notificationId: number, userId: string) {
    try {
      // Verify notification belongs to user
      const { data, error: fetchError } = await window.ezsite.apis.tablePage(NOTIFICATIONS_TABLE_ID, {
        PageNo: 1,
        PageSize: 1,
        Filters: [
        { name: 'id', op: 'Equal', value: notificationId },
        { name: 'user_id', op: 'Equal', value: userId }]

      });

      if (fetchError) throw new Error(fetchError);

      const notification = data?.List?.[0];
      if (!notification) throw new Error('Notification not found');

      if (notification.is_read) return { success: true }; // Already read

      // Mark as read
      const { error } = await window.ezsite.apis.tableUpdate(NOTIFICATIONS_TABLE_ID, {
        id: notificationId,
        is_read: true
      });

      if (error) throw new Error(error);

      return { success: true };
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Mark all notifications as read for a user
  static async markAllAsRead(userId: string) {
    try {
      // Get all unread notifications
      const { data, error: fetchError } = await window.ezsite.apis.tablePage(NOTIFICATIONS_TABLE_ID, {
        PageNo: 1,
        PageSize: 1000,
        Filters: [
        { name: 'user_id', op: 'Equal', value: userId },
        { name: 'is_read', op: 'Equal', value: false }]

      });

      if (fetchError) throw new Error(fetchError);

      const notifications = data?.List || [];

      // Mark each notification as read
      for (const notification of notifications) {
        const { error } = await window.ezsite.apis.tableUpdate(NOTIFICATIONS_TABLE_ID, {
          id: notification.id,
          is_read: true
        });

        if (error) {
          console.error(`Error marking notification ${notification.id} as read:`, error);
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  // Create a new notification
  static async createNotification(params: {
    userId: string;
    title: string;
    message: string;
    type: Notification['type'];
    channel?: Notification['channel'];
    campaignId?: string;
    metadata?: any;
  }) {
    try {
      const {
        userId,
        title,
        message,
        type,
        channel = 'in_app',
        campaignId,
        metadata = {}
      } = params;

      const notificationData = {
        user_id: userId,
        title,
        message,
        type,
        channel,
        status: 'sent',
        is_read: false,
        campaign_id: campaignId || '',
        metadata: JSON.stringify(metadata),
        sent_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      };

      const { error } = await window.ezsite.apis.tableCreate(NOTIFICATIONS_TABLE_ID, notificationData);
      if (error) throw new Error(error);

      return { success: true };
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  // Delete a notification
  static async deleteNotification(notificationId: number, userId: string) {
    try {
      // Verify notification belongs to user
      const { data, error: fetchError } = await window.ezsite.apis.tablePage(NOTIFICATIONS_TABLE_ID, {
        PageNo: 1,
        PageSize: 1,
        Filters: [
        { name: 'id', op: 'Equal', value: notificationId },
        { name: 'user_id', op: 'Equal', value: userId }]

      });

      if (fetchError) throw new Error(fetchError);

      const notification = data?.List?.[0];
      if (!notification) throw new Error('Notification not found');

      // Delete notification
      const { error } = await window.ezsite.apis.tableDelete(NOTIFICATIONS_TABLE_ID, notificationId);

      if (error) throw new Error(error);

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
        const { error } = await window.ezsite.apis.tableDelete(NOTIFICATIONS_TABLE_ID, notification.id);

        if (error) {
          console.error(`Error deleting notification ${notification.id}:`, error);
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
}
