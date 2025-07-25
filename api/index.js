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

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ezsite');

const mongoConnection = mongoose.connection;
mongoConnection.on('error', console.error.bind(console, 'connection error:'));
mongoConnection.once('open', function() {
  console.log('Connected to MongoDB!');
});

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

// Simple session store for authentication
const sessions = new Map();

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
      image_url: 'https://picsum.photos/800/400?random=1',
      link: '/products',
      active: true,
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      title: 'Special Offers',
      subtitle: 'Up to 30% off on selected items',
      image_url: 'https://picsum.photos/800/400?random=2',
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
      image: 'https://picsum.photos/400/400?random=3',
      category: 'Pickles',
      stock: 50,
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Lemon Pickle',
      description: 'Tangy lemon pickle with spices',
      price: 120,
      image: 'https://picsum.photos/400/400?random=4',
      category: 'Pickles',
      stock: 30,
      created_at: new Date().toISOString()
    },
    {
      id: '3',
      name: 'Mixed Pickle',
      description: 'Assorted vegetable pickle',
      price: 180,
      image: 'https://picsum.photos/400/400?random=5',
      category: 'Pickles',
      stock: 25,
      created_at: new Date().toISOString()
    },
    {
      id: '4',
      name: 'Chilli Pickle',
      description: 'Spicy red chilli pickle',
      price: 90,
      image: 'https://picsum.photos/400/400?random=6',
      category: 'Pickles',
      stock: 40,
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
      image: 'https://picsum.photos/400/400?random=7',
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Spices',
      description: 'Authentic Indian spices',
      image: 'https://picsum.photos/400/400?random=8',
      created_at: new Date().toISOString()
    }
  ];
}

// Fix existing product images if they have broken URLs
db.products.forEach(product => {
  if (product.image && (product.image.includes('unsplash.com') || !product.image.startsWith('http'))) {
    product.image = `https://picsum.photos/400/400?random=${Math.floor(Math.random() * 1000)}`;
  }
});

// Fix existing banner images if they have broken URLs
db.banners.forEach(banner => {
  if (banner.image_url && (banner.image_url.includes('unsplash.com') || !banner.image_url.startsWith('http'))) {
    banner.image_url = `https://picsum.photos/800/400?random=${Math.floor(Math.random() * 1000)}`;
  }
});

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
      user: process.env.SMTP_USER || 'your-email@gmail.com',
      pass: process.env.SMTP_PASSWORD || 'your-app-password'
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

// Image proxy endpoint to handle CORS issues
app.get('/api/image-proxy', (req, res) => {
  try {
    const { url } = req.query;
    if (!url) {
      return res.status(400).json({ error: 'URL parameter is required' });
    }
    
    // For now, just return the URL as-is
    // In production, you might want to proxy the image through your server
    res.json({ 
      success: true, 
      imageUrl: url,
      fallbackUrl: 'https://picsum.photos/400/400?random=' + Math.floor(Math.random() * 1000)
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

app.post('/api/table/page/:tableId', (req, res) => {
  try {
    const { tableId } = req.params;
    const { PageNo = 1, PageSize = 10, Filters = [] } = req.body;

    let tableData = [];
    switch (tableId) {
      case '10411':
        tableData = db.userProfiles;
        break;
      default:
        return res.status(404).json({ success: false, error: 'Table not found' });
    }

    let filteredData = tableData;
    if (Filters.length > 0) {
      Filters.forEach(filter => {
        if (filter.op.toLowerCase() === 'like') {
          filteredData = filteredData.filter(item =>
            item[filter.name] && item[filter.name].toLowerCase().includes(filter.value.replace(/%/g, '').toLowerCase())
          );
        }
      });
    }

    const start = (PageNo - 1) * PageSize;
    const end = start + PageSize;
    const paginatedData = filteredData.slice(start, end);

    res.json({
      success: true,
      data: {
        List: paginatedData,
        VirtualCount: filteredData.length,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
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
