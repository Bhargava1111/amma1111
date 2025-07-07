// Test server connection and API endpoints
const testServerConnection = async () => {
  console.log('🔍 Testing server connection...');
  
  try {
    // Test 1: Check if server is running
    const response = await fetch('http://localhost:3001/api/table/10411', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    
    if (response.ok) {
      console.log('✅ Server is running on port 3001');
      const data = await response.json();
      console.log('📊 Users table response:', data);
    } else {
      console.error('❌ Server responded with error:', response.status);
    }
    
    // Test 2: Check authentication endpoint
    const authResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      })
    });
    
    if (authResponse.ok) {
      console.log('✅ Authentication endpoint working');
      const authData = await authResponse.json();
      console.log('🔐 Auth response:', authData);
    } else {
      console.error('❌ Authentication endpoint failed:', authResponse.status);
    }
    
    // Test 3: Check products endpoint
    const productsResponse = await fetch('http://localhost:3001/api/table/10403', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    
    if (productsResponse.ok) {
      console.log('✅ Products endpoint working');
      const productsData = await productsResponse.json();
      console.log('📦 Products count:', productsData.data?.length || 0);
    } else {
      console.error('❌ Products endpoint failed:', productsResponse.status);
    }
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.log('💡 Make sure the server is running with: cd server && node server.js');
  }
};

// Run the test
testServerConnection(); 