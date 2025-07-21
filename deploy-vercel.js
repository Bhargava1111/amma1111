#!/usr/bin/env node

/**
 * Vercel Deployment Preparation Script
 * This script helps prepare the application for Vercel deployment
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Preparing application for Vercel deployment...\n');

// Check if required files exist
const requiredFiles = [
  'package.json',
  'vite.config.ts',
  'vercel.json',
  'api/index.js'
];

console.log('📋 Checking required files...');
requiredFiles.forEach(file => {
  if (fs.existsSync(path.join(__dirname, file))) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
  }
});

// Check if build works
console.log('\n🔨 Testing build process...');
try {
  const { execSync } = await import('child_process');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build successful');
} catch (error) {
  console.log('❌ Build failed');
  console.error(error.message);
  process.exit(1);
}

// Check environment variables
console.log('\n🔧 Checking environment configuration...');
const envExamplePath = path.join(__dirname, 'vercel.env.example');
if (fs.existsSync(envExamplePath)) {
  console.log('✅ Environment variables template found');
  console.log('📝 Remember to configure environment variables in Vercel dashboard');
} else {
  console.log('❌ Environment variables template missing');
}

// Check API configuration
console.log('\n🌐 Checking API configuration...');
const apiPath = path.join(__dirname, 'api/index.js');
if (fs.existsSync(apiPath)) {
  console.log('✅ API routes configured');
} else {
  console.log('❌ API routes missing');
}

// Check Vercel configuration
console.log('\n⚙️ Checking Vercel configuration...');
const vercelConfigPath = path.join(__dirname, 'vercel.json');
if (fs.existsSync(vercelConfigPath)) {
  const vercelConfig = JSON.parse(fs.readFileSync(vercelConfigPath, 'utf8'));
  console.log('✅ Vercel configuration found');
  console.log(`   - Version: ${vercelConfig.version}`);
  console.log(`   - Builds: ${vercelConfig.builds?.length || 0}`);
  console.log(`   - Routes: ${vercelConfig.routes?.length || 0}`);
} else {
  console.log('❌ Vercel configuration missing');
}

console.log('\n🎉 Deployment preparation complete!');
console.log('\n📚 Next steps:');
console.log('1. Push your code to a Git repository');
console.log('2. Go to vercel.com and create a new project');
console.log('3. Import your repository');
console.log('4. Configure environment variables in Vercel dashboard');
console.log('5. Deploy!');
console.log('\n📖 For detailed instructions, see VERCEL_DEPLOYMENT.md'); 