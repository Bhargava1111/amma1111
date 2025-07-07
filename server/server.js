import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import mongoose from 'mongoose';
import nodemailer from 'nodemailer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Configure CORS
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:8080', 'http://127.0.0.1:3000', 'http://127.0.0.1:8080'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Configure express to handle JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../dist/uploads');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Create unique filename with original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'product-' + uniqueSuffix + ext);
  }
});

// File filter to only allow image files
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Middleware
app.use(express.static(path.join(__dirname, '../dist')));

// Admin middleware
const isAdmin = (req, res, next) => {
  const user = db.users.find(u => u.ID === '1'); // Assuming user with ID '1' is admin
  if (user && user.Email === 'admin@example.com') {
    next();
  } else {
    res.status(403).json({ success: false, error: 'Unauthorized' });
  }
};

// In-memory database (for development purposes)
let db = {
  users: [],
  userProfiles: [],
  products: [],
  orders: [],
  orderItems: [],
  notifications: [],
  categories: [],
  campaigns: [],
  wishlist: [],
  reviews: [], // Added for reviews
  whatsapp: [], // Added for WhatsApp messages
  banners: [], // Added for banners
  productVariants: [], // Added for product variants
  invoices: [], // Added for invoices
  otpCodes: [], // Added for OTP verification
  passwordResetTokens: [] // Added for password reset functionality
};

// Load initial data if available
const dataPath = path.join(__dirname, 'db.json');
if (fs.existsSync(dataPath)) {
  try {
    const data = fs.readFileSync(dataPath, 'utf8');
    db = { ...db, ...JSON.parse(data) }; // Merge loaded data, preserving default empty arrays
    console.log('Database loaded from db.json');
  } catch (error) {
    console.error('Error loading database:', error);
  }
}

// Ensure all top-level arrays exist after loading from db.json
db.users = db.users || [];
db.userProfiles = db.userProfiles || [];
db.products = db.products || [];
db.orders = db.orders || [];
db.orderItems = db.orderItems || [];
db.notifications = db.notifications || [];
db.categories = db.categories || [];
db.campaigns = db.campaigns || [];
db.wishlist = db.wishlist || [];
db.reviews = db.reviews || [];
db.whatsapp = db.whatsapp || [];
db.invoices = db.invoices || [];
db.productVariants = db.productVariants || [];
db.otpCodes = db.otpCodes || []; // Added for OTP verification
db.passwordResetTokens = db.passwordResetTokens || []; // Added for password reset functionality

// Save database to file
const saveDatabase = () => {
  try {
    fs.writeFileSync(dataPath, JSON.stringify(db, null, 2), 'utf8');
    console.log('Database saved to db.json');
  } catch (error) {
    console.error('Error saving database:', error);
  }
};

// Email configuration using Hostinger SMTP
const emailConfig = {
  host: 'smtp.hostinger.com',
  port: 465,
  secure: true, // SSL
  auth: {
    user: 'no-reply@manaeats.com',
    pass: process.env.EMAIL_PASSWORD || 'Bhar#11112323' // Use environment variable first, fallback to provided password
  }
};

// Create nodemailer transporter
const createEmailTransporter = () => {
  return nodemailer.createTransporter(emailConfig);
};

// Email sending endpoint
app.post('/api/send-email', async (req, res) => {
  try {
    const { to, cc, bcc, subject, html, text, attachments, from } = req.body;
    
    console.log('Sending email:', { to, subject, from });
    console.log('Email config:', emailConfig);
    
    // Check if email config is available
    if (!emailConfig.auth.user || !emailConfig.auth.pass) {
      console.error('Email configuration missing');
      return res.status(503).json({ 
        success: false, 
        error: 'Email service not configured. Please set SMTP environment variables.',
        message: 'Email service unavailable' 
      });
    }
    
    const transporter = createEmailTransporter();
    
    // Verify SMTP connection
    try {
      await transporter.verify();
      console.log('SMTP connection verified');
    } catch (verifyError) {
      console.error('SMTP verification failed:', verifyError);
      return res.status(503).json({ 
        success: false, 
        error: 'SMTP connection failed',
        message: 'Email service unavailable' 
      });
    }
    
    const mailOptions = {
      from: from || `MANAfoods <no-reply@manaeats.com>`,
      to: Array.isArray(to) ? to.join(', ') : to,
      cc: cc ? (Array.isArray(cc) ? cc.join(', ') : cc) : undefined,
      bcc: bcc ? (Array.isArray(bcc) ? bcc.join(', ') : bcc) : undefined,
      subject,
      html,
      text,
      attachments: attachments ? attachments.map(att => ({
        filename: att.filename,
        content: att.content,
        contentType: att.contentType
      })) : undefined
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log('Email sent successfully:', info.messageId);
    res.json({ 
      success: true, 
      messageId: info.messageId,
      message: 'Email sent successfully' 
    });
    
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      message: 'Failed to send email' 
    });
  }
});

// Test email endpoint
app.post('/api/test-email', async (req, res) => {
  try {
    const transporter = createEmailTransporter();
    
    const testMailOptions = {
      from: 'MANAfoods <no-reply@manaeats.com>',
      to: 'admin@manaeats.com',
      subject: 'Test Email - MANAfoods System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Email Configuration Test</h2>
          <p>This is a test email to verify that your email configuration is working correctly.</p>
          <p><strong>SMTP Host:</strong> smtp.hostinger.com</p>
          <p><strong>From Email:</strong> no-reply@manaeats.com</p>
          <p><strong>Test Time:</strong> ${new Date().toLocaleString()}</p>
        </div>
      `,
      text: 'Email configuration test - MANAfoods System'
    };

    const info = await transporter.sendMail(testMailOptions);
    
    res.json({ 
      success: true, 
      messageId: info.messageId,
      message: 'Test email sent successfully' 
    });
    
  } catch (error) {
    console.error('Error sending test email:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Initialize with some data if empty
if (db.users.length === 0) {
  // Add admin user
  const adminUser = {
    ID: '1',
    Name: 'Admin User',
    Email: 'admin@example.com',
    Password: 'admin123' // In a real app, this would be hashed
  };
  db.users.push(adminUser);

  // Add test user for login testing
  const testUser = {
    ID: '2',
    Name: 'Test User',
    Email: 'test@example.com',
    Password: 'password123'
  };
  db.users.push(testUser);

  // Add another test user
  const testUser2 = {
    ID: '3',
    Name: 'John Doe',
    Email: 'john@example.com',
    Password: 'password'
  };
  db.users.push(testUser2);

  // Add admin profile
  const adminProfile = {
    user_id: '1',
    phone_number: '1234567890',
    full_name: 'Admin User',
    avatar_url: '',
    email_notifications: true,
    whatsapp_notifications: true,
    marketing_notifications: true,
    auth_method: 'email',
    created_at: new Date().toISOString()
  };
  db.userProfiles.push(adminProfile);

  // Add test user profile
  const testProfile = {
    user_id: '2',
    phone_number: '9876543210',
    full_name: 'Test User',
    avatar_url: '',
    email_notifications: true,
    whatsapp_notifications: false,
    marketing_notifications: true,
    auth_method: 'email',
    created_at: new Date().toISOString()
  };
  db.userProfiles.push(testProfile);

  // Add john doe profile
  const johnProfile = {
    user_id: '3',
    phone_number: '5555555555',
    full_name: 'John Doe',
    avatar_url: '',
    email_notifications: true,
    whatsapp_notifications: true,
    marketing_notifications: false,
    auth_method: 'email',
    created_at: new Date().toISOString()
  };
  db.userProfiles.push(johnProfile);
}

// Initialize products only if they don't exist
if (db.products.length === 0) {
  // Add some sample products
  for (let i = 1; i <= 10; i++) {
    db.products.push({
      id: i.toString(),
      name: `Product ${i}`,
      description: `Description for Product ${i}`,
      price: Math.floor(Math.random() * 100) + 10,
      image: '/placeholder.svg',
      category_id: (Math.floor(Math.random() * 3) + 1).toString(),
      stock: Math.floor(Math.random() * 100) + 1,
      created_at: new Date().toISOString()
    });
  }
}

// Initialize categories only if they don't exist
if (db.categories.length === 0) {
  // Add food categories for MANAfoods
  db.categories.push(
    { id: '1', name: 'All', description: 'All products in our catalog', is_active: true },
    { id: '2', name: 'Veg Pickles', description: 'Vegetarian pickles made with fresh vegetables and spices', is_active: true },
    { id: '3', name: 'Non Veg Pickles', description: 'Non-vegetarian pickles with meat and authentic spices', is_active: true },
    { id: '4', name: 'Spicy Pickles', description: 'Hot and spicy pickles for spice lovers', is_active: true },
    { id: '5', name: 'Sweet Pickles', description: 'Sweet and tangy pickles with a mild flavor', is_active: true },
    { id: '6', name: 'Gongura Pickles', description: 'Traditional gongura and sorrel leaf pickles', is_active: true },
    { id: '7', name: 'Chicken Pickles', description: 'Spicy chicken pickles with boneless pieces', is_active: true },
    { id: '8', name: 'Mutton Pickles', description: 'Rich and tender mutton pickles', is_active: true },
    { id: '9', name: 'Fish Pickles', description: 'Coastal style fish pickles with authentic flavors', is_active: true },
    { id: '10', name: 'Mixed Pickles', description: 'Mixed vegetable and fruit pickles', is_active: true },
    { id: '11', name: 'Seasonal Pickles', description: 'Limited edition seasonal pickles', is_active: false }
  );
}

// Initialize orders only if they don't exist
if (db.orders.length === 0) {
  // Add some sample orders
  for (let i = 1; i <= 5; i++) {
    const orderId = i.toString();
    const order = {
      id: orderId,
      user_id: '1',
      order_total: Math.floor(Math.random() * 500) + 50,
      order_status: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'][Math.floor(Math.random() * 5)],
      shipping_address: JSON.stringify({
        street: '123 Main St',
        city: 'Anytown',
        state: 'CA',
        zip: '12345',
        country: 'USA'
      }),
      payment_method: 'credit_card',
      order_date: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
      tracking_number: `TN${Math.floor(Math.random() * 1000000)}`,
      estimated_delivery: new Date(Date.now() + Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000).toISOString()
    };
    db.orders.push(order);

    // Add order items
    for (let j = 1; j <= Math.floor(Math.random() * 3) + 1; j++) {
      const productId = Math.floor(Math.random() * 10) + 1;
      const product = db.products.find(p => p.id === productId.toString());
      if (product) {
        db.orderItems.push({
          id: `${orderId}_${j}`,
          order_id: orderId,
          product_id: product.id,
          product_name: product.name,
          product_price: product.price,
          quantity: Math.floor(Math.random() * 3) + 1,
          product_image: product.image
        });
      }
    }
  }

  // Add some sample notifications
  const notificationTypes = ['system', 'order', 'campaign', 'promotion'];
  const notificationChannels = ['in_app', 'email', 'whatsapp'];
  const notificationStatuses = ['sent', 'read', 'failed'];

  for (let i = 1; i <= 10; i++) {
    db.notifications.push({
      id: i.toString(),
      user_id: '1',
      title: `Notification ${i}`,
      message: `This is notification ${i} message content.`,
      type: notificationTypes[Math.floor(Math.random() * notificationTypes.length)],
      channel: notificationChannels[Math.floor(Math.random() * notificationChannels.length)],
      status: notificationStatuses[Math.floor(Math.random() * notificationStatuses.length)],
      is_read: Math.random() > 0.5,
      metadata: JSON.stringify({ key: 'value' }),
      sent_at: new Date(Date.now() - Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString()
    });
  }

  // Add some sample reviews
  for (let i = 1; i <= 10; i++) {
    db.reviews.push({
      id: i.toString(),
      user_id: '1',
      product_id: (Math.floor(Math.random() * 10) + 1).toString(),
      rating: Math.floor(Math.random() * 5) + 1,
      review_text: `This is a sample review for product ${i}.`,
      review_date: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
      verified_purchase: Math.random() > 0.5
    });
  }

  // Add some sample WhatsApp messages (for campaigns)
  for (let i = 1; i <= 5; i++) {
    db.whatsapp.push({
      id: i.toString(),
      phone_number: `+1${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      message_type: 'text',
      message_content: `This is a sample WhatsApp message ${i}.`,
      status: ['sent', 'delivered', 'read', 'failed'][Math.floor(Math.random() * 4)],
      user_id: '1',
      campaign_id: (Math.floor(Math.random() * 3) + 1).toString(),
      sent_at: new Date(Date.now() - Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString()
    });
  }

  // Add some sample invoices for testing
  const invoiceStatuses = ['draft', 'sent', 'paid', 'overdue', 'cancelled'];
  const pickleProducts = [
    { name: 'Spicy Mango Pickle', price: 12.99, description: 'Premium spicy mango pickle with authentic spices' },
    { name: 'Gongura Pickle', price: 15.99, description: 'Traditional gongura pickle with fresh sorrel leaves' },
    { name: 'Chicken Pickle', price: 18.99, description: 'Boneless chicken pickle with aromatic spices' },
    { name: 'Mixed Vegetable Pickle', price: 11.99, description: 'Assorted vegetables pickled to perfection' },
    { name: 'Mutton Pickle', price: 24.99, description: 'Tender mutton pickle with rich flavors' },
    { name: 'Lemon Pickle', price: 9.99, description: 'Classic lemon pickle with traditional recipe' },
    { name: 'Garlic Pickle', price: 13.99, description: 'Aromatic garlic pickle with bold flavors' },
    { name: 'Fish Pickle', price: 19.99, description: 'Coastal style fish pickle with authentic spices' }
  ];

  for (let i = 1; i <= 15; i++) {
    const invoiceDate = new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000);
    const dueDate = new Date(invoiceDate.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    // Generate random items for each invoice
    const numItems = Math.floor(Math.random() * 4) + 1; // 1-4 items per invoice
    const invoiceItems = [];
    let subtotal = 0;
    
    for (let j = 0; j < numItems; j++) {
      const product = pickleProducts[Math.floor(Math.random() * pickleProducts.length)];
      const quantity = Math.floor(Math.random() * 3) + 1;
      const unitPrice = product.price;
      const totalPrice = unitPrice * quantity;
      
      invoiceItems.push({
        id: `INV${i.toString().padStart(3, '0')}_${j + 1}`,
        product_id: `PROD${j + 1}`,
        product_name: product.name,
        description: product.description,
        quantity: quantity,
        unit_price: unitPrice,
        total_price: totalPrice
      });
      
      subtotal += totalPrice;
    }
    
    const taxRate = 0.08; // 8% tax
    const taxAmount = subtotal * taxRate;
    const totalAmount = subtotal + taxAmount;
    
    const customerNames = [
      'John Smith', 'Sarah Johnson', 'Mike Chen', 'Emily Davis', 'David Wilson',
      'Lisa Brown', 'James Miller', 'Jessica Garcia', 'Robert Taylor', 'Amanda Lee',
      'Christopher Martinez', 'Rachel White', 'Daniel Anderson', 'Jennifer Thompson', 'Matthew Clark'
    ];
    
    const customerName = customerNames[i - 1] || `Customer ${i}`;
    const customerEmail = `${customerName.toLowerCase().replace(' ', '.')}@example.com`;
    
    const invoice = {
      id: `INV_${Date.now() + i}`,
      invoice_number: `INV-${new Date(invoiceDate).getFullYear()}${(new Date(invoiceDate).getMonth() + 1).toString().padStart(2, '0')}${new Date(invoiceDate).getDate().toString().padStart(2, '0')}-${i.toString().padStart(3, '0')}`,
      order_id: db.orders[Math.floor(Math.random() * db.orders.length)]?.id || `MANA000${i.toString().padStart(5, '0')}`,
      user_id: '1',
      invoice_date: invoiceDate.toISOString(),
      due_date: dueDate.toISOString(),
      total_amount: parseFloat(totalAmount.toFixed(2)),
      tax_amount: parseFloat(taxAmount.toFixed(2)),
      subtotal: parseFloat(subtotal.toFixed(2)),
      status: invoiceStatuses[Math.floor(Math.random() * invoiceStatuses.length)],
      customer_info: JSON.stringify({
        name: customerName,
        email: customerEmail,
        phone: `+1${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        address: {
          street: `${Math.floor(Math.random() * 9999) + 1} Main St`,
          city: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'][Math.floor(Math.random() * 5)],
          state: ['NY', 'CA', 'IL', 'TX', 'AZ'][Math.floor(Math.random() * 5)],
          zip: `${Math.floor(Math.random() * 90000) + 10000}`
        }
      }),
      items: JSON.stringify(invoiceItems),
      created_at: invoiceDate.toISOString(),
      updated_at: invoiceDate.toISOString()
    };
    
    db.invoices.push(invoice);
  }

  // Save initial database
  saveDatabase();
}

// API Endpoints

// User Authentication
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email and password are required' 
      });
    }
    
    // Validate email is a string
    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ 
        success: false, 
        error: 'Email and password must be strings' 
      });
    }
    
    const user = db.users.find(u => 
      u.Email && u.Email.toLowerCase() === email.toLowerCase() && 
      u.Password === password
    );
    
    if (user) {
      // Don't send password to client
      const { Password, ...userWithoutPassword } = user;
      const isAdmin = user.Email === 'admin@example.com';
      res.json({ success: true, data: { ...userWithoutPassword, isAdmin } });
    } else {
      res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error during login' 
    });
  }
});

app.post('/api/auth/register', (req, res) => {
  const { email, password, name } = req.body;
  
  // Check if user already exists
  if (db.users.some(u => u.Email.toLowerCase() === email.toLowerCase())) {
    return res.status(400).json({ success: false, error: 'User already exists' });
  }
  
  const newUser = {
    ID: uuidv4(),
    Name: name,
    Email: email,
    Password: password // In a real app, this would be hashed
  };
  
  db.users.push(newUser);
  
  // Create user profile
  const newProfile = {
    user_id: newUser.ID,
    phone_number: '',
    full_name: name,
    avatar_url: '',
    email_notifications: true,
    whatsapp_notifications: false,
    marketing_notifications: true,
    auth_method: 'email',
    created_at: new Date().toISOString()
  };
  
  db.userProfiles.push(newProfile);
  saveDatabase();
  
  // Don't send password to client
  const { Password, ...userWithoutPassword } = newUser;
  res.json({ success: true, data: userWithoutPassword });
});

app.get('/api/auth/user', (req, res) => {
  // In a real app, this would use JWT or session
  // For demo, we'll return the admin user
  const adminUser = db.users.find(u => u.ID === '1');
  if (adminUser) {
    const { Password, ...userWithoutPassword } = adminUser;
    const isAdmin = adminUser.Email === 'admin@example.com';
    res.json({ success: true, data: { ...userWithoutPassword, isAdmin } });
  } else {
    res.status(401).json({ success: false, error: 'Not authenticated' });
  }
});

// Forgot Password endpoint
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    // Validate email
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ 
        success: false, 
        error: 'Valid email is required' 
      });
    }
    
    // Check if user exists
    const user = db.users.find(u => u.Email && u.Email.toLowerCase() === email.toLowerCase());
    if (!user) {
      // For security, always return success even if user doesn't exist
      return res.json({ 
        success: true, 
        message: 'If an account with that email exists, we have sent a password reset link.' 
      });
    }
    
    // Generate reset token
    const resetToken = uuidv4();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
    
    // Store reset token
    const resetTokenData = {
      id: uuidv4(),
      email: user.Email,
      user_id: user.ID,
      token: resetToken,
      expires_at: expiresAt.toISOString(),
      used: false,
      created_at: new Date().toISOString()
    };
    
    // Remove any existing tokens for this user
    db.passwordResetTokens = db.passwordResetTokens.filter(token => token.user_id !== user.ID);
    
    // Add new token
    db.passwordResetTokens.push(resetTokenData);
    saveDatabase();
    
    // Send reset email
    if (emailTransporter) {
      try {
        const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:8080'}/reset-password?token=${resetToken}`;
        
        const mailOptions = {
          from: {
            name: process.env.FROM_NAME || 'MANAfoods',
            address: process.env.FROM_EMAIL || process.env.SMTP_USER || 'noreply@manafoods.com'
          },
          to: user.Email,
          subject: 'Password Reset Request - MANAfoods',
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #2563eb; margin-bottom: 10px;">Password Reset Request</h1>
                <p style="color: #6b7280; margin: 0;">MANAfoods</p>
              </div>
              
              <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h2 style="color: #1f2937; margin-top: 0;">Hello ${user.Name},</h2>
                <p style="color: #4b5563; line-height: 1.6;">
                  We received a request to reset your password for your MANAfoods account. 
                  If you made this request, please click the button below to reset your password.
                </p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetLink}" 
                   style="background-color: #2563eb; color: white; padding: 12px 24px; 
                          text-decoration: none; border-radius: 6px; font-weight: 600; 
                          display: inline-block;">
                  Reset Password
                </a>
              </div>
              
              <div style="background-color: #fef3c7; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
                <p style="color: #92400e; margin: 0; font-size: 14px;">
                  <strong>⚠️ Important:</strong> This link will expire in 1 hour for security reasons.
                </p>
              </div>
              
              <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
                <p style="color: #6b7280; font-size: 14px; margin: 0;">
                  If you didn't request this password reset, please ignore this email. 
                  Your password will remain unchanged.
                </p>
                <p style="color: #6b7280; font-size: 14px; margin: 10px 0 0 0;">
                  If the button above doesn't work, copy and paste this link into your browser:
                </p>
                <p style="color: #2563eb; font-size: 14px; word-break: break-all; margin: 5px 0 0 0;">
                  ${resetLink}
                </p>
              </div>
            </div>
          `,
          text: `
Password Reset Request - MANAfoods

Hello ${user.Name},

We received a request to reset your password for your MANAfoods account. If you made this request, please click the link below to reset your password.

Reset Password Link: ${resetLink}

⚠️ Important: This link will expire in 1 hour for security reasons.

If you didn't request this password reset, please ignore this email. Your password will remain unchanged.

If the link above doesn't work, copy and paste it into your browser address bar.

Thanks,
MANAfoods Team
          `
        };
        
        await emailTransporter.sendMail(mailOptions);
        console.log(`Password reset email sent to ${user.Email}`);
        
      } catch (emailError) {
        console.error('Error sending password reset email:', emailError);
        // Continue without failing the request
      }
    } else {
      console.log(`Password reset requested for ${user.Email}. Token: ${resetToken} (Email not configured)`);
    }
    
    res.json({ 
      success: true, 
      message: 'If an account with that email exists, we have sent a password reset link.' 
    });
    
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

// Reset Password endpoint
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    // Validate input
    if (!token || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        error: 'Token and new password are required' 
      });
    }
    
    if (typeof token !== 'string' || typeof newPassword !== 'string') {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid token or password format' 
      });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false, 
        error: 'Password must be at least 6 characters long' 
      });
    }
    
    // Find reset token
    const resetTokenData = db.passwordResetTokens.find(t => t.token === token && !t.used);
    if (!resetTokenData) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid or expired reset token' 
      });
    }
    
    // Check if token has expired
    if (new Date(resetTokenData.expires_at) < new Date()) {
      return res.status(400).json({ 
        success: false, 
        error: 'Reset token has expired' 
      });
    }
    
    // Find user
    const user = db.users.find(u => u.ID === resetTokenData.user_id);
    if (!user) {
      return res.status(400).json({ 
        success: false, 
        error: 'User not found' 
      });
    }
    
    // Update password
    user.Password = newPassword; // In production, this should be hashed
    
    // Mark token as used
    resetTokenData.used = true;
    resetTokenData.used_at = new Date().toISOString();
    
    saveDatabase();
    
    // Send confirmation email
    if (emailTransporter) {
      try {
        const mailOptions = {
          from: {
            name: process.env.FROM_NAME || 'MANAfoods',
            address: process.env.FROM_EMAIL || process.env.SMTP_USER || 'noreply@manafoods.com'
          },
          to: user.Email,
          subject: 'Password Reset Successful - MANAfoods',
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #059669; margin-bottom: 10px;">Password Reset Successful</h1>
                <p style="color: #6b7280; margin: 0;">MANAfoods</p>
              </div>
              
              <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h2 style="color: #1f2937; margin-top: 0;">Hello ${user.Name},</h2>
                <p style="color: #4b5563; line-height: 1.6;">
                  Your password has been successfully reset. You can now log in to your MANAfoods account with your new password.
                </p>
              </div>
              
              <div style="background-color: #dcfce7; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
                <p style="color: #166534; margin: 0; font-size: 14px;">
                  <strong>✅ Success:</strong> Password reset completed at ${new Date().toLocaleString()}
                </p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:8080'}/auth" 
                   style="background-color: #059669; color: white; padding: 12px 24px; 
                          text-decoration: none; border-radius: 6px; font-weight: 600; 
                          display: inline-block;">
                  Login Now
                </a>
              </div>
              
              <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
                <p style="color: #6b7280; font-size: 14px; margin: 0;">
                  If you didn't reset your password, please contact our support team immediately.
                </p>
              </div>
            </div>
          `,
          text: `
Password Reset Successful - MANAfoods

Hello ${user.Name},

Your password has been successfully reset. You can now log in to your MANAfoods account with your new password.

✅ Success: Password reset completed at ${new Date().toLocaleString()}

If you didn't reset your password, please contact our support team immediately.

Thanks,
MANAfoods Team
          `
        };
        
        await emailTransporter.sendMail(mailOptions);
        console.log(`Password reset confirmation sent to ${user.Email}`);
        
      } catch (emailError) {
        console.error('Error sending password reset confirmation:', emailError);
        // Continue without failing the request
      }
    }
    
    res.json({ 
      success: true, 
      message: 'Password has been reset successfully' 
    });
    
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

// Generic Table API
app.post('/api/table/:tableId', (req, res) => {
  console.log(`[SERVER] Received POST request for /api/table/${req.params.tableId}`);
  try {
    const { tableId } = req.params;
    const { PageNo, PageSize, OrderByField, IsAsc, Filters } = req.body;
    
    let tableData;
    switch (tableId) {
      case '10411':
      case 'userProfiles':
        tableData = db.userProfiles;
        break;
      case '10412':
      case 'notifications':
        tableData = db.notifications;
        break;
      case '10403':
      case 'products':
        tableData = db.products;
        break;
      case '10399':
      case 'wishlist':
        tableData = db.wishlist;
        break;
      case '10401':
      case 'orders':
        tableData = db.orders;
        break;
      case '10413':
      case 'campaigns':
        tableData = db.campaigns;
        break;
      case '10400':
      case 'reviews':
        tableData = db.reviews;
        break;
      case '10414':
      case 'whatsapp':
        tableData = db.whatsapp;
        break;
      case '10410':
      case 'otpCodes':
        tableData = db.otpCodes;
        break;
      case '10416': // Password Reset Tokens
        tableData = db.passwordResetTokens;
        break;
      case 'order_items':
        tableData = db.orderItems;
        break;
      case '12221':
      case 'productVariants':
        tableData = db.productVariants;
        break;
      case '10415':
      case 'invoices':
        tableData = db.invoices;
        break;
      default:
        console.warn(`[SERVER] Table ID ${tableId} not found.`);
        return res.status(404).json({ success: false, error: 'Table not found' });
    }
  
  // Apply filters if provided
  let filteredData = [...tableData];
  if (Filters && Filters.length > 0) {
    filteredData = filteredData.filter(item => {
      return Filters.every(filter => {
        const { name, op, value } = filter;
        
        if (!item[name]) return false;
        
        switch (op) {
          case 'Equal':
            return item[name] == value;
          case 'NotEqual':
            return item[name] != value;
          case 'Like':
            if (typeof value === 'string' && typeof item[name] === 'string') {
              if (value.startsWith('%') && value.endsWith('%')) {
                return item[name].includes(value.slice(1, -1));
              } else if (value.startsWith('%')) {
                return item[name].endsWith(value.slice(1));
              } else if (value.endsWith('%')) {
                return item[name].startsWith(value.slice(0, -1));
              }
            }
            return item[name] === value;
          case 'NotLike':
            if (typeof value === 'string' && typeof item[name] === 'string') {
              if (value.startsWith('%') && value.endsWith('%')) {
                return !item[name].includes(value.slice(1, -1));
              } else if (value.startsWith('%')) {
                return !item[name].endsWith(value.slice(1));
              } else if (value.endsWith('%')) {
                return !item[name].startsWith(value.slice(0, -1));
              }
            }
            return item[name] !== value;
          case 'StringContains': // Added StringContains operator
            if (typeof value === 'string' && typeof item[name] === 'string') {
              return item[name].toLowerCase().includes(value.toLowerCase());
            }
            return false;
          case 'GreaterThanOrEqual': // Added GreaterThanOrEqual operator
            return item[name] >= value;
          case 'LessThanOrEqual': // Added LessThanOrEqual operator
            return item[name] <= value;
          default:
            console.warn(`[SERVER] Unknown filter operator: ${op}`);
            return true;
        }
      });
    });
  }
  
  // Apply sorting if provided
  if (OrderByField) {
    filteredData.sort((a, b) => {
      if (a[OrderByField] < b[OrderByField]) return IsAsc ? -1 : 1;
      if (a[OrderByField] > b[OrderByField]) return IsAsc ? 1 : -1;
      return 0;
    });
  }
  
  // Apply pagination
  const page = PageNo || 1;
  const pageSize = PageSize || 10;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = filteredData.slice(startIndex, endIndex);
  
  res.setHeader('Content-Type', 'application/json'); // Explicitly set Content-Type
  console.log(`[SERVER] Sending JSON response for /api/table/${tableId}`);
  return res.json({
    success: true,
    data: {
      List: paginatedData,
      VirtualCount: filteredData.length,
      PageNo: page,
      PageSize: pageSize
    }
  });
  } catch (error) {
    console.error(`[SERVER] Error fetching table data for ${req.params.tableId}:`, error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to fetch table data' });
  }
});

// Create record in table
app.post('/api/table/create/:tableId', (req, res) => {
  try {
    const { tableId } = req.params;
    const data = req.body;
    
    // Add validation and logging for product creation
    if (tableId === '10403') {
      console.log('Attempting to create product with data:', data);
      if (!data.name || !data.price || !data.category || data.stock_quantity === undefined) {
        return res.status(400).json({ success: false, error: 'Missing required fields: name, price, category, stock_quantity' });
      }
    }
    
    let targetArray;
    switch (tableId) {
      case '10411': // Users
        targetArray = db.userProfiles;
        break;
      case '10412': // Notifications
        targetArray = db.notifications;
        break;
      case '10403': // Products
        targetArray = db.products;
        break;
      case '10399': // Wishlist
        targetArray = db.wishlist;
        break;
      case '10401': // Orders
        targetArray = db.orders;
        break;
      case '10413': // Campaigns
        targetArray = db.campaigns;
        break;
      case '10400': // Reviews
        targetArray = db.reviews;
        break;
      case '10414': // WhatsApp
        targetArray = db.whatsapp;
        break;
      case '10410': // OTP Codes
        targetArray = db.otpCodes;
        break;
      case '10416': // Password Reset Tokens
        targetArray = db.passwordResetTokens;
        break;
      case 'order_items': // Order Items
        targetArray = db.orderItems;
        break;
      case '12221': // Product Variants
        targetArray = db.productVariants;
        break;
      case '10415': // Invoices
      case 'invoices':
        targetArray = db.invoices;
        break;
      default:
        return res.status(404).json({ success: false, error: 'Table not found' });
    }
    
    // Add ID if not provided
    const newRecord = { ...data };
    if (!newRecord.id) {
      if (tableId === '10401') {
        // Orders: generate sequential MANA000XXXXX ID
        const lastOrder = db.orders
          .map(o => parseInt((o.id || '').replace('MANA000', ''), 10))
          .filter(n => !isNaN(n))
          .sort((a, b) => b - a)[0] || 0;
        const newOrderNumber = lastOrder + 1;
        newRecord.id = `MANA000${newOrderNumber.toString().padStart(5, '0')}`;
      } else if (tableId === '10403') {
        // Products: generate sequential MANAPROD00001 ID
        const lastProd = db.products
          .map(p => parseInt((p.id || '').replace('MANAPROD', ''), 10))
          .filter(n => !isNaN(n))
          .sort((a, b) => b - a)[0] || 0;
        const newProdNumber = lastProd + 1;
        newRecord.id = `MANAPROD${newProdNumber.toString().padStart(5, '0')}`;
      } else if (tableId === '10411') {
        // Users: generate sequential MANAUSER00001 ID
        const lastUser = db.userProfiles
          .map(u => parseInt((u.user_id || u.id || '').replace('MANAUSER', ''), 10))
          .filter(n => !isNaN(n))
          .sort((a, b) => b - a)[0] || 0;
        const newUserNumber = lastUser + 1;
        newRecord.user_id = `MANAUSER${newUserNumber.toString().padStart(5, '0')}`;
        newRecord.id = newRecord.user_id;
      } else if (tableId === '10413') {
        // Campaigns: generate sequential MANACAMP00001 ID
        const lastCamp = db.campaigns
          .map(c => parseInt((c.id || '').replace('MANACAMP', ''), 10))
          .filter(n => !isNaN(n))
          .sort((a, b) => b - a)[0] || 0;
        const newCampNumber = lastCamp + 1;
        newRecord.id = `MANACAMP${newCampNumber.toString().padStart(5, '0')}`;
      } else {
        newRecord.id = uuidv4();
      }
    }
    
    targetArray.push(newRecord);
    saveDatabase();
    
    return res.json({ success: true, data: newRecord });
  } catch (error) {
    console.error('Error creating record:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to create record' });
  }
});

// Update record in table
app.post('/api/table/update/:tableId', (req, res) => {
  try {
    const { tableId } = req.params;
    const { id, ...updateData } = req.body;
    
    let targetArray;
    switch (tableId) {
      case '10411':
      case 'userProfiles':
        targetArray = db.userProfiles;
        break;
      case '10412':
      case 'notifications':
        targetArray = db.notifications;
        break;
      case '10403':
      case 'products':
        targetArray = db.products;
        break;
      case '10399':
      case 'wishlist':
        targetArray = db.wishlist;
        break;
      case '10401':
      case 'orders':
        targetArray = db.orders;
        break;
      case '10413':
      case 'campaigns':
        targetArray = db.campaigns;
        break;
      case '10400':
      case 'reviews':
        targetArray = db.reviews;
        break;
      case '10414':
      case 'whatsapp':
        targetArray = db.whatsapp;
        break;
      case '10410':
      case 'otpCodes':
        targetArray = db.otpCodes;
        break;
      case '10416': // Password Reset Tokens
        targetArray = db.passwordResetTokens;
        break;
      case 'order_items':
        targetArray = db.orderItems;
        break;
      case '12221':
      case 'productVariants':
        targetArray = db.productVariants;
        break;
      case '10415':
      case 'invoices':
        targetArray = db.invoices;
        break;
      default:
        return res.status(404).json({ success: false, error: 'Table not found' });
    }
  
    const index = targetArray.findIndex(item => item.id == id || item.ID == id || item.user_id == id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Record not found' });
    }
  
    targetArray[index] = { ...targetArray[index], ...updateData };
    saveDatabase();
  
    return res.json({ success: true, data: targetArray[index] });
  } catch (error) {
    console.error('Error updating record:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to update record' });
  }
});

// Delete record from table
app.post('/api/table/delete/:tableId', (req, res) => {
  try {
    const { tableId } = req.params;
    const { id } = req.body;
    
    let targetArray;
    switch (tableId) {
      case '10411': // Users
        targetArray = db.userProfiles;
        break;
      case '10412': // Notifications
        targetArray = db.notifications;
        break;
      case '10403': // Products
        targetArray = db.products;
        break;
      case '10399': // Wishlist
        targetArray = db.wishlist;
        break;
      case '10401': // Orders
        targetArray = db.orders;
        break;
      case '10413': // Campaigns
        targetArray = db.campaigns;
        break;
      case '10400': // Reviews
        targetArray = db.reviews;
        break;
      case '10414': // WhatsApp
        targetArray = db.whatsapp;
        break;
      case '10410': // OTP Codes
        targetArray = db.otpCodes;
        break;
      case '10416': // Password Reset Tokens
        targetArray = db.passwordResetTokens;
        break;
      case 'order_items': // Order Items
        targetArray = db.orderItems;
        break;
      case '12221': // Product Variants
        targetArray = db.productVariants;
        break;
      case '10415': // Invoices
      case 'invoices':
        targetArray = db.invoices;
        break;
      default:
        return res.status(404).json({ success: false, error: 'Table not found' });
    }
    
    const index = targetArray.findIndex(item => item.id == id || item.ID == id || item.user_id == id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Record not found' });
    }
    
    targetArray.splice(index, 1);
    saveDatabase();
    
    return res.json({ success: true });
  } catch (error) {
    console.error('Error deleting record:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to delete record' });
  }
});

// Get user info (for auth)
app.get('/api/getUserInfo', (req, res) => {
  // In a real app, this would use JWT or session
  // For demo, we'll return the admin user
  const adminUser = db.users.find(u => u.ID === '1');
  if (adminUser) {
    const { Password, ...userWithoutPassword } = adminUser;
    const isAdmin = adminUser.Email === 'admin@example.com';
    res.json({ success: true, data: { ...userWithoutPassword, isAdmin } });
  } else {
    res.status(401).json({ success: false, error: 'Not authenticated' });
  }
});

// Razer Pay API Endpoints
app.post('/api/razerpay/create-order', (req, res) => {
  const { amount, currency, receipt, notes } = req.body;
  
  // In a real implementation, this would make an API call to Razer Pay
  // For this demo, we'll simulate the response
  const razerpayOrderId = `rzp_${Date.now()}`;
  
  // Log the order creation
  console.log(`Created Razer Pay order: ${razerpayOrderId} for amount ${amount} ${currency}`);
  
  // Return a simulated successful response
  res.json({
    success: true,
    data: {
      id: razerpayOrderId,
      entity: 'order',
      amount: amount,
      amount_paid: 0,
      amount_due: amount,
      currency: currency,
      receipt: receipt,
      status: 'created',
      notes: notes,
      created_at: Math.floor(Date.now() / 1000)
    }
  });
});

app.post('/api/razerpay/verify-payment', (req, res) => {
  const { razerpay_payment_id, razerpay_order_id, razerpay_signature, internal_order_id } = req.body;
  
  // In a real implementation, this would verify the signature with Razer Pay
  // For this demo, we'll simulate a successful verification
  const isValid = true; // Assume the signature is valid
  
  if (isValid) {
    // Log the payment verification
    console.log(`Verified Razer Pay payment: ${razerpay_payment_id} for order ${razerpay_order_id}`);
    
    // Return a successful response
    res.json({
      success: true,
      data: {
        payment_id: razerpay_payment_id,
        order_id: razerpay_order_id,
        signature: razerpay_signature,
        status: 'verified'
      }
    });
  } else {
    // Return a failed verification response
    res.status(400).json({
      success: false,
      error: 'Invalid signature'
    });
  }
});

// Product Management Specific Endpoints

// Get all products with filtering and pagination
app.get('/api/products', (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      search,
      minPrice,
      maxPrice,
      sortBy = 'id',
      sortOrder = 'desc'
    } = req.query;

    // Start with all products
    let filteredProducts = [...db.products];
    
    // Apply filters
    if (category) {
      filteredProducts = filteredProducts.filter(p => p.category_id === category);
    }
    
    if (search) {
      const searchTerm = search.toLowerCase();
      filteredProducts = filteredProducts.filter(p => 
        p.name.toLowerCase().includes(searchTerm) || 
        p.description.toLowerCase().includes(searchTerm)
      );
    }
    
    if (minPrice) {
      filteredProducts = filteredProducts.filter(p => p.price >= Number(minPrice));
    }
    
    if (maxPrice) {
      filteredProducts = filteredProducts.filter(p => p.price <= Number(maxPrice));
    }

    // Apply sorting
    filteredProducts.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      // Handle numeric sorting
      if (sortBy === 'price' || sortBy === 'stock') {
        aValue = Number(aValue) || 0;
        bValue = Number(bValue) || 0;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    // Calculate pagination
    const total = filteredProducts.length;
    const skip = (Number(page) - 1) * Number(limit);
    const paginatedProducts = filteredProducts.slice(skip, skip + Number(limit));

    // Map fields back to frontend format for backward compatibility
    const mappedProducts = paginatedProducts.map(product => ({
      ...product,
      // Map backend fields to frontend expected fields
      image_url: product.image,
      category: product.category_id,
      stock_quantity: product.stock,
      // Keep original fields for backward compatibility
      image: product.image,
      category_id: product.category_id,
      stock: product.stock
    }));

    res.json({ 
      success: true, 
      data: mappedProducts,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit))
    });
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get product by ID
app.get('/api/products/:id', isAdmin, (req, res) => {
  const { id } = req.params;
  const product = db.products.find(p => p.id === id);
  
  if (product) {
    // Map fields back to frontend format for backward compatibility
    const mappedProduct = {
      ...product,
      // Map backend fields to frontend expected fields
      image_url: product.image,
      category: product.category_id,
      stock_quantity: product.stock,
      // Keep original fields for backward compatibility
      image: product.image,
      category_id: product.category_id,
      stock: product.stock
    };
    
    res.json({ success: true, data: mappedProduct });
  } else {
    res.status(404).json({ success: false, error: 'Product not found' });
  }
});

// Create new product
app.post('/api/products', (req, res) => {
  const productData = req.body;
  
  // Validate required fields
  if (!productData.name || !productData.price) {
    return res.status(400).json({ success: false, error: 'Name and price are required' });
  }
  
  // Handle field name mapping for backward compatibility
  const newProduct = {
    id: uuidv4(),
    name: productData.name,
    description: productData.description || '',
    price: Number(productData.price),
    // Map image_url to image field
    image: productData.image_url || productData.image || '/placeholder.svg',
    // Map category to category_id field
    category_id: productData.category || productData.category_id || '1',
    // Map stock_quantity to stock field
    stock: Number(productData.stock_quantity || productData.stock || 0),
    // Include other fields
    features: productData.features || [],
    is_active: productData.is_active !== false,
    brand: productData.brand || '',
    tags: productData.tags || [],
    expiry_date: productData.expiry_date || '',
    barcode: productData.barcode || '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  db.products.push(newProduct);
  saveDatabase();
  
  res.json({ success: true, data: newProduct });
});

// Update product
app.put('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  
  const index = db.products.findIndex(p => p.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Product not found' });
  }
  
  // Handle field name mapping for backward compatibility
  const mappedUpdateData = {
    name: updateData.name,
    description: updateData.description,
    price: updateData.price ? Number(updateData.price) : undefined,
    // Map image_url to image field
    image: updateData.image_url || updateData.image,
    // Map category to category_id field
    category_id: updateData.category || updateData.category_id,
    // Map stock_quantity to stock field
    stock: updateData.stock_quantity !== undefined ? Number(updateData.stock_quantity) : (updateData.stock !== undefined ? Number(updateData.stock) : undefined),
    // Include other fields
    features: updateData.features,
    is_active: updateData.is_active,
    brand: updateData.brand,
    tags: updateData.tags,
    expiry_date: updateData.expiry_date,
    barcode: updateData.barcode,
    updated_at: new Date().toISOString()
  };
  
  // Remove undefined values
  Object.keys(mappedUpdateData).forEach(key => {
    if (mappedUpdateData[key] === undefined) {
      delete mappedUpdateData[key];
    }
  });
  
  // Update the product
  db.products[index] = {
    ...db.products[index],
    ...mappedUpdateData
  };
  
  saveDatabase();
  
  res.json({ success: true, data: db.products[index] });
});

// Delete product
app.delete('/api/products/:id', (req, res) => {
  const { id } = req.params;
  
  const index = db.products.findIndex(p => p.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Product not found' });
  }
  
  // Remove the product
  db.products.splice(index, 1);
  saveDatabase();
  
  res.json({ success: true, message: 'Product deleted successfully' });
});

// Upload product image
app.post('/api/products/upload-image', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No image file provided' });
    }
    
    // Create relative URL path for the uploaded file
    const imageUrl = `/uploads/${req.file.filename}`;
    
    res.json({
      success: true,
      data: {
        imageUrl: imageUrl,
        filename: req.file.filename,
        originalname: req.file.originalname,
        size: req.file.size
      }
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ success: false, error: 'Failed to upload image' });
  }
});

// Get all categories
app.get('/api/categories', (req, res) => {
  try {
    res.json({ success: true, data: db.categories });
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Create new category
app.post('/api/categories', (req, res) => {
  const { name, description } = req.body;
  
  if (!name) {
    return res.status(400).json({ success: false, error: 'Category name is required' });
  }
  
  const newCategory = {
    id: uuidv4(),
    name,
    description: description || '',
    created_at: new Date().toISOString()
  };
  
  db.categories.push(newCategory);
  saveDatabase();
  
  res.json({ success: true, data: newCategory });
});

// Update category
app.put('/api/categories/:id', (req, res) => {
  const { id } = req.params;
  const { name, description, is_active } = req.body;
  
  // Handle both string and number IDs
  const index = db.categories.findIndex(c => c.id === id || c.id === id.toString());
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Category not found' });
  }
  
  // Update the category
  db.categories[index] = {
    ...db.categories[index],
    name: name || db.categories[index].name,
    description: description !== undefined ? description : db.categories[index].description,
    is_active: is_active !== undefined ? is_active : db.categories[index].is_active,
    updated_at: new Date().toISOString()
  };
  
  saveDatabase();
  
  res.json({ success: true, data: db.categories[index] });
});

// Delete category
app.delete('/api/categories/:id', (req, res) => {
  const { id } = req.params;
  
  // Handle both string and number IDs
  const index = db.categories.findIndex(c => c.id === id || c.id === id.toString());
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Category not found' });
  }
  
  // Remove the category
  db.categories.splice(index, 1);
  saveDatabase();
  
  res.json({ success: true, message: 'Category deleted successfully' });
});

// Banner API Endpoints
app.get('/api/banners', (req, res) => {
  res.json({ success: true, data: db.banners || [] });
});

app.post('/api/banners', (req, res) => {
  // Optionally, add admin check here
  const banners = req.body;
  if (!Array.isArray(banners)) {
    return res.status(400).json({ success: false, error: 'Banners must be an array' });
  }
  db.banners = banners;
  saveDatabase();
  res.json({ success: true, data: db.banners });
});

// Catch-all route to serve the frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

// 404 handler - must be last
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/ezsite');

const mongoConnection = mongoose.connection;
mongoConnection.on('error', console.error.bind(console, 'connection error:'));
mongoConnection.once('open', function() {
  console.log('Connected to MongoDB!');
});

const categorySchema = new mongoose.Schema({
  name: String,
  description: String,
  created_at: String
});
const Category = mongoose.model('Category', categorySchema);
