# Render Deployment Checklist

## ✅ Pre-Deployment Checklist

### 1. Code Preparation
- [x] All code committed to GitHub
- [x] Build test passes locally (`npm run build`)
- [x] Production start test passes (`npm start`)
- [x] Environment variables configured
- [x] MongoDB connection string ready

### 2. Render Configuration Files
- [x] `render.yaml` created
- [x] `Procfile` created
- [x] `.nvmrc` created (Node.js 18)
- [x] `env.example` created
- [x] `DEPLOYMENT.md` created

### 3. Package.json Updates
- [x] `render-build` script added
- [x] `render-start` script added
- [x] Production dependencies verified

### 4. Server Configuration
- [x] Port configuration updated for Render
- [x] Environment variable handling
- [x] Static file serving configured
- [x] Health check endpoint available

## 🚀 Deployment Steps

### Step 1: MongoDB Atlas Setup
1. [ ] Create MongoDB Atlas account
2. [ ] Create free cluster
3. [ ] Get connection string
4. [ ] Whitelist IP: `0.0.0.0/0`
5. [ ] Test connection locally

### Step 2: GitHub Repository
1. [ ] Push all changes to GitHub
2. [ ] Verify all files are committed
3. [ ] Check repository is public (for free Render)

### Step 3: Render Deployment
1. [ ] Go to [render.com](https://render.com)
2. [ ] Sign up/login with GitHub
3. [ ] Click "New +" → "Web Service"
4. [ ] Connect GitHub repository
5. [ ] Configure service settings:
   - Name: `techub-app`
   - Environment: `Node`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Plan: `Free`
6. [ ] Add environment variables:
   - `NODE_ENV` = `production`
   - `MONGODB_URI` = `your-mongodb-connection-string`
   - `DB_NAME` = `techub`
7. [ ] Click "Create Web Service"
8. [ ] Wait for build to complete

### Step 4: Post-Deployment Testing
1. [ ] Visit your Render URL
2. [ ] Test login functionality
3. [ ] Verify API endpoints work
4. [ ] Test PDF export feature
5. [ ] Check admin dashboard
6. [ ] Test student portal

## 🔧 Troubleshooting

### Common Issues & Solutions

#### Build Failures
```bash
# Test locally first
npm run build
npm start
```

#### MongoDB Connection Issues
- Check connection string format
- Verify IP whitelist includes `0.0.0.0/0`
- Ensure database name is correct

#### Port Issues
- Render automatically sets PORT
- Don't hardcode port numbers
- Use `process.env.PORT`

#### Static File Issues
- Ensure `dist/public` exists after build
- Check Vite build configuration

## 📊 Performance Monitoring

### Render Dashboard
- [ ] Monitor logs for errors
- [ ] Check metrics and performance
- [ ] Set up alerts if needed

### Health Checks
- [ ] `/api/health` endpoint working
- [ ] Render automatically monitoring health

## 🔒 Security Checklist

### Environment Variables
- [ ] Never commit `.env` files
- [ ] Use Render's environment variable system
- [ ] Keep sensitive data secure

### MongoDB Security
- [ ] Use strong passwords
- [ ] Enable IP whitelisting
- [ ] Use connection string with authentication

### API Security
- [ ] Master key is for demo purposes only
- [ ] Consider JWT authentication for production

## 📈 Scaling Considerations

### Free Tier Limits
- 750 hours/month
- Sleeps after 15 minutes of inactivity
- Cold start takes ~30 seconds

### Upgrade Options
- Consider Render's paid plans for production
- Better performance and no sleep
- More resources and features

## 🆘 Support Resources

- **Render Documentation**: [render.com/docs](https://render.com/docs)
- **MongoDB Atlas**: [docs.atlas.mongodb.com](https://docs.atlas.mongodb.com)
- **Project Issues**: Check GitHub repository issues

## 🎯 Success Criteria

Your deployment is successful when:
- [ ] Application loads without errors
- [ ] Login functionality works
- [ ] API endpoints respond correctly
- [ ] PDF export feature works
- [ ] Admin dashboard accessible
- [ ] Student portal functional
- [ ] MongoDB connection stable
- [ ] Health check passes

## 📝 Notes

- Free tier has limitations (sleeps after inactivity)
- Cold start takes ~30 seconds
- Consider paid plans for production use
- Monitor logs regularly for issues
- Keep environment variables secure
