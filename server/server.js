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
import { RazorpayService } from './services/RazorpayService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Configure CORS
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:8080', 'http://127.0.0.1:3000', 'http://127.0.0.1:8080', 'http://localhost:5173'],
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
app.use('/uploads', express.static(path.join(__dirname, '../dist/uploads')));

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

// Simple session store for authentication
const sessions = new Map();

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
db.logoSettings = db.logoSettings || []; // Added for logo settings

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
  return nodemailer.createTransport(emailConfig);
};

// Email sending endpoint
app.post('/api/send-email', async (req, res) => {
  try {
    const { to, cc, bcc, subject, html, text, attachments, from, headers } = req.body;
    
    console.log('Sending email:', { to, subject, from, headers });
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
      console.log('Demo mode: Simulating email success instead of failing');
      // For demo purposes, simulate successful email sending
      return res.json({ 
        success: true, 
        messageId: `demo_${Date.now()}`,
        message: 'Email sent successfully (demo mode)' 
      });
    }
    
    // Debug attachment content
    if (attachments && attachments.length > 0) {
      console.log('Attachment debug info:');
      attachments.forEach((att, index) => {
        console.log(`Attachment ${index}:`, {
          filename: att.filename,
          contentType: att.contentType,
          contentType: typeof att.content,
          contentLength: att.content ? att.content.length : 0,
          isBase64: att.content && typeof att.content === 'string' && /^[A-Za-z0-9+/]*={0,2}$/.test(att.content)
        });
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
      headers: headers || {},
      attachments: attachments ? attachments.map(att => {
        try {
          return {
            filename: att.filename,
            content: Buffer.from(att.content, 'base64'),
            contentType: att.contentType
          };
        } catch (error) {
          console.error('Error processing attachment:', error);
          console.error('Attachment content type:', typeof att.content);
          console.error('Attachment content preview:', att.content ? att.content.substring(0, 100) : 'null');
          throw error;
        }
      }) : undefined
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

// Notification API Endpoints

// Send notification with multiple channels
app.post('/api/notifications/send', async (req, res) => {
  try {
    const { 
      userId, 
      userIds, 
      title, 
      message, 
      type = 'system', 
      channels = ['in_app'], 
      priority = 'normal',
      actionUrl,
      metadata = {},
      scheduleAt,
      expiresAt 
    } = req.body;

    // Validate required fields
    if (!title || !message) {
      return res.status(400).json({
        success: false,
        error: 'Title and message are required'
      });
    }

    // Determine target users
    const targetUsers = userIds || (userId ? [userId] : []);
    if (targetUsers.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'At least one user ID must be provided'
      });
    }

    const notifications = [];
    const emailPromises = [];
    const whatsappPromises = [];

    // Create notifications for each user
    for (const uid of targetUsers) {
      const notificationData = {
        id: uuidv4(),
        user_id: uid,
        title,
        message,
        type,
        channel: channels.includes('in_app') ? 'in_app' : channels[0],
        status: scheduleAt ? 'scheduled' : 'sent',
        priority,
        is_read: false,
        metadata: JSON.stringify({
          ...metadata,
          actionUrl,
          channels,
          scheduleAt,
          expiresAt
        }),
        sent_at: scheduleAt ? null : new Date().toISOString(),
        created_at: new Date().toISOString(),
        scheduled_at: scheduleAt || null,
        expires_at: expiresAt || null
      };

      notifications.push(notificationData);
      db.notifications.push(notificationData);

      // Send email notification if requested
      if (channels.includes('email')) {
        const userProfile = db.userProfiles.find(p => p.user_id === uid);
        if (userProfile?.email_notifications) {
          const user = db.users.find(u => u.ID === uid);
          if (user?.Email) {
            const emailPromise = sendEnhancedNotificationEmail(user.Email, {
              title,
              message,
              type,
              priority,
              actionUrl,
              userName: user.Name
            });
            emailPromises.push(emailPromise);
          }
        }
      }

      // Send WhatsApp notification if requested
      if (channels.includes('whatsapp')) {
        const userProfile = db.userProfiles.find(p => p.user_id === uid);
        if (userProfile?.whatsapp_notifications && userProfile.phone_number) {
          const whatsappPromise = sendWhatsAppNotification(userProfile.phone_number, {
            title,
            message,
            type,
            priority
          });
          whatsappPromises.push(whatsappPromise);
        }
      }
    }

    // Execute all email and WhatsApp notifications
    const emailResults = await Promise.allSettled(emailPromises);
    const whatsappResults = await Promise.allSettled(whatsappPromises);

    saveDatabase();

    res.json({
      success: true,
      data: {
        notifications,
        emailsSent: emailResults.filter(r => r.status === 'fulfilled').length,
        whatsappSent: whatsappResults.filter(r => r.status === 'fulfilled').length,
        totalNotifications: notifications.length
      }
    });

  } catch (error) {
    console.error('Error sending notifications:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get notification statistics
app.get('/api/notifications/stats', (req, res) => {
  try {
    const { userId } = req.query;

    let notifications = db.notifications;
    if (userId) {
      notifications = notifications.filter(n => n.user_id === userId);
    }

    const stats = {
      total: notifications.length,
      unread: notifications.filter(n => !n.is_read).length,
      byType: {},
      byPriority: {},
      byChannel: {},
      byStatus: {}
    };

    // Calculate stats by type
    notifications.forEach(n => {
      stats.byType[n.type] = (stats.byType[n.type] || 0) + 1;
      stats.byChannel[n.channel] = (stats.byChannel[n.channel] || 0) + 1;
      stats.byStatus[n.status] = (stats.byStatus[n.status] || 0) + 1;
      
      const metadata = JSON.parse(n.metadata || '{}');
      const priority = metadata.priority || 'normal';
      stats.byPriority[priority] = (stats.byPriority[priority] || 0) + 1;
    });

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error fetching notification stats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Mark notifications as read
app.post('/api/notifications/mark-read', (req, res) => {
  try {
    const { notificationIds, userId } = req.body;

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return res.status(400).json({
        success: false,
        error: 'notificationIds array is required'
      });
    }

    let updatedCount = 0;
    for (const notificationId of notificationIds) {
      const notification = db.notifications.find(n => 
        n.id === notificationId && 
        (!userId || n.user_id === userId)
      );
      
      if (notification && !notification.is_read) {
        notification.is_read = true;
        notification.read_at = new Date().toISOString();
        updatedCount++;
      }
    }

    saveDatabase();

    res.json({
      success: true,
      data: {
        updatedCount,
        totalRequested: notificationIds.length
      }
    });

  } catch (error) {
    console.error('Error marking notifications as read:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Delete notifications
app.delete('/api/notifications', (req, res) => {
  try {
    const { notificationIds, userId } = req.body;

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return res.status(400).json({
        success: false,
        error: 'notificationIds array is required'
      });
    }

    let deletedCount = 0;
    for (const notificationId of notificationIds) {
      const index = db.notifications.findIndex(n => 
        n.id === notificationId && 
        (!userId || n.user_id === userId)
      );
      
      if (index !== -1) {
        db.notifications.splice(index, 1);
        deletedCount++;
      }
    }

    saveDatabase();

    res.json({
      success: true,
      data: {
        deletedCount,
        totalRequested: notificationIds.length
      }
    });

  } catch (error) {
    console.error('Error deleting notifications:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update user notification preferences
app.post('/api/notifications/preferences', (req, res) => {
  try {
    const { userId, preferences } = req.body;

    if (!userId || !preferences) {
      return res.status(400).json({
        success: false,
        error: 'userId and preferences are required'
      });
    }

    const userProfile = db.userProfiles.find(p => p.user_id === userId);
    if (!userProfile) {
      return res.status(404).json({
        success: false,
        error: 'User profile not found'
      });
    }

    // Update preferences
    if (preferences.email_notifications !== undefined) {
      userProfile.email_notifications = preferences.email_notifications;
    }
    if (preferences.whatsapp_notifications !== undefined) {
      userProfile.whatsapp_notifications = preferences.whatsapp_notifications;
    }
    if (preferences.marketing_notifications !== undefined) {
      userProfile.marketing_notifications = preferences.marketing_notifications;
    }
    if (preferences.push_notifications !== undefined) {
      userProfile.push_notifications = preferences.push_notifications;
    }

    userProfile.updated_at = new Date().toISOString();
    saveDatabase();

    res.json({
      success: true,
      data: userProfile
    });

  } catch (error) {
    console.error('Error updating notification preferences:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Enhanced email notification function
async function sendEnhancedNotificationEmail(email, notification) {
  try {
    const transporter = createEmailTransporter();
    
    const priorityColors = {
      urgent: '#ef4444',
      high: '#f97316',
      normal: '#3b82f6',
      low: '#6b7280'
    };

    const typeIcons = {
      order: '🛒',
      system: '🔔',
      promotion: '🎉',
      campaign: '📢'
    };

    const priorityBadge = notification.priority !== 'normal' ? `
      <span style="background-color: ${priorityColors[notification.priority]}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: bold; text-transform: uppercase;">
        ${notification.priority}
      </span>
    ` : '';

    const actionButton = notification.actionUrl ? `
      <div style="margin: 20px 0;">
        <a href="${notification.actionUrl}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
          View Details
        </a>
      </div>
    ` : '';

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1f2937; margin: 0; font-size: 24px;">
              ${typeIcons[notification.type] || '🔔'} MANAfoods Notification
            </h1>
            ${priorityBadge}
          </div>
          
          <div style="margin-bottom: 20px;">
            <h2 style="color: #1f2937; margin: 0 0 10px 0; font-size: 20px;">
              ${notification.title}
            </h2>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0;">
              ${notification.message}
            </p>
          </div>
          
          ${actionButton}
          
          <div style="border-top: 1px solid #e5e7eb; margin-top: 30px; padding-top: 20px;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              Hello ${notification.userName || 'Valued Customer'},<br>
              This notification was sent to you from MANAfoods. 
              If you have any questions, please contact our support team.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              © 2024 MANAfoods. All rights reserved.<br>
              You can manage your notification preferences in your account settings.
            </p>
          </div>
        </div>
      </div>
    `;

    const mailOptions = {
      from: 'MANAfoods <no-reply@manaeats.com>',
      to: email,
      subject: `${typeIcons[notification.type] || '🔔'} ${notification.title}`,
      html,
      headers: {
        'X-Priority': notification.priority === 'urgent' ? '1' : notification.priority === 'high' ? '2' : '3',
        'X-MSMail-Priority': notification.priority === 'urgent' ? 'High' : 'Normal'
      }
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Enhanced notification email sent:', info.messageId);
    return { success: true, messageId: info.messageId };

  } catch (error) {
    console.error('Error sending enhanced notification email:', error);
    throw error;
  }
}

// WhatsApp notification function
async function sendWhatsAppNotification(phoneNumber, notification) {
  try {
    // Format WhatsApp message based on notification type and priority
    const formattedMessage = formatWhatsAppNotification(notification);
    
    console.log('WhatsApp notification sent to:', phoneNumber, {
      type: notification.type,
      priority: notification.priority,
      title: notification.title
    });
    
    // Store in WhatsApp messages table
    db.whatsapp = db.whatsapp || [];
    const whatsappMessage = {
      id: uuidv4(),
      phone_number: phoneNumber,
      message_type: 'notification',
      message_content: formattedMessage,
      status: 'sent',
      notification_type: notification.type,
      priority: notification.priority,
      user_id: notification.userId || null,
      campaign_id: notification.campaignId || null,
      sent_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    db.whatsapp.push(whatsappMessage);

    return { success: true, messageId: `whatsapp_${Date.now()}` };

  } catch (error) {
    console.error('Error sending WhatsApp notification:', error);
    throw error;
  }
}

// Format notification for WhatsApp
function formatWhatsAppNotification(notification) {
  const { title, message, type, priority = 'normal', actionUrl } = notification;

  // Get appropriate emoji based on type and priority
  const getNotificationEmoji = (type, priority) => {
    if (priority === 'urgent') return '🚨';
    if (priority === 'high') return '⚡';
    
    switch (type) {
      case 'order': return '🛒';
      case 'system': return '🔔';
      case 'promotion': return '🎉';
      case 'campaign': return '📢';
      default: return '💬';
    }
  };

  const emoji = getNotificationEmoji(type, priority);
  const priorityText = priority === 'urgent' ? ' *[URGENT]*' : priority === 'high' ? ' *[HIGH]*' : '';

  let formattedMessage = `${emoji} *${title}*${priorityText}\n\n${message}`;

  // Add action URL if provided
  if (actionUrl) {
    formattedMessage += `\n\n🔗 *Take Action:* ${actionUrl}`;
  }

  // Add footer with business info
  formattedMessage += `\n\n📱 *MANAfoods Notification*`;
  formattedMessage += `\n⏰ ${new Date().toLocaleString()}`;
  
  // Add support contact for urgent notifications
  if (priority === 'urgent') {
    formattedMessage += `\n📞 *Urgent Support:* +91 98765 43210`;
  }

  return formattedMessage;
}

// Scheduled notifications processor (runs every minute)
setInterval(async () => {
  try {
    const now = new Date();
    const scheduledNotifications = db.notifications.filter(n => 
      n.status === 'scheduled' && 
      n.scheduled_at && 
      new Date(n.scheduled_at) <= now
    );

    for (const notification of scheduledNotifications) {
      notification.status = 'sent';
      notification.sent_at = new Date().toISOString();

      // Send email if configured
      const metadata = JSON.parse(notification.metadata || '{}');
      if (metadata.channels?.includes('email')) {
        const user = db.users.find(u => u.ID === notification.user_id);
        if (user?.Email) {
          try {
            await sendEnhancedNotificationEmail(user.Email, {
              title: notification.title,
              message: notification.message,
              type: notification.type,
              priority: metadata.priority || 'normal',
              actionUrl: metadata.actionUrl,
              userName: user.Name
            });
          } catch (error) {
            console.error('Error sending scheduled email notification:', error);
          }
        }
      }
    }

    if (scheduledNotifications.length > 0) {
      saveDatabase();
      console.log(`Processed ${scheduledNotifications.length} scheduled notifications`);
    }

  } catch (error) {
    console.error('Error processing scheduled notifications:', error);
  }
}, 60000); // Run every minute

// Cleanup expired notifications (runs every hour)
setInterval(() => {
  try {
    const now = new Date();
    const initialCount = db.notifications.length;
    
    db.notifications = db.notifications.filter(n => {
      const metadata = JSON.parse(n.metadata || '{}');
      return !metadata.expiresAt || new Date(metadata.expiresAt) > now;
    });

    const cleanedCount = initialCount - db.notifications.length;
    if (cleanedCount > 0) {
      saveDatabase();
      console.log(`Cleaned up ${cleanedCount} expired notifications`);
    }

  } catch (error) {
    console.error('Error cleaning up expired notifications:', error);
  }
}, 3600000); // Run every hour

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

  // Add customer user for demo
  const customerUser = {
    ID: '4',
    Name: 'Demo Customer',
    Email: 'customer@example.com',
    Password: 'customer123'
  };
  db.users.push(customerUser);

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

  // Add customer profile
  const customerProfile = {
    user_id: '4',
    phone_number: '1111111111',
    full_name: 'Demo Customer',
    avatar_url: '',
    email_notifications: true,
    whatsapp_notifications: false,
    marketing_notifications: true,
    auth_method: 'email',
    created_at: new Date().toISOString()
  };
  db.userProfiles.push(customerProfile);
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
      // Create a session
      const sessionId = uuidv4();
      sessions.set(sessionId, { userId: user.ID, email: user.Email });
      
      // Don't send password to client
      const { Password, ...userWithoutPassword } = user;
      const isAdmin = user.Email === 'admin@example.com';
      res.json({ 
        success: true, 
        data: { ...userWithoutPassword, isAdmin },
        sessionId: sessionId
      });
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

app.post('/api/auth/logout', (req, res) => {
  const sessionId = req.headers['x-session-id'] || req.body.sessionId;
  
  if (sessionId && sessions.has(sessionId)) {
    sessions.delete(sessionId);
  }
  
  res.json({ success: true, message: 'Logged out successfully' });
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
      case '10424':
      case 'logoSettings':
        tableData = db.logoSettings;
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
      case '10424': // Logo Settings
      case 'logoSettings':
        targetArray = db.logoSettings;
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
      case '10424':
      case 'logoSettings':
        targetArray = db.logoSettings;
        break;
      default:
        return res.status(404).json({ success: false, error: 'Table not found' });
    }
  
    let index = -1;
    
    // Use appropriate ID matching logic based on table type
    if (tableId === '10412' || tableId === 'notifications') {
      // For notifications, only match by id or ID fields, not user_id
      index = targetArray.findIndex(item => item.id == id || item.ID == id);
    } else if (tableId === '10399' || tableId === 'wishlist') {
      // For wishlist, only match by id or ID fields
      index = targetArray.findIndex(item => item.id == id || item.ID == id);
    } else {
      // For other tables, use the original logic
      index = targetArray.findIndex(item => item.id == id || item.ID == id || item.user_id == id);
    }
    
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
      case '10424': // Logo Settings
      case 'logoSettings':
        targetArray = db.logoSettings;
        break;
      default:
        return res.status(404).json({ success: false, error: 'Table not found' });
    }
    
    let index = -1;
    
    // Use appropriate ID matching logic based on table type
    if (tableId === '10412' || tableId === 'notifications') {
      // For notifications, only match by id or ID fields, not user_id
      index = targetArray.findIndex(item => item.id == id || item.ID == id);
    } else if (tableId === '10399' || tableId === 'wishlist') {
      // For wishlist, only match by id or ID fields
      index = targetArray.findIndex(item => item.id == id || item.ID == id);
    } else {
      // For other tables, use the original logic
      index = targetArray.findIndex(item => item.id == id || item.ID == id || item.user_id == id);
    }
    
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
  const sessionId = req.headers['x-session-id'] || req.query.sessionId;
  
  if (sessionId && sessions.has(sessionId)) {
    const session = sessions.get(sessionId);
    const user = db.users.find(u => u.ID === session.userId);
    
    if (user) {
      const { Password, ...userWithoutPassword } = user;
      const isAdmin = user.Email === 'admin@example.com';
      res.json({ success: true, data: { ...userWithoutPassword, isAdmin } });
    } else {
      res.status(401).json({ success: false, error: 'User not found' });
    }
  } else {
    // Fallback: check if there's a user in localStorage (for demo purposes)
    const adminUser = db.users.find(u => u.ID === '1');
    if (adminUser) {
      const { Password, ...userWithoutPassword } = adminUser;
      const isAdmin = adminUser.Email === 'admin@example.com';
      res.json({ success: true, data: { ...userWithoutPassword, isAdmin } });
    } else {
      res.status(401).json({ success: false, error: 'Not authenticated' });
    }
  }
});

// Razer Pay API Endpoints
app.post('/api/razerpay/create-order', async (req, res) => {
  try {
    const { amount, currency, receipt, notes } = req.body;

    // Create a new Razorpay order
    const result = await RazorpayService.createOrder({
      amount: amount, // amount in paise
      currency: currency,
      receipt: receipt,
      notes: notes,
    });

    if (result.success) {
      res.json({
        success: true,
        data: result.order,
      });
    } else {
      console.error('Error creating Razorpay order:', result.error);
      res.status(500).json({
        success: false,
        error: result.error,
      });
    }
  } catch (error) {
    console.error('Unexpected error creating Razorpay order:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create order',
    });
  }
});

app.post('/api/razerpay/verify-payment', async (req, res) => {
  try {
    const { razerpay_payment_id, razerpay_order_id, razerpay_signature, internal_order_id } = req.body;

    // Verify payment using RazorpayService
    const result = await RazorpayService.verifyPayment({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    if (result.success && result.verified) {
      console.log(`Verified Razorpay payment: ${razerpay_payment_id} for order ${razerpay_order_id}`);
      
      // Trigger payment confirmation and invoice delivery
      try {
        await triggerPaymentConfirmationFlow({
          payment_id: razerpay_payment_id,
          order_id: razerpay_order_id,
          internal_order_id: internal_order_id,
          payment_method: 'Razorpay',
          amount: result.payment_details?.amount ? result.payment_details.amount / 100 : 0, // Convert from paise
          verified_at: new Date().toISOString()
        });
        console.log('Payment confirmation flow triggered successfully');
      } catch (confirmationError) {
        console.error('Error in payment confirmation flow:', confirmationError);
        // Don't fail the verification response, but log the error
      }
      
      res.json({
        success: true,
        data: {
          payment_id: razerpay_payment_id,
          order_id: razerpay_order_id,
          status: 'verified',
        }
      });
    } else {
      console.error('Payment verification failed:', result.error);
      res.status(400).json({
        success: false,
        error: result.error || 'Verification failed',
      });
    }
  } catch (error) {
    console.error('Unexpected error verifying payment:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Verification error',
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
app.get('/api/products/:id', (req, res) => {
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
      features: product.features,
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
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ezsite');

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

// Push Notification Endpoints and Configuration
// webpush is already imported above

// VAPID keys (in production, store these securely)
const vapidKeys = {
  publicKey: 'BEl62iUYgUivxIkv69yViEuiBIa40HEMqc3kKaWfqJAUqObBLfvNYxJIe6PQqrxHbxYJlRGNKzGQlNHjnbNdGHE',
  privateKey: 'U6OvXFdP2u2VnDHqaZgGYPiYjzA2bqvJEQYNHJmxVbw'
};

// Configure web-push
webpush.setVapidDetails(
  'mailto:admin@manaeats.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

// Store push subscriptions in memory (in production, use a database)
const pushSubscriptions = new Map();

// Subscribe to push notifications
app.post('/api/push-notifications/subscribe', (req, res) => {
  try {
    const { userId, subscription } = req.body;

    if (!userId || !subscription) {
      return res.status(400).json({
        success: false,
        error: 'userId and subscription are required'
      });
    }

    // Store subscription
    pushSubscriptions.set(userId, subscription);
    
    // Update user profile with push notification preference
    const userProfile = db.userProfiles.find(p => p.user_id === userId);
    if (userProfile) {
      userProfile.push_notifications = true;
      userProfile.push_subscription = JSON.stringify(subscription);
      userProfile.updated_at = new Date().toISOString();
      saveDatabase();
    }

    console.log('Push subscription stored for user:', userId);
    res.json({
      success: true,
      message: 'Push subscription stored successfully'
    });

  } catch (error) {
    console.error('Error storing push subscription:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Unsubscribe from push notifications
app.post('/api/push-notifications/unsubscribe', (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required'
      });
    }

    // Remove subscription
    pushSubscriptions.delete(userId);
    
    // Update user profile
    const userProfile = db.userProfiles.find(p => p.user_id === userId);
    if (userProfile) {
      userProfile.push_notifications = false;
      userProfile.push_subscription = null;
      userProfile.updated_at = new Date().toISOString();
      saveDatabase();
    }

    console.log('Push subscription removed for user:', userId);
    res.json({
      success: true,
      message: 'Push subscription removed successfully'
    });

  } catch (error) {
    console.error('Error removing push subscription:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Send push notification
app.post('/api/push-notifications/send', async (req, res) => {
  try {
    const { 
      userId, 
      userIds, 
      title, 
      body, 
      icon, 
      badge, 
      tag, 
      data, 
      actions, 
      requireInteraction, 
      silent 
    } = req.body;

    if (!title || !body) {
      return res.status(400).json({
        success: false,
        error: 'title and body are required'
      });
    }

    // Determine target users
    const targetUsers = userIds || (userId ? [userId] : []);
    if (targetUsers.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'At least one user ID must be provided'
      });
    }

    const payload = JSON.stringify({
      title,
      body,
      icon: icon || '/favicon.ico',
      badge: badge || '/favicon.ico',
      tag: tag || 'default',
      data: data || {},
      actions: actions || [],
      requireInteraction: requireInteraction || false,
      silent: silent || false,
      timestamp: Date.now()
    });

    const pushPromises = [];
    let successCount = 0;
    let errorCount = 0;

    // Send to all target users
    for (const uid of targetUsers) {
      const subscription = pushSubscriptions.get(uid);
      if (subscription) {
        const pushPromise = webpush.sendNotification(subscription, payload)
          .then(() => {
            successCount++;
            console.log('Push notification sent to user:', uid);
          })
          .catch((error) => {
            errorCount++;
            console.error('Error sending push notification to user:', uid, error);
            
            // Remove invalid subscription
            if (error.statusCode === 410) {
              pushSubscriptions.delete(uid);
              const userProfile = db.userProfiles.find(p => p.user_id === uid);
              if (userProfile) {
                userProfile.push_notifications = false;
                userProfile.push_subscription = null;
              }
            }
          });
        pushPromises.push(pushPromise);
      }
    }

    // Wait for all push notifications to complete
    await Promise.all(pushPromises);

    // Save database if any subscriptions were removed
    if (errorCount > 0) {
      saveDatabase();
    }

    res.json({
      success: true,
      data: {
        totalRequested: targetUsers.length,
        successCount,
        errorCount
      }
    });

  } catch (error) {
    console.error('Error sending push notifications:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Test push notification
app.post('/api/push-notifications/test', async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required'
      });
    }

    const subscription = pushSubscriptions.get(userId);
    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: 'No push subscription found for this user'
      });
    }

    const payload = JSON.stringify({
      title: '🧪 Test Push Notification',
      body: 'This is a test notification from MANAfoods!',
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'test-notification',
      data: { test: true },
      requireInteraction: true,
      timestamp: Date.now()
    });

    await webpush.sendNotification(subscription, payload);

    res.json({
      success: true,
      message: 'Test push notification sent successfully'
    });

  } catch (error) {
    console.error('Error sending test push notification:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get push notification status
app.get('/api/push-notifications/status', (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required'
      });
    }

    const hasSubscription = pushSubscriptions.has(userId);
    const userProfile = db.userProfiles.find(p => p.user_id === userId);
    const isEnabled = userProfile?.push_notifications || false;

    res.json({
      success: true,
      data: {
        hasSubscription,
        isEnabled,
        vapidPublicKey: vapidKeys.publicKey
      }
    });

  } catch (error) {
    console.error('Error getting push notification status:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Track notification interactions
app.post('/api/notifications/track', (req, res) => {
  try {
    const { action, notificationId, timestamp } = req.body;

    // Log interaction for analytics
    console.log('Notification interaction tracked:', {
      action,
      notificationId,
      timestamp: new Date(timestamp).toISOString()
    });

    // In production, store this in a database for analytics
    
    res.json({
      success: true,
      message: 'Interaction tracked successfully'
    });

  } catch (error) {
    console.error('Error tracking notification interaction:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Load push subscriptions from database on startup
function loadPushSubscriptions() {
  try {
    db.userProfiles.forEach(profile => {
      if (profile.push_notifications && profile.push_subscription) {
        try {
          const subscription = JSON.parse(profile.push_subscription);
          pushSubscriptions.set(profile.user_id, subscription);
        } catch (error) {
          console.error('Error parsing push subscription for user:', profile.user_id, error);
        }
      }
    });
    console.log(`Loaded ${pushSubscriptions.size} push subscriptions`);
  } catch (error) {
    console.error('Error loading push subscriptions:', error);
  }
}

// Load push subscriptions on startup
loadPushSubscriptions();

// Payment confirmation flow handler
async function triggerPaymentConfirmationFlow(paymentData) {
  try {
    console.log('Triggering payment confirmation flow for:', paymentData);
    
    const { payment_id, order_id, internal_order_id, payment_method, amount, verified_at } = paymentData;
    
    // Update order status in database if internal order ID is provided
    if (internal_order_id) {
      // Find and update the order
      const orderIndex = db.orders.findIndex(order => order.id === internal_order_id);
      if (orderIndex !== -1) {
        db.orders[orderIndex] = {
          ...db.orders[orderIndex],
          order_status: 'processing',
          razerpay_payment_id: payment_id,
          payment_verified_at: verified_at,
          updated_at: new Date().toISOString()
        };
        
        console.log(`Order ${internal_order_id} status updated to processing`);
      } else {
        console.warn(`Order ${internal_order_id} not found in database`);
      }
    }
    
    // Save database changes
    saveDatabase();
    
    // Send payment confirmation notifications
    // This could include email, SMS, push notifications, etc.
    console.log('Payment confirmation flow completed successfully');
    
    return { success: true };
  } catch (error) {
    console.error('Error in payment confirmation flow:', error);
    return { success: false, error: error.message };
  }
}
