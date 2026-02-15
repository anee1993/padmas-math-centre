# Quick Vercel Frontend Deployment Guide

## Your Backend URL
```
https://padma-math-tutions.up.railway.app
```

## Step-by-Step Deployment

### Step 1: Sign Up for Vercel

1. Go to https://vercel.com
2. Click "Sign Up"
3. Choose "Continue with GitHub"
4. Authorize Vercel to access your GitHub account

### Step 2: Deploy Frontend

1. Click "Add New" → "Project"
2. Find and import: `anee1993/padmas-math-centre`
3. Configure project settings:
   - **Root Directory**: `frontend` (IMPORTANT!)
   - **Framework Preset**: Vite (auto-detected)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### Step 3: Add Environment Variable

Before clicking Deploy, add this environment variable:

```
Name: VITE_API_URL
Value: https://padma-math-tutions.up.railway.app/api
```

Note: Include `/api` at the end!

### Step 4: Deploy

1. Click "Deploy"
2. Wait 2-3 minutes for build to complete
3. You'll get a URL like: `https://padmas-math-centre.vercel.app`

### Step 5: Test Your Frontend

1. Open your Vercel URL
2. Try logging in as teacher:
   - Email: teacher@mathtuition.com
   - Password: Teacher@123
3. Test all features

### Step 6: Update Backend CORS

Once you have your Vercel URL, we need to update the backend to allow requests from it.

I'll help you with this step once you share your Vercel URL.

## Troubleshooting

### Build Fails
- Check Vercel build logs
- Ensure Root Directory is set to `frontend`
- Verify all dependencies are in package.json

### API Calls Fail
- Check VITE_API_URL is correct
- Ensure it ends with `/api`
- Verify backend is running on Railway

### CORS Errors
- We'll fix this in Step 6 after deployment

## Automatic Deployments

After initial deployment, Vercel automatically redeploys when you:
- Push to GitHub main branch
- Update environment variables

## Next Steps

1. Deploy to Vercel
2. Share your Vercel URL
3. I'll update CORS configuration
4. Push CORS update to GitHub
5. Railway auto-deploys the update
6. Everything works! 🎉
