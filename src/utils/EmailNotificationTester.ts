import { EmailService } from '../services/EmailService';

export class EmailNotificationTester {
  // Test basic admin order notification
  static async testBasicAdminNotification() {
    const mockOrderData = {
      id: `TEST_ORDER_${Date.now()}`,
      user_id: 'test_customer_123',
      order_total: 75.99,
      payment_method: 'Credit Card',
      order_date: new Date().toISOString(),
      order_status: 'pending',
      tracking_number: `TN${Date.now().toString().slice(-8)}`,
      estimated_delivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };

    console.log('EmailNotificationTester: Testing basic admin notification...');
    const result = await EmailService.sendAdminOrderNotification(mockOrderData);
    
    if (result.success) {
      console.log('✅ Basic admin notification test PASSED');
    } else {
      console.error('❌ Basic admin notification test FAILED:', result.error);
    }
    
    return result;
  }

  // Test enhanced admin order notification
  static async testEnhancedAdminNotification() {
    const mockOrderData = {
      id: `TEST_ENHANCED_${Date.now()}`,
      user_id: 'test_customer_456',
      order_total: 125.50,
      payment_method: 'Razorpay',
      order_date: new Date().toISOString(),
      order_status: 'pending',
      tracking_number: `TN${Date.now().toString().slice(-8)}`,
      estimated_delivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
    };

    const mockOrderItems = [
      {
        product_id: 'PROD001',
        product_name: 'Spicy Mango Pickle',
        product_price: 15.99,
        quantity: 2,
        description: 'Premium spicy mango pickle with authentic spices'
      },
      {
        product_id: 'PROD002',
        product_name: 'Gongura Pickle',
        product_price: 18.99,
        quantity: 1,
        description: 'Traditional gongura pickle with fresh sorrel leaves'
      },
      {
        product_id: 'PROD003',
        product_name: 'Chicken Pickle',
        product_price: 22.99,
        quantity: 3,
        description: 'Boneless chicken pickle with aromatic spices'
      }
    ];

    const mockCustomerInfo = {
      name: 'Test Customer',
      email: 'test.customer@example.com',
      phone: '+1 (555) 123-4567'
    };

    console.log('EmailNotificationTester: Testing enhanced admin notification...');
    const result = await EmailService.sendEnhancedAdminOrderNotification(
      mockOrderData, 
      mockOrderItems, 
      mockCustomerInfo
    );
    
    if (result.success) {
      console.log('✅ Enhanced admin notification test PASSED');
    } else {
      console.error('❌ Enhanced admin notification test FAILED:', result.error);
    }
    
    return result;
  }

  // Test urgent admin notification
  static async testUrgentAdminNotification() {
    const mockOrderData = {
      id: `TEST_URGENT_${Date.now()}`,
      user_id: 'vip_customer_789',
      order_total: 299.99,
      payment_method: 'Premium Credit Card',
      order_date: new Date().toISOString(),
      order_status: 'pending',
      tracking_number: `TN${Date.now().toString().slice(-8)}`,
      estimated_delivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
    };

    console.log('EmailNotificationTester: Testing urgent admin notification...');
    const result = await EmailService.sendUrgentAdminNotification(
      mockOrderData, 
      'High-value VIP customer order requiring immediate attention'
    );
    
    if (result.success) {
      console.log('✅ Urgent admin notification test PASSED');
    } else {
      console.error('❌ Urgent admin notification test FAILED:', result.error);
    }
    
    return result;
  }

  // Test order confirmation to customer
  static async testCustomerOrderConfirmation() {
    const mockOrderData = {
      id: `TEST_CUSTOMER_${Date.now()}`,
      user_id: 'test_customer_001',
      order_total: 45.97,
      payment_method: 'Debit Card',
      order_date: new Date().toISOString(),
      order_status: 'confirmed',
      tracking_number: `TN${Date.now().toString().slice(-8)}`,
      estimated_delivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      items: [
        {
          product_name: 'Mixed Vegetable Pickle',
          product_price: 12.99,
          quantity: 2
        },
        {
          product_name: 'Lemon Pickle',
          product_price: 9.99,
          quantity: 2
        }
      ]
    };

    console.log('EmailNotificationTester: Testing customer order confirmation...');
    const result = await EmailService.sendOrderConfirmation(
      mockOrderData, 
      'test.customer@example.com'
    );
    
    if (result.success) {
      console.log('✅ Customer order confirmation test PASSED');
    } else {
      console.error('❌ Customer order confirmation test FAILED:', result.error);
    }
    
    return result;
  }

  // Run all email notification tests
  static async runAllTests() {
    console.log('🧪 Starting Email Notification System Tests...\n');
    
    const results = {
      basicAdmin: await this.testBasicAdminNotification(),
      enhancedAdmin: await this.testEnhancedAdminNotification(),
      urgentAdmin: await this.testUrgentAdminNotification(),
      customerConfirmation: await this.testCustomerOrderConfirmation()
    };

    console.log('\n📊 Email Notification Test Results:');
    console.log('=====================================');
    console.log(`Basic Admin Notification: ${results.basicAdmin.success ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Enhanced Admin Notification: ${results.enhancedAdmin.success ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Urgent Admin Notification: ${results.urgentAdmin.success ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Customer Confirmation: ${results.customerConfirmation.success ? '✅ PASS' : '❌ FAIL'}`);
    
    const passCount = Object.values(results).filter(r => r.success).length;
    const totalCount = Object.values(results).length;
    
    console.log(`\n📈 Overall Success Rate: ${passCount}/${totalCount} (${((passCount / totalCount) * 100).toFixed(1)}%)`);
    
    if (passCount === totalCount) {
      console.log('🎉 All email notification tests PASSED! The system is working correctly.');
    } else {
      console.log('⚠️ Some email notification tests FAILED. Please check the server configuration and try again.');
    }
    
    return results;
  }

  // Test email configuration
  static async testEmailConfiguration() {
    console.log('🔧 Testing email configuration...');
    
    try {
      const testResult = await fetch('/api/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const result = await testResult.json();
      
      if (result.success) {
        console.log('✅ Email configuration test PASSED');
        console.log('📧 Test email sent successfully with message ID:', result.messageId);
      } else {
        console.error('❌ Email configuration test FAILED:', result.error);
      }
      
      return result;
    } catch (error) {
      console.error('❌ Email configuration test FAILED with exception:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}

// Export for global access in development
if (typeof window !== 'undefined') {
  (window as any).EmailNotificationTester = EmailNotificationTester;
}
