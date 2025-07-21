# Vercel Deployment Guide

This guide will help you deploy your MANAfoods application to Vercel.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub/GitLab/Bitbucket**: Your code should be in a Git repository
3. **Node.js**: Version 16 or higher

## Step 1: Prepare Your Repository

1. Make sure your code is committed to a Git repository
2. Ensure all dependencies are properly listed in `package.json`
3. Verify that the build script works locally: `npm run build`

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your Git repository
4. Configure the project settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### Option B: Deploy via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy from your project directory:
   ```bash
   vercel
   ```

## Step 3: Configure Environment Variables

In your Vercel project dashboard, go to Settings > Environment Variables and add the following:

### Required Variables:
```
VITE_API_BASE_URL=https://your-app.vercel.app/api
VITE_PRODUCTION_URL=https://your-app.vercel.app
```

### Optional Variables (configure as needed):
```
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
VITE_PAYPAL_CLIENT_ID=your_paypal_client_id
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
VITE_EZSITE_API_URL=your_ezsite_api_url
VITE_EZSITE_API_KEY=your_ezsite_api_key
VITE_EZSITE_PROJECT_ID=your_ezsite_project_id
```

## Step 4: Configure Build Settings

In your Vercel project settings:

1. **Build Command**: `npm run build`
2. **Output Directory**: `dist`
3. **Install Command**: `npm install`
4. **Node.js Version**: 18.x or higher

## Step 5: Deploy

1. Push your changes to your Git repository
2. Vercel will automatically trigger a new deployment
3. Monitor the deployment logs for any errors

## Step 6: Verify Deployment

1. Check that your application loads correctly at the Vercel URL
2. Test API endpoints at `https://your-app.vercel.app/api/health`
3. Verify that all features work as expected

## Troubleshooting

### Common Issues:

1. **Build Failures**:
   - Check that all dependencies are in `package.json`
   - Verify TypeScript compilation passes locally
   - Check build logs for specific error messages

2. **API Routes Not Working**:
   - Ensure `vercel.json` is properly configured
   - Check that API routes are in the `api/` directory
   - Verify CORS settings in `api/index.js`

3. **Environment Variables**:
   - Make sure all required environment variables are set in Vercel
   - Check that variable names match exactly (case-sensitive)
   - Redeploy after adding new environment variables

4. **Static Assets**:
   - Ensure all assets are in the `public/` directory
   - Check that build output is in the `dist/` directory
   - Verify file paths in your code

### Debugging:

1. **Check Vercel Logs**: Go to your project dashboard > Functions to see serverless function logs
2. **Local Testing**: Test your build locally with `npm run build && npm run preview`
3. **Environment Check**: Add a debug endpoint to verify environment variables

## Post-Deployment

1. **Custom Domain**: Configure a custom domain in Vercel settings
2. **SSL Certificate**: Vercel provides automatic SSL certificates
3. **Analytics**: Enable Vercel Analytics for performance monitoring
4. **Monitoring**: Set up error tracking and performance monitoring

## File Structure for Vercel

```
your-project/
├── api/
│   └── index.js          # API routes for Vercel
├── src/                  # React source code
├── public/               # Static assets
├── dist/                 # Build output (generated)
├── vercel.json           # Vercel configuration
├── package.json          # Dependencies and scripts
└── vite.config.ts        # Vite configuration
```

## Support

If you encounter issues:

1. Check the [Vercel Documentation](https://vercel.com/docs)
2. Review the deployment logs in your Vercel dashboard
3. Test locally to isolate issues
4. Check the [Vercel Community](https://github.com/vercel/vercel/discussions) for help

## Notes

- Vercel automatically handles serverless functions for API routes
- Static assets are served from the `dist/` directory
- Environment variables are automatically injected at build time
- Each deployment creates a unique URL for testing
- Automatic deployments are triggered on Git pushes 