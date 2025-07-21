#!/bin/bash

# MANAfoods Deployment Script for Hostinger
echo "🚀 Starting deployment process..."

# Step 1: Install dependencies
echo "📦 Installing dependencies..."
npm install

# Step 2: Build the React application
echo "🏗️ Building React application..."
npm run build

# Step 3: Prepare server dependencies
echo "⚙️ Preparing server..."
cd server
npm install --production
cd ..

# Step 4: Create deployment package
echo "📦 Creating deployment package..."
mkdir -p deployment
cp -r dist/* deployment/
cp -r server deployment/
cp .htaccess deployment/
cp package.json deployment/

# Step 5: Create production environment file
echo "🔧 Creating production environment..."
cat > deployment/.env << EOL
NODE_ENV=production
PORT=3001
VITE_APP_NAME=MANAfoods
VITE_APP_VERSION=1.0.0
EOL

echo "✅ Deployment package ready in 'deployment' folder!"
echo ""
echo "📋 Next steps:"
echo "1. Upload the 'deployment' folder contents to your Hostinger public_html directory"
echo "2. Setup Node.js application in Hostinger control panel"
echo "3. Configure your domain to point to the application"
echo "4. Set up SSL certificate"
echo ""
echo "🌐 Your application will be live at your domain!" 