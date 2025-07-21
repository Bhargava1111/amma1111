// Push Notification Service for Browser Push Notifications
export class PushNotificationService {
  private static swRegistration: ServiceWorkerRegistration | null = null;
  private static isSupported = false;
  private static isInitialized = false;

  // Initialize push notification service
  static async initialize() {
    if (this.isInitialized) return;

    try {
      // Check if push notifications are supported
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.warn('Push notifications are not supported in this browser');
        return;
      }

      this.isSupported = true;

      // Register service worker
      const registration = await navigator.serviceWorker.register('/sw.js');
      this.swRegistration = registration;

      console.log('Push notification service initialized successfully');
      this.isInitialized = true;

    } catch (error) {
      console.error('Error initializing push notification service:', error);
    }
  }

  // Check if push notifications are supported
  static isNotificationSupported(): boolean {
    return this.isSupported;
  }

  // Get current permission status
  static getPermissionStatus(): NotificationPermission {
    return Notification.permission;
  }

  // Request push notification permission
  static async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported) {
      throw new Error('Push notifications are not supported');
    }

    try {
      const permission = await Notification.requestPermission();
      console.log('Push notification permission:', permission);
      return permission;
    } catch (error) {
      console.error('Error requesting push notification permission:', error);
      throw error;
    }
  }

  // Subscribe to push notifications
  static async subscribe(userId: string): Promise<PushSubscription | null> {
    if (!this.isSupported || !this.swRegistration) {
      throw new Error('Push notifications are not available');
    }

    try {
      const permission = await this.requestPermission();
      if (permission !== 'granted') {
        throw new Error('Push notification permission denied');
      }

      // Create push subscription
      const subscription = await this.swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.getVapidPublicKey())
      });

      // Send subscription to server
      await this.sendSubscriptionToServer(userId, subscription);

      console.log('Push notification subscription created:', subscription);
      return subscription;

    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      throw error;
    }
  }

  // Unsubscribe from push notifications
  static async unsubscribe(): Promise<boolean> {
    if (!this.swRegistration) {
      return false;
    }

    try {
      const subscription = await this.swRegistration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        console.log('Push notification subscription removed');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      return false;
    }
  }

  // Send local notification
  static async sendLocalNotification(options: {
    title: string;
    body: string;
    icon?: string;
    badge?: string;
    tag?: string;
    data?: any;
    actions?: any[];
    requireInteraction?: boolean;
    silent?: boolean;
  }): Promise<void> {
    if (!this.isSupported) {
      throw new Error('Notifications are not supported');
    }

    const permission = await this.requestPermission();
    if (permission !== 'granted') {
      throw new Error('Notification permission denied');
    }

    const notificationOptions: NotificationOptions = {
      body: options.body,
      icon: options.icon || '/favicon.ico',
      badge: options.badge || '/favicon.ico',
      tag: options.tag,
      data: options.data,

      requireInteraction: options.requireInteraction || false,
      silent: options.silent || false
    };

    if (this.swRegistration) {
      // Use service worker for better notification handling
      await this.swRegistration.showNotification(options.title, notificationOptions);
    } else {
      // Fallback to browser notification
      new Notification(options.title, notificationOptions);
    }
  }

  // Send subscription to server
  private static async sendSubscriptionToServer(userId: string, subscription: PushSubscription): Promise<void> {
    try {
      const response = await fetch('/api/push-notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          subscription: subscription.toJSON()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send subscription to server');
      }

      console.log('Push subscription sent to server successfully');
    } catch (error) {
      console.error('Error sending subscription to server:', error);
      throw error;
    }
  }

  // Get VAPID public key (replace with your actual VAPID public key)
  private static getVapidPublicKey(): string {
    // This should be replaced with your actual VAPID public key
    return 'BEl62iUYgUivxIkv69yViEuiBIa40HEMqc3kKaWfqJAUqObBLfvNYxJIe6PQqrxHbxYJlRGNKzGQlNHjnbNdGHE';
  }

  // Convert VAPID key to Uint8Array
  private static urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Test push notification
  static async testNotification(): Promise<void> {
    try {
      await this.sendLocalNotification({
        title: '🧪 Test Notification',
        body: 'This is a test notification from MANAfoods!',
        icon: '/favicon.ico',
        tag: 'test-notification',
        data: { test: true },
        requireInteraction: true
      });
    } catch (error) {
      console.error('Error sending test notification:', error);
      throw error;
    }
  }

  // Get notification actions for different types
  static getNotificationActions(type: string): Array<{ action: string; title: string }> {
    switch (type) {
      case 'order':
        return [
          { action: 'view', title: 'View Order' },
          { action: 'dismiss', title: 'Dismiss' }
        ];
      case 'promotion':
        return [
          { action: 'view', title: 'View Offer' },
          { action: 'dismiss', title: 'Not Interested' }
        ];
      case 'system':
        return [
          { action: 'view', title: 'View Details' },
          { action: 'dismiss', title: 'OK' }
        ];
      default:
        return [
          { action: 'dismiss', title: 'Dismiss' }
        ];
    }
  }

  // Handle notification click
  static handleNotificationClick(event: any): void {
    event.notification.close();

    if (event.action === 'view') {
      // Open app or specific page
      const data = event.notification.data;
      const url = data?.actionUrl || '/';
      
      event.waitUntil(
        (self as any).clients?.matchAll().then((clientList: any) => {
          for (const client of clientList) {
            if (client.url === url && 'focus' in client) {
              return client.focus();
            }
          }
          if ((self as any).clients?.openWindow) {
            return (self as any).clients.openWindow(url);
          }
        })
      );
    }
  }
}

// Export for global access
if (typeof window !== 'undefined') {
  (window as any).PushNotificationService = PushNotificationService;
} 