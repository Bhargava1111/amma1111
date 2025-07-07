// Simple email test script
const testEmail = async () => {
  try {
    const response = await fetch('http://localhost:3001/api/test-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Email test successful!');
      console.log('Message ID:', result.messageId);
      console.log('Check admin@manaeats.com for the test email');
    } else {
      console.log('❌ Email test failed:', result.error);
    }
  } catch (error) {
    console.log('❌ Error testing email:', error.message);
  }
};

// Test order notification email
const testOrderNotification = async () => {
  try {
    const sampleOrderData = {
      to: ['admin@manaeats.com'],
      subject: 'Test Order Notification - MANAfoods',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>🛒 New Order Received!</h2>
          <p>This is a test email to verify order notifications are working.</p>
          <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Order Details:</h3>
            <p><strong>Order ID:</strong> TEST_ORDER_123</p>
            <p><strong>Customer:</strong> Test Customer</p>
            <p><strong>Total:</strong> $29.99</p>
            <p><strong>Items:</strong> 2 (Spicy Mango Pickle, Gongura Pickle)</p>
            <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          </div>
          <p>Please process this order promptly to maintain customer satisfaction.</p>
        </div>
      `,
      text: 'Test order notification - New order received from test customer'
    };

    const response = await fetch('http://localhost:3001/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sampleOrderData)
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Order notification test successful!');
      console.log('Message ID:', result.messageId);
    } else {
      console.log('❌ Order notification test failed:', result.error);
    }
  } catch (error) {
    console.log('❌ Error testing order notification:', error.message);
  }
};

console.log('🧪 Testing Email Configuration...');
console.log('Make sure your server is running on port 3001');
console.log('');

// Run tests
testEmail();
setTimeout(testOrderNotification, 2000); 