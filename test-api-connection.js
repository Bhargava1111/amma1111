// Test API connection after fixing the port
const https = require('http');

async function testAPI() {
  console.log('🔍 Testing API connection to localhost:3001...\n');
  
  // Test 1: Server Health Check
  try {
    const response = await fetch('http://localhost:3001/api/auth/user');
    console.log(`✅ Server responding on port 3001`);
    console.log(`   Status: ${response.status}`);
    console.log(`   Response: ${response.status === 401 ? 'Unauthorized (expected)' : 'OK'}`);
  } catch (error) {
    console.log(`❌ Server health test failed: ${error.message}`);
    return;
  }
  
  // Test 2: Login with test credentials
  try {
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      })
    });
    
    const loginResult = await loginResponse.json();
    
    if (loginResult.success) {
      console.log(`✅ Login test passed`);
      console.log(`   User: ${loginResult.data.Name}`);
    } else {
      console.log(`❌ Login test failed: ${loginResult.error}`);
    }
  } catch (error) {
    console.log(`❌ Login test error: ${error.message}`);
  }
  
  // Test 3: Table API (notifications)
  try {
    const tableResponse = await fetch('http://localhost:3001/api/table/10412', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        PageNo: 1,
        PageSize: 10,
        OrderByField: 'created_at',
        IsAsc: false,
        Filters: []
      })
    });
    
    const tableResult = await tableResponse.json();
    
    if (tableResult.success) {
      console.log(`✅ Table API test passed`);
      console.log(`   Records found: ${tableResult.data?.length || 0}`);
    } else {
      console.log(`❌ Table API test failed: ${tableResult.error}`);
    }
  } catch (error) {
    console.log(`❌ Table API test error: ${error.message}`);
  }
  
  console.log('\n🎉 API connection tests completed!');
  console.log('💡 If all tests passed, your frontend should now work correctly.');
  console.log('🔄 You may need to refresh your browser to pick up the changes.');
}

testAPI(); 