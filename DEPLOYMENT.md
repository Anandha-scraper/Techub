# Vercel Deployment Guide

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **MongoDB Atlas**: Set up a MongoDB Atlas cluster
3. **Environment Variables**: Prepare the required environment variables

## Required Environment Variables

Set these in your Vercel project settings:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
DB_NAME=your_database_name
NODE_ENV=production
```

## Deployment Steps

### 1. Connect to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from project root
vercel
```

### 2. Configure Environment Variables

In your Vercel dashboard:
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add the required variables listed above

### 3. Deploy

```bash
# Deploy to production
vercel --prod
```

## Project Structure

```
Techub/
├── api/
│   └── index.ts          # Main API handler
├── client/               # React frontend
├── server/               # Express backend
├── shared/               # Shared types
├── dist/                 # Build output
│   └── public/           # Static files
├── vercel.json           # Vercel configuration
├── .vercelignore         # Files to ignore
└── package.json
```

## Routing Configuration

The `vercel.json` file configures:

- **API Routes**: All `/api/*` requests go to `api/index.ts`
- **SPA Routes**: All other requests serve `index.html` for client-side routing
- **CORS Headers**: Proper CORS configuration for API endpoints
- **Security Headers**: Basic security headers for all routes

## Build Process

1. **Frontend**: Vite builds React app to `dist/public/`
2. **Backend**: Express server is bundled and served via Vercel Functions
3. **Static Files**: Served from `dist/public/` directory

## Troubleshooting

### Common Issues

1. **Build Failures**: Check that all dependencies are in `package.json`
2. **API Errors**: Verify environment variables are set correctly
3. **CORS Issues**: Check the headers configuration in `vercel.json`
4. **Database Connection**: Ensure MongoDB URI is correct and accessible

### Debug Commands

```bash
# Check build locally
npm run build

# Test API locally
npm run dev

# Check Vercel logs
vercel logs
```

## Performance Optimizations

- **Function Memory**: Set to 1024MB for better performance
- **Max Duration**: 30 seconds for API functions
- **Static Files**: Served from CDN automatically
- **Caching**: Headers configured for optimal caching

## Security Features

- **CORS**: Properly configured for API endpoints
- **Security Headers**: XSS protection, content type options
- **Environment Variables**: Sensitive data stored securely
- **Database**: MongoDB Atlas with proper authentication