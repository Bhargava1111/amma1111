import { NotificationService } from '../services/NotificationService';

export class NotificationTester {
  // Test basic notification creation
  static async testBasicNotification(userId: string = '1') {
    console.log('🧪 Testing basic notification creation...');
    
    try {
      const result = await NotificationService.createNotification({
        userId,
        title: 'Test Notification',
        message: 'This is a test notification to verify the system is working.',
        type: 'system',
        priority: 'normal'
      });
      
      if (result.success) {
        console.log('✅ Basic notification test PASSED');
      } else {
        console.error('❌ Basic notification test FAILED');
      }
      
      return result;
    } catch (error) {
      console.error('❌ Basic notification test FAILED with error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Test order notification for admin
  static async testOrderNotification(adminUserIds: string[] = ['1', 'admin']) {
    console.log('🧪 Testing order notification for admins...');
    
    const mockOrder = {
      id: `TEST_ORDER_${Date.now()}`,
      user_id: 'test_customer_123',
      order_total: 99.99,
      payment_method: 'Credit Card',
      order_date: new Date().toISOString(),
      order_status: 'pending',
      tracking_number: `TN${Date.now().toString().slice(-8)}`,
      item_count: 3
    };
    
    try {
      const result = await NotificationService.createOrderNotificationForAdmins(mockOrder, adminUserIds);
      
      if (result.success) {
        console.log('✅ Order notification test PASSED');
      } else {
        console.error('❌ Order notification test FAILED:', result.error);
      }
      
      return result;
    } catch (error) {
      console.error('❌ Order notification test FAILED with error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Test high-priority notification
  static async testHighPriorityNotification(userId: string = '1') {
    console.log('🧪 Testing high-priority notification...');
    
    try {
      const result = await NotificationService.createNotification({
        userId,
        title: '⚡ High Priority Alert',
        message: 'This is a high-priority notification that requires immediate attention.',
        type: 'system',
        priority: 'high',
        actionUrl: '/admin/dashboard',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      });
      
      if (result.success) {
        console.log('✅ High-priority notification test PASSED');
      } else {
        console.error('❌ High-priority notification test FAILED');
      }
      
      return result;
    } catch (error) {
      console.error('❌ High-priority notification test FAILED with error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Test urgent notification
  static async testUrgentNotification(userId: string = '1') {
    console.log('🧪 Testing urgent notification...');
    
    try {
      const result = await NotificationService.createNotification({
        userId,
        title: '🚨 URGENT: System Alert',
        message: 'Critical system issue detected. Immediate action required!',
        type: 'system',
        priority: 'urgent',
        actionUrl: '/admin/system-status',
        metadata: {
          alertType: 'system_critical',
          severity: 'critical',
          requiresAcknowledgment: true
        }
      });
      
      if (result.success) {
        console.log('✅ Urgent notification test PASSED');
      } else {
        console.error('❌ Urgent notification test FAILED');
      }
      
      return result;
    } catch (error) {
      console.error('❌ Urgent notification test FAILED with error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Test promotion notification
  static async testPromotionNotification(userId: string = '1') {
    console.log('🧪 Testing promotion notification...');
    
    try {
      const result = await NotificationService.createNotification({
        userId,
        title: '🎉 Special Offer Just for You!',
        message: 'Get 25% off on all pickle varieties! Limited time offer ending soon.',
        type: 'promotion',
        priority: 'normal',
        actionUrl: '/products?sale=true',
        metadata: {
          promotionCode: 'PICKLE25',
          discountPercent: 25,
          validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        }
      });
      
      if (result.success) {
        console.log('✅ Promotion notification test PASSED');
      } else {
        console.error('❌ Promotion notification test FAILED');
      }
      
      return result;
    } catch (error) {
      console.error('❌ Promotion notification test FAILED with error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Test system notification for all users
  static async testSystemNotificationForAll() {
    console.log('🧪 Testing system notification for all users...');
    
    try {
      const result = await NotificationService.createSystemNotificationForAll({
        title: '📢 System Maintenance Notice',
        message: 'Scheduled maintenance will occur tonight from 2 AM to 4 AM IST. Services may be temporarily unavailable.',
        priority: 'normal',
        actionUrl: '/system-status'
      });
      
      if (result.success) {
        console.log('✅ System notification for all test PASSED');
      } else {
        console.error('❌ System notification for all test FAILED:', result.error);
      }
      
      return result;
    } catch (error) {
      console.error('❌ System notification for all test FAILED with error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Test real-time notification subscription
  static testRealtimeSubscription(userId: string = '1') {
    console.log('🧪 Testing real-time notification subscription...');
    
    let notificationCount = 0;
    
    const unsubscribe = NotificationService.subscribe(userId, (notifications) => {
      notificationCount++;
      console.log(`📡 Real-time update ${notificationCount}: Received ${notifications.length} notifications`);
      
      // Log latest notification
      if (notifications.length > 0) {
        const latest = notifications[0];
        console.log(`Latest: "${latest.title}" - ${latest.message}`);
      }
    });
    
    console.log('✅ Real-time subscription test started');
    console.log('ℹ️ Send test notifications to see real-time updates');
    
    // Return unsubscribe function for cleanup
    return {
      success: true,
      unsubscribe,
      message: 'Real-time subscription active. Use returned unsubscribe function to stop.'
    };
  }

  // Run comprehensive notification tests
  static async runAllTests(userId: string = '1') {
    console.log('🚀 Starting comprehensive notification system tests...\n');
    
    const results = {
      basic: await this.testBasicNotification(userId),
      order: await this.testOrderNotification([userId]),
      highPriority: await this.testHighPriorityNotification(userId),
      urgent: await this.testUrgentNotification(userId),
      promotion: await this.testPromotionNotification(userId),
      systemAll: await this.testSystemNotificationForAll()
    };
    
    // Test real-time subscription
    const realtimeTest = this.testRealtimeSubscription(userId);
    
    console.log('\n📊 Notification System Test Results:');
    console.log('=====================================');
    console.log(`Basic Notification: ${results.basic.success ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Order Notification: ${results.order.success ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`High Priority: ${results.highPriority.success ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Urgent Notification: ${results.urgent.success ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Promotion Notification: ${results.promotion.success ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`System Notification: ${results.systemAll.success ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Real-time Subscription: ${realtimeTest.success ? '✅ PASS' : '❌ FAIL'}`);
    
    const passCount = Object.values(results).filter(r => r.success).length + (realtimeTest.success ? 1 : 0);
    const totalCount = Object.values(results).length + 1;
    
    console.log(`\n📈 Overall Success Rate: ${passCount}/${totalCount} (${((passCount / totalCount) * 100).toFixed(1)}%)`);
    
    if (passCount === totalCount) {
      console.log('🎉 All notification tests PASSED! The system is working perfectly.');
    } else {
      console.log('⚠️ Some notification tests FAILED. Please check the configuration and try again.');
    }
    
    // Auto-cleanup real-time subscription after 30 seconds
    setTimeout(() => {
      if (realtimeTest.unsubscribe) {
        realtimeTest.unsubscribe();
        console.log('🔄 Auto-cleanup: Real-time subscription stopped after 30 seconds');
      }
    }, 30000);
    
    return {
      results,
      realtimeTest,
      passCount,
      totalCount,
      successRate: (passCount / totalCount) * 100
    };
  }

  // Create sample notifications for demo purposes
  static async createSampleNotifications(userId: string = '1') {
    console.log('📝 Creating sample notifications for demonstration...');
    
    const sampleNotifications = [
      {
        title: '🛒 New Order #ORD001',
        message: 'Order from customer John Doe - $45.99 - 3 items',
        type: 'order' as const,
        priority: 'normal' as const,
        actionUrl: '/admin/orders/ORD001'
      },
      {
        title: '💰 High-Value Order Alert',
        message: 'Large order placed - $299.99 - Requires special handling',
        type: 'order' as const,
        priority: 'high' as const,
        actionUrl: '/admin/orders/ORD002'
      },
      {
        title: '🔄 System Update Complete',
        message: 'The recent system update has been successfully installed.',
        type: 'system' as const,
        priority: 'low' as const
      },
      {
        title: '🎯 Marketing Campaign Started',
        message: 'Summer Sale campaign is now live and performing well.',
        type: 'campaign' as const,
        priority: 'normal' as const,
        actionUrl: '/admin/campaigns'
      },
      {
        title: '⚠️ Low Stock Alert',
        message: 'Mango Pickle is running low - only 5 units remaining.',
        type: 'system' as const,
        priority: 'high' as const,
        actionUrl: '/admin/inventory'
      }
    ];
    
    const promises = sampleNotifications.map(notification =>
      NotificationService.createNotification({
        userId,
        ...notification
      })
    );
    
    try {
      const results = await Promise.all(promises);
      const successCount = results.filter(r => r.success).length;
      
      console.log(`✅ Created ${successCount}/${sampleNotifications.length} sample notifications`);
      return { success: true, created: successCount, total: sampleNotifications.length };
    } catch (error) {
      console.error('❌ Error creating sample notifications:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}

// Export for global access in development
if (typeof window !== 'undefined') {
  (window as any).NotificationTester = NotificationTester;
}
