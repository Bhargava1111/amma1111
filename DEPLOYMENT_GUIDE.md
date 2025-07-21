# 🚀 MANAfoods Deployment Guide for Hostinger

## Prerequisites
- Hostinger hosting account with Node.js support
- Domain name configured
- FTP/File Manager access
- Basic knowledge of terminal/command line

## 📋 Step-by-Step Deployment Process

### Step 1: Prepare Your Local Environment

```bash
# 1. Build the application
npm run build

# 2. Or use the deployment script
chmod +x deploy.sh
./deploy.sh
```

### Step 2: Hostinger Setup

#### 2.1 Enable Node.js in Hostinger
1. Log into your Hostinger control panel
2. Go to **Advanced** → **Node.js**
3. Click **Create Application**
4. Choose Node.js version (16.x or higher recommended)
5. Set Application URL (e.g., your domain)
6. Set Application Root: `/public_html`
7. Set Application Startup File: `server/server.js`

#### 2.2 Upload Files
1. Access **File Manager** in Hostinger control panel
2. Navigate to `public_html` directory
3. Upload all files from the `dist` folder (React build)
4. Upload the `server` folder
5. Upload `.htaccess` file
6. Upload `package.json`

### Step 3: Configure Environment Variables

#### 3.1 Create .env file in server directory
```env
NODE_ENV=production
PORT=3001
VITE_APP_NAME=MANAfoods
VITE_APP_VERSION=1.0.0

# Database (if using external DB)
DB_HOST=your_db_host
DB_PORT=3306
DB_NAME=your_db_name
DB_USER=your_db_user
DB_PASS=your_db_password

# Optional: Email configuration
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASS=your_password
```

### Step 4: Install Dependencies on Server

#### 4.1 Using Terminal (if available)
```bash
cd public_html/server
npm install --production
```

#### 4.2 Using Hostinger Node.js Panel
1. Go to **Node.js** section
2. Click on your application
3. Click **Install Dependencies**
4. Wait for installation to complete

### Step 5: Start the Application

#### 5.1 Start Node.js Application
1. In Hostinger Node.js panel
2. Click **Start** on your application
3. Verify it shows as "Running"

#### 5.2 Configure Domain
1. Ensure your domain points to the Node.js application
2. Set up SSL certificate (recommended)

## 📁 File Structure on Server

```
public_html/
├── index.html          # React app entry point
├── assets/            # React app assets (CSS, JS, images)
├── .htaccess          # Apache configuration
├── server/            # Node.js backend
│   ├── server.js      # Main server file
│   ├── db.json        # Database file
│   ├── package.json   # Server dependencies
│   └── node_modules/  # Server dependencies
└── package.json       # Root package.json
```

## 🔧 Troubleshooting

### Common Issues:

#### 1. 404 Errors on React Routes
**Solution:** Ensure `.htaccess` file is uploaded and contains React routing rules.

#### 2. API Calls Failing
**Solution:** 
- Check Node.js application is running
- Verify API proxy rules in `.htaccess`
- Check server logs in Hostinger panel

#### 3. Static Files Not Loading
**Solution:**
- Verify all `dist` files are uploaded
- Check file permissions (755 for directories, 644 for files)

#### 4. Database Connection Issues
**Solution:**
- Create MySQL database in Hostinger panel
- Update connection strings in server code
- Ensure database credentials are correct

## 🌐 Testing Your Deployment

### 1. Test Frontend
Visit your domain - you should see the MANAfoods homepage.

### 2. Test API
Visit `yourdomain.com/api/health` - should return server status.

### 3. Test Authentication
Try logging in with admin credentials.

### 4. Test Product Catalog
Navigate through product pages and admin panel.

## 🚀 Performance Optimization

### 1. Enable Gzip Compression
Already included in `.htaccess` file.

### 2. Set Up CDN
Use Hostinger's CDN service for faster loading.

### 3. Optimize Images
Compress images before uploading.

### 4. Enable Browser Caching
Cache headers already set in `.htaccess`.

## 🔐 Security Considerations

### 1. Environment Variables
Never commit sensitive data to version control.

### 2. HTTPS
Always use SSL certificates (free with Hostinger).

### 3. Security Headers
Security headers are set in `.htaccess`.

### 4. Database Security
Use strong passwords and restrict database access.

## 📞 Support

If you encounter issues:
1. Check Hostinger documentation
2. Review server logs in Hostinger panel
3. Test locally first to isolate issues
4. Contact Hostinger support for hosting-specific problems

## 🎉 Success!

Once deployed, your MANAfoods application will be live at your domain with:
- ✅ React frontend served by Apache
- ✅ Node.js backend running on Hostinger
- ✅ Database functionality
- ✅ Admin panel access
- ✅ Mobile-responsive design
- ✅ SSL security

Your users can now access the full MANAfoods experience online! 