const fetch = require('node-fetch');

const testInvoiceAPI = async () => {
  try {
    console.log('Testing Invoice API...');
    
    const response = await fetch('http://localhost:3001/api/table/10415', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    
    const data = await response.json();
    console.log('Invoice API Response:', data);
    
    if (data.success) {
      console.log('✅ Invoice API is working');
      console.log('📄 Total invoices:', data.data?.List?.length || 0);
    } else {
      console.log('❌ Invoice API error:', data.error);
    }
  } catch (error) {
    console.error('❌ Invoice API test failed:', error);
  }
};

testInvoiceAPI(); 