# Railway Deployment Guide - Padma's Math Centre

## Overview
This guide will help you deploy your Spring Boot backend to Railway.app for $5/month.

## Prerequisites
- GitHub account (you already have this)
- Railway account (free to create)
- Your GitHub repository pushed (✅ done)

## Step-by-Step Deployment

### Step 1: Sign Up for Railway

1. Go to https://railway.app
2. Click "Login" → "Login with GitHub"
3. Authorize Railway to access your GitHub account
4. You'll get $5 free credit to start!

### Step 2: Create New Project

1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your repository: `anee1993/padmas-math-centre`
4. Railway will detect it's a Java/Maven project

### Step 3: Configure Environment Variables

Click on your service → "Variables" tab → Add all these:

**IMPORTANT:** Use your actual values from your local `.env` file!

```bash
# Database Configuration
DATABASE_URL=jdbc:postgresql://your-supabase-url:5432/postgres
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your-database-password

# JWT Configuration
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRATION=86400000

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-service-role-key

# Email Configuration
MAIL_ENABLED=true
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_FROM=noreply@padmasmathcentre.com
MAIL_FROM_NAME=Padma's Math Centre

# Server Configuration
SERVER_PORT=8080
SHOW_SQL=false
```

**Copy values from your local `.env` file!**

### Step 4: Deploy

1. Railway will automatically start building
2. Wait 3-5 minutes for the build to complete
3. Once deployed, you'll see a green "Active" status

### Step 5: Get Your Public URL

1. Click on your service
2. Go to "Settings" tab
3. Scroll to "Networking"
4. Click "Generate Domain"
5. You'll get a URL like: `https://padmas-math-centre-production.up.railway.app`

### Step 6: Test Your Backend

Open your browser and test:
```
https://your-app.railway.app/api/auth/login
```

You should see a response (even if it's an error, it means the backend is running).

### Step 7: Update Frontend

Update your frontend `.env` file:
```bash
VITE_API_URL=https://your-app.railway.app/api
```

Then redeploy your frontend on Vercel.

### Step 8: Update CORS Configuration

Your backend needs to allow requests from your Vercel frontend.

The CORS configuration in `CorsConfig.java` should already handle this, but verify the Vercel URL is allowed.

## Automatic Deployments

Railway automatically deploys when you push to GitHub:

```bash
# Make changes to your code
git add .
git commit -m "Update feature"
git push origin main

# Railway automatically detects and deploys!
```

## Monitoring & Logs

### View Logs
1. Click on your service
2. Go to "Deployments" tab
3. Click on latest deployment
4. View real-time logs

### Check Metrics
1. Click on your service
2. Go to "Metrics" tab
3. See CPU, Memory, Network usage

## Cost Management

### Free Credits
- You get $5 free credit
- Lasts about 1 month for your app

### Paid Plan
- After free credit: $5/month
- 500 execution hours
- Perfect for your use case

### Monitor Usage
1. Click your profile (top right)
2. Go to "Usage"
3. See current usage and costs

## Troubleshooting

### Build Failed

**Check logs:**
1. Go to "Deployments"
2. Click failed deployment
3. Read error messages

**Common issues:**
- Missing environment variables
- Java version mismatch
- Maven build errors

**Solution:**
```bash
# Test build locally first
mvn clean package
```

### App Crashes on Startup

**Check logs for:**
- Database connection errors
- Missing environment variables
- Port binding issues

**Solution:**
- Verify all environment variables are set
- Check DATABASE_PASSWORD is correct
- Ensure SERVER_PORT=8080

### Can't Connect to Database

**Verify:**
- DATABASE_URL is correct
- DATABASE_PASSWORD is correct
- Supabase allows connections from Railway IPs

**Solution:**
- Supabase allows all connections by default
- Check Supabase dashboard for connection issues

### CORS Errors

**Symptoms:**
- Frontend can't connect to backend
- "CORS policy" errors in browser console

**Solution:**
Update `CorsConfig.java` to include your Vercel URL:
```java
configuration.setAllowedOrigins(Arrays.asList(
    "http://localhost:5173",
    "https://your-frontend.vercel.app"
));
```

## Custom Domain (Optional)

### Add Your Own Domain

1. Buy a domain (e.g., padmasmathcentre.com)
2. In Railway: Settings → Networking → Custom Domain
3. Add your domain
4. Update DNS records as shown
5. Wait for SSL certificate (automatic)

**Cost:** Domain registration only (~$10-15/year)

## Scaling

### If You Need More Resources

Railway offers different plans:
- **Hobby:** $5/month (current)
- **Pro:** $20/month (more resources)
- **Team:** Custom pricing

For 50-100 students, Hobby plan is perfect!

## Backup Strategy

### Database Backups
- Supabase handles this automatically
- Daily backups included in free tier

### Code Backups
- Already on GitHub ✅
- Railway keeps deployment history

## Security Checklist

- [x] Environment variables set (not hardcoded)
- [x] HTTPS enabled (automatic on Railway)
- [x] Database password secure
- [x] JWT secret strong
- [x] CORS configured properly
- [ ] Custom domain with SSL (optional)
- [ ] Rate limiting (add later if needed)

## Performance Tips

### Optimize for Railway

1. **Use Production Profile:**
   Add to environment variables:
   ```
   SPRING_PROFILES_ACTIVE=prod
   ```

2. **Reduce Logs:**
   ```
   SHOW_SQL=false
   ```

3. **Connection Pooling:**
   Already configured in `application.yml` ✅

## Cost Optimization

### Keep Costs Low

1. **Monitor Usage:**
   - Check Railway dashboard weekly
   - Set up usage alerts

2. **Optimize Resources:**
   - Your app is already efficient
   - No changes needed for 50-100 students

3. **Scale When Needed:**
   - Start with Hobby plan
   - Upgrade only if needed

## Support & Help

### Railway Support
- Docs: https://docs.railway.app
- Discord: https://discord.gg/railway
- Status: https://status.railway.app

### Common Commands

```bash
# View logs (if Railway CLI installed)
railway logs

# Link to project
railway link

# Run locally with Railway env vars
railway run mvn spring-boot:run
```

## Next Steps After Deployment

1. ✅ Backend deployed on Railway
2. ✅ Frontend deployed on Vercel
3. ✅ Database on Supabase
4. ✅ Storage on Supabase

**Your app is now live!** 🎉

### Test Everything

1. Register a student
2. Login as teacher
3. Approve student
4. Create assignment
5. Upload learning material
6. Test password reset
7. Test file uploads

## Maintenance

### Regular Tasks

**Weekly:**
- Check Railway usage
- Review logs for errors
- Monitor Supabase storage

**Monthly:**
- Review costs
- Update dependencies (if needed)
- Check for security updates

**As Needed:**
- Add new features
- Fix bugs
- Scale resources

## Quick Reference

### Important URLs
- Railway Dashboard: https://railway.app/dashboard
- Logs: Click service → Deployments → Latest
- Metrics: Click service → Metrics

### Environment Variables
All stored in Railway → Variables tab
**Copy from your local `.env` file!**

### Deployment
Automatic on `git push origin main`

### Rollback
Railway → Deployments → Click previous deployment → Redeploy

## Summary

✅ **Setup Time:** 10-15 minutes
✅ **Cost:** $5/month
✅ **Automatic Deployments:** Yes
✅ **SSL/HTTPS:** Automatic
✅ **Monitoring:** Built-in
✅ **Logs:** Real-time
✅ **Scaling:** Easy

Your backend is now production-ready on Railway! 🚀

## Need Help?

If you encounter any issues during deployment, check:
1. Railway logs (most helpful)
2. This guide's troubleshooting section
3. Railway documentation

Good luck with your deployment! 🎓
