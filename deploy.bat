@echo off
echo 🚀 MANAfoods Deployment Script for Hostinger (Windows)
echo.

echo 📦 Installing dependencies...
call npm install
if errorlevel 1 goto error

echo 🏗️ Building React application...
call npm run build
if errorlevel 1 goto error

echo ⚙️ Preparing server...
cd server
call npm install --production
if errorlevel 1 goto error
cd ..

echo 📦 Creating deployment package...
if not exist deployment mkdir deployment
xcopy /E /I /H /Y dist\* deployment\
xcopy /E /I /H /Y server deployment\server\
copy .htaccess deployment\
copy package.json deployment\

echo 🔧 Creating production environment...
echo NODE_ENV=production > deployment\.env
echo PORT=3001 >> deployment\.env
echo VITE_APP_NAME=MANAfoods >> deployment\.env
echo VITE_APP_VERSION=1.0.0 >> deployment\.env

echo.
echo ✅ Deployment package ready in 'deployment' folder!
echo.
echo 📋 Next steps:
echo 1. Upload the 'deployment' folder contents to your Hostinger public_html directory
echo 2. Setup Node.js application in Hostinger control panel
echo 3. Configure your domain to point to the application
echo 4. Set up SSL certificate
echo.
echo 🌐 Your application will be live at your domain!
pause
goto end

:error
echo ❌ Error occurred during deployment preparation!
pause

:end 