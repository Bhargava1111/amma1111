import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';
import mongoose from 'mongoose';
import webpush from 'web-push';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { RazorpayService } from '../server/services/RazorpayService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Configure CORS for Vercel
app.use(cors({
  origin: ['https://*.vercel.app', 'http://localhost:3000', 'http://localhost:8080'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Configure express to handle JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
  reviews: [],
  whatsapp: [],
  banners: [],
  productVariants: [],
  invoices: [],
  otpCodes: [],
  passwordResetTokens: []
};

// Load initial data if available
try {
  const dbPath = path.join(__dirname, '../server/db.json');
  if (fs.existsSync(dbPath)) {
    const data = fs.readFileSync(dbPath, 'utf8');
    db = JSON.parse(data);
    console.log('Database loaded successfully');
  }
} catch (error) {
  console.error('Error loading database:', error);
}

// Add sample data if database is empty
if (db.banners.length === 0) {
  db.banners = [
    {
      id: '1',
      title: 'Welcome to MANAfoods',
      subtitle: 'Traditional Indian Pickles',
      image_url: 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=800&h=400&fit=crop',
      link: '/products',
      active: true,
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      title: 'Special Offers',
      subtitle: 'Up to 30% off on selected items',
      image_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&h=400&fit=crop',
      link: '/offers',
      active: true,
      created_at: new Date().toISOString()
    }
  ];
}

if (db.products.length === 0) {
  db.products = [
    {
      id: '1',
      name: 'Mango Pickle',
      description: 'Traditional spicy mango pickle',
      price: 150,
      image: 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=400&h=400&fit=crop',
      category: 'Pickles',
      stock: 50,
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Lemon Pickle',
      description: 'Tangy lemon pickle with spices',
      price: 120,
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=400&fit=crop',
      category: 'Pickles',
      stock: 30,
      created_at: new Date().toISOString()
    }
  ];
}

if (db.categories.length === 0) {
  db.categories = [
    {
      id: '1',
      name: 'Pickles',
      description: 'Traditional Indian pickles',
      image: 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=400&h=400&fit=crop',
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Spices',
      description: 'Authentic Indian spices',
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=400&fit=crop',
      created_at: new Date().toISOString()
    }
  ];
}

// Save database function
const saveDatabase = () => {
  try {
    const dbPath = path.join(__dirname, '../server/db.json');
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
    console.log('Database saved successfully');
  } catch (error) {
    console.error('Error saving database:', error);
  }
};

// Email transporter configuration
const createEmailTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'your-email@gmail.com',
      pass: process.env.EMAIL_PASS || 'your-app-password'
    }
  });
};

// Basic API routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

app.get('/api/products', (req, res) => {
  try {
    res.json({
      success: true,
      data: db.products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/api/categories', (req, res) => {
  try {
    res.json({
      success: true,
      data: db.categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/api/banners', (req, res) => {
  try {
    res.json({
      success: true,
      data: db.banners
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/api/orders', (req, res) => {
  try {
    res.json({
      success: true,
      data: db.orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/api/users', (req, res) => {
  try {
    res.json({
      success: true,
      data: db.users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/api/notifications', (req, res) => {
  try {
    res.json({
      success: true,
      data: db.notifications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// User registration
app.post('/api/auth/register', (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Check if user already exists
    const existingUser = db.users.find(user => user.Email === email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User already exists'
      });
    }

    // Create new user
    const newUser = {
      ID: uuidv4(),
      Name: name,
      Email: email,
      Password: password, // In production, hash this password
      Phone: phone,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    db.users.push(newUser);
    saveDatabase();

    res.json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: newUser.ID,
        name: newUser.Name,
        email: newUser.Email,
        phone: newUser.Phone
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// User login
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;

    const user = db.users.find(u => u.Email === email && u.Password === password);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.ID,
        name: user.Name,
        email: user.Email,
        phone: user.Phone
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Additional API endpoints
app.get('/api/table/:tableId', (req, res) => {
  try {
    const { tableId } = req.params;
    let data = [];
    
    // Map table IDs to database collections
    switch (tableId) {
      case '10400': // Users
        data = db.users;
        break;
      case '10401': // Products
        data = db.products;
        break;
      case '10402': // Orders
        data = db.orders;
        break;
      case '10403': // Categories
        data = db.categories;
        break;
      case '10411': // User Profiles
        data = db.userProfiles;
        break;
      case '10412': // Notifications
        data = db.notifications;
        break;
      default:
        data = [];
    }
    
    res.json({
      success: true,
      data: {
        List: data,
        TotalCount: data.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/table/:tableId', (req, res) => {
  try {
    const { tableId } = req.params;
    const data = req.body;
    
    // Handle table operations based on tableId
    switch (tableId) {
      case '10400': // Users
        const newUser = { ...data, id: uuidv4(), created_at: new Date().toISOString() };
        db.users.push(newUser);
        break;
      case '10401': // Products
        const newProduct = { ...data, id: uuidv4(), created_at: new Date().toISOString() };
        db.products.push(newProduct);
        break;
      case '10402': // Orders
        const newOrder = { ...data, id: uuidv4(), created_at: new Date().toISOString() };
        db.orders.push(newOrder);
        break;
      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid table ID'
        });
    }
    
    saveDatabase();
    
    res.json({
      success: true,
      message: 'Data created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Add more API routes as needed...

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'API endpoint not found'
  });
});

// Export for Vercel
export default app; 