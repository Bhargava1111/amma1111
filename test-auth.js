// Test script to verify authentication is working
const API_BASE_URL = 'http://localhost:3001/api';

async function testAuth() {
  console.log('🧪 Testing Authentication Flow...\n');

  try {
    // Test 1: Login with admin credentials
    console.log('1. Testing admin login...');
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'admin123'
      })
    });

    const loginResult = await loginResponse.json();
    console.log('Login response:', JSON.stringify(loginResult, null, 2));

    if (loginResult.success && loginResult.sessionId) {
      console.log('✅ Login successful with session ID');
      
      // Test 2: Get user info with session
      console.log('\n2. Testing getUserInfo with session...');
      const userInfoResponse = await fetch(`${API_BASE_URL}/getUserInfo`, {
        headers: {
          'x-session-id': loginResult.sessionId
        }
      });

      const userInfoResult = await userInfoResponse.json();
      console.log('User info response:', JSON.stringify(userInfoResult, null, 2));

      if (userInfoResult.success) {
        console.log('✅ getUserInfo successful with session');
      } else {
        console.log('❌ getUserInfo failed with session');
      }

      // Test 3: Logout
      console.log('\n3. Testing logout...');
      const logoutResponse = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': loginResult.sessionId
        }
      });

      const logoutResult = await logoutResponse.json();
      console.log('Logout response:', JSON.stringify(logoutResult, null, 2));

      if (logoutResult.success) {
        console.log('✅ Logout successful');
      } else {
        console.log('❌ Logout failed');
      }

    } else {
      console.log('❌ Login failed');
    }

    // Test 4: Test customer login
    console.log('\n4. Testing customer login...');
    const customerLoginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'customer@example.com',
        password: 'customer123'
      })
    });

    const customerLoginResult = await customerLoginResponse.json();
    console.log('Customer login response:', JSON.stringify(customerLoginResult, null, 2));

    if (customerLoginResult.success) {
      console.log('✅ Customer login successful');
    } else {
      console.log('❌ Customer login failed');
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the test
testAuth(); 