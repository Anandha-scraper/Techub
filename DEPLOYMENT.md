# Render Deployment Guide

## Prerequisites

1. **MongoDB Atlas Account**
   - Create a free MongoDB Atlas cluster
   - Get your connection string
   - Whitelist Render's IP ranges (0.0.0.0/0 for development)

2. **GitHub Repository**
   - Push your code to GitHub
   - Ensure all files are committed

## Deployment Steps

### Step 1: Prepare Your Code

1. **Environment Variables**
   - Copy `env.example` to `.env` locally
   - Fill in your MongoDB connection string
   - Test locally with `npm run dev`

2. **Build Test**
   ```bash
   npm run build
   npm start
   ```

### Step 2: Deploy to Render

#### Option A: Using Render Dashboard (Recommended)

1. **Go to Render Dashboard**
   - Visit [render.com](https://render.com)
   - Sign up/login with GitHub

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select your Techub repository

3. **Configure Service**
   - **Name**: `techub-app`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: `Free`

4. **Environment Variables**
   - `NODE_ENV` = `production`
   - `MONGODB_URI` = `your-mongodb-connection-string`
   - `DB_NAME` = `techub`
   - `PORT` = `10000` (Render will override this)

5. **Deploy**
   - Click "Create Web Service"
   - Wait for build to complete
   - Your app will be available at `https://techub-app.onrender.com`

#### Option B: Using render.yaml (Advanced)

1. **Push render.yaml to your repository**
2. **In Render Dashboard**
   - Click "New +" → "Blueprint"
   - Connect your repository
   - Render will automatically detect `render.yaml`

### Step 3: Post-Deployment Setup

1. **Test Your Application**
   - Visit your Render URL
   - Test login functionality
   - Verify API endpoints

2. **Create Master Admin**
   - Use the master login functionality
   - Create admin accounts
   - Set up your initial data

## Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Test build locally
   npm run build
   npm start
   ```

2. **MongoDB Connection Issues**
   - Check your connection string
   - Ensure IP whitelist includes 0.0.0.0/0
   - Verify database name

3. **Port Issues**
   - Render automatically sets PORT
   - Don't hardcode port numbers
   - Use `process.env.PORT`

4. **Static File Issues**
   - Ensure `dist/public` exists after build
   - Check Vite build configuration

### Debug Commands

```bash
# Local production test
npm run build
npm start

# Check build output
ls -la dist/public/

# Test API endpoints
curl https://your-app.onrender.com/api/health
```

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://...` |
| `DB_NAME` | Database name | `techub` |
| `PORT` | Server port (set by Render) | `10000` |

## Performance Optimization

1. **Enable Gzip Compression**
   - Already configured in Express

2. **Static File Caching**
   - Vite handles this automatically

3. **Database Indexing**
   - MongoDB indexes are already configured

## Security Considerations

1. **Environment Variables**
   - Never commit `.env` files
   - Use Render's environment variable system

2. **MongoDB Security**
   - Use strong passwords
   - Enable IP whitelisting
   - Use connection string with authentication

3. **API Security**
   - Master key is for demo purposes
   - Implement proper JWT authentication for production

## Monitoring

1. **Render Dashboard**
   - Monitor logs
   - Check metrics
   - Set up alerts

2. **Health Checks**
   - `/api/health` endpoint available
   - Render automatically monitors this

## Scaling

1. **Free Tier Limits**
   - 750 hours/month
   - Sleeps after 15 minutes of inactivity
   - Cold start takes ~30 seconds

2. **Upgrading**
   - Consider Render's paid plans for production
   - Better performance and no sleep

## Support

- **Render Documentation**: [render.com/docs](https://render.com/docs)
- **MongoDB Atlas**: [docs.atlas.mongodb.com](https://docs.atlas.mongodb.com)
- **Project Issues**: Check GitHub repository issues
