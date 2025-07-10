#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  title: (msg) => console.log(`${colors.bright}${colors.cyan}${msg}${colors.reset}`),
};

// Essential environment variables that need to be configured
const essentialVars = {
  'VITE_EZSITE_API_KEY': {
    description: 'Your EzSite API Key',
    required: true,
    example: 'ezsite_api_key_here'
  },
  'VITE_EZSITE_PROJECT_ID': {
    description: 'Your EzSite Project ID',
    required: true,
    example: 'your_project_id'
  },
  'VITE_EMAIL_API_KEY': {
    description: 'Email Service API Key (for notifications)',
    required: false,
    example: 'email_api_key_here'
  },
  'VITE_STRIPE_PUBLISHABLE_KEY': {
    description: 'Stripe Publishable Key (for payments)',
    required: false,
    example: 'pk_test_your_stripe_key'
  },
  'VITE_GOOGLE_MAPS_API_KEY': {
    description: 'Google Maps API Key (for location services)',
    required: false,
    example: 'google_maps_api_key'
  },
  'VITE_FIREBASE_API_KEY': {
    description: 'Firebase API Key (for push notifications)',
    required: false,
    example: 'firebase_api_key'
  },
  'VITE_WHATSAPP_ACCESS_TOKEN': {
    description: 'WhatsApp Business API Access Token',
    required: false,
    example: 'whatsapp_access_token'
  }
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function checkExistingEnv() {
  const envPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    log.warn('.env file already exists!');
    const answer = await question('Do you want to overwrite it? (y/N): ');
    if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
      log.info('Setup cancelled. Your existing .env file was not modified.');
      return false;
    }
  }
  return true;
}

async function createEnvFile() {
  const examplePath = path.join(process.cwd(), 'env.example');
  const envPath = path.join(process.cwd(), '.env');

  if (!fs.existsSync(examplePath)) {
    log.error('env.example file not found!');
    log.info('Please make sure you have the env.example file in your project root.');
    return false;
  }

  try {
    // Read the example file
    const exampleContent = fs.readFileSync(examplePath, 'utf8');
    
    // Copy the example file to .env
    fs.writeFileSync(envPath, exampleContent);
    
    log.success('.env file created successfully!');
    return true;
  } catch (error) {
    log.error(`Error creating .env file: ${error.message}`);
    return false;
  }
}

async function configureEssentialVars() {
  log.title('\n📝 Configure Essential Environment Variables');
  log.info('Let\'s set up the most important environment variables for your application.\n');

  const envPath = path.join(process.cwd(), '.env');
  let envContent = fs.readFileSync(envPath, 'utf8');

  for (const [varName, config] of Object.entries(essentialVars)) {
    const current = getCurrentValue(envContent, varName);
    
    console.log(`${colors.cyan}${varName}${colors.reset}`);
    console.log(`  Description: ${config.description}`);
    console.log(`  Required: ${config.required ? 'Yes' : 'No'}`);
    console.log(`  Current value: ${current || 'Not set'}`);
    
    if (config.required || current === config.example) {
      const answer = await question(`  Enter new value (or press Enter to skip): `);
      if (answer.trim()) {
        envContent = updateEnvVar(envContent, varName, answer.trim());
        log.success(`  Updated ${varName}`);
      } else if (config.required) {
        log.warn(`  ${varName} is required but not set!`);
      }
    } else {
      log.info('  Skipping (already configured)');
    }
    
    console.log('');
  }

  // Save the updated content
  fs.writeFileSync(envPath, envContent);
  log.success('Environment variables updated!');
}

function getCurrentValue(content, varName) {
  const regex = new RegExp(`^${varName}=(.*)$`, 'm');
  const match = content.match(regex);
  return match ? match[1] : null;
}

function updateEnvVar(content, varName, value) {
  const regex = new RegExp(`^${varName}=.*$`, 'm');
  const replacement = `${varName}=${value}`;
  
  if (content.match(regex)) {
    return content.replace(regex, replacement);
  } else {
    return content + `\n${replacement}`;
  }
}

async function validateConfiguration() {
  log.title('\n🔍 Validating Configuration');
  
  const envPath = path.join(process.cwd(), '.env');
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  const errors = [];
  const warnings = [];
  
  // Check required variables
  for (const [varName, config] of Object.entries(essentialVars)) {
    const value = getCurrentValue(envContent, varName);
    
    if (config.required && (!value || value === config.example)) {
      errors.push(`${varName} is required but not properly configured`);
    } else if (value === config.example) {
      warnings.push(`${varName} is still using the example value`);
    }
  }
  
  // Display results
  if (errors.length > 0) {
    log.error('Configuration errors found:');
    errors.forEach(error => log.error(`  - ${error}`));
  }
  
  if (warnings.length > 0) {
    log.warn('Configuration warnings:');
    warnings.forEach(warning => log.warn(`  - ${warning}`));
  }
  
  if (errors.length === 0 && warnings.length === 0) {
    log.success('Configuration looks good!');
  }
  
  return errors.length === 0;
}

async function showNextSteps() {
  log.title('\n🚀 Next Steps');
  log.info('Your .env file has been created! Here\'s what you can do next:');
  console.log('');
  log.info('1. Review and update additional environment variables in .env');
  log.info('2. Configure your payment gateway credentials (Stripe, PayPal, etc.)');
  log.info('3. Set up email service for notifications');
  log.info('4. Configure social media integration if needed');
  log.info('5. Set up analytics and monitoring services');
  console.log('');
  log.info('📁 Important files:');
  log.info('  - .env (your configuration - DO NOT commit to Git)');
  log.info('  - env.example (template file - safe to commit)');
  log.info('  - src/config/env.ts (environment configuration utility)');
  console.log('');
  log.info('🔧 Development commands:');
  log.info('  - npm run dev (start development server)');
  log.info('  - npm run build (build for production)');
  console.log('');
  log.success('Happy coding! 🎉');
}

async function main() {
  try {
    console.clear();
    log.title('🛠️  MANAfoods Environment Setup');
    log.info('This script will help you set up your environment variables.\n');

    // Check if we should proceed
    const shouldProceed = await checkExistingEnv();
    if (!shouldProceed) {
      process.exit(0);
    }

    // Create .env file from example
    const envCreated = await createEnvFile();
    if (!envCreated) {
      process.exit(1);
    }

    // Configure essential variables
    await configureEssentialVars();

    // Validate configuration
    const isValid = await validateConfiguration();

    // Show next steps
    await showNextSteps();

    // Exit with appropriate code
    process.exit(isValid ? 0 : 1);

  } catch (error) {
    log.error(`Setup failed: ${error.message}`);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  log.info('\nSetup cancelled by user.');
  rl.close();
  process.exit(0);
});

// Run the setup
main(); 