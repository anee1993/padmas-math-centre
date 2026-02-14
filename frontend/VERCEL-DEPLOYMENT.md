# Deploying Frontend to Vercel

## Prerequisites
- GitHub account
- Vercel account (sign up at https://vercel.com)
- Backend API deployed and accessible via HTTPS

---

## Step 1: Prepare the Frontend

### 1.1 Move Frontend to Separate Repository

Since the frontend is currently inside the `classroom` project, you need to move it:

**Option A: Manual Move**
1. Copy the entire `frontend` folder to a new location
2. Initialize a new Git repository:
   ```bash
   cd path/to/frontend
   git init
   git add .
   git commit -m "Initial commit"
   ```
3. Create a new repository on GitHub
4. Push to GitHub:
   ```bash
   git remote add origin https://github.com/yourusername/classroom-frontend.git
   git branch -M main
   git push -u origin main
   ```

**Option B: Using Git Subtree (if already in Git)**
```bash
# From the classroom project root
git subtree split --prefix=frontend -b frontend-only
cd ..
mkdir classroom-frontend
cd classroom-frontend
git init
git pull ../classroom frontend-only
git remote add origin https://github.com/yourusername/classroom-frontend.git
git push -u origin main
```

### 1.2 Create Environment File

Create a `.env.production` file in the frontend folder:

```env
VITE_API_URL=https://your-backend-api.com/api
```

Replace `https://your-backend-api.com/api` with your actual backend URL.

---

## Step 2: Deploy to Vercel

### 2.1 Via Vercel Dashboard (Recommended)

1. Go to https://vercel.com/dashboard
2. Click "Add New" → "Project"
3. Import your GitHub repository (classroom-frontend)
4. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (or leave empty if frontend is at root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. Add Environment Variables:
   - Click "Environment Variables"
   - Add: `VITE_API_URL` = `https://your-backend-api.com/api`

6. Click "Deploy"

### 2.2 Via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to frontend folder
cd frontend

# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? classroom-frontend
# - Directory? ./
# - Override settings? No

# For production deployment
vercel --prod
```

---

## Step 3: Configure Backend CORS

Your backend needs to allow requests from the Vercel domain.

Update `src/main/java/org/student/config/CorsConfig.java`:

```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins(
                    "http://localhost:5173",
                    "http://localhost:3000",
                    "https://your-vercel-app.vercel.app",  // Add your Vercel URL
                    "https://classroom-frontend.vercel.app" // Add custom domain if any
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
```

---

## Step 4: Update Environment Variables

After deployment, you can update environment variables:

1. Go to Vercel Dashboard
2. Select your project
3. Go to "Settings" → "Environment Variables"
4. Update `VITE_API_URL` if needed
5. Redeploy (Vercel will auto-redeploy on changes)

---

## Step 5: Custom Domain (Optional)

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain (e.g., `classroom.yourdomain.com`)
3. Follow DNS configuration instructions
4. Update CORS configuration in backend with new domain

---

## Project Structure for Deployment

Your frontend repository should look like this:

```
classroom-frontend/
├── .env.example
├── .env.production
├── .gitignore
├── index.html
├── package.json
├── package-lock.json
├── vercel.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── eslint.config.js
├── public/
│   └── vite.svg
├── src/
│   ├── api/
│   │   └── axios.js
│   ├── assets/
│   ├── components/
│   ├── context/
│   ├── pages/
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── VERCEL-DEPLOYMENT.md
└── README.md
```

---

## Environment Variables Reference

### Development (.env.local)
```env
VITE_API_URL=http://localhost:8080/api
```

### Production (.env.production)
```env
VITE_API_URL=https://your-backend-api.com/api
```

### Vercel Dashboard
- `VITE_API_URL`: Your production backend URL

---

## Troubleshooting

### Issue: API calls failing with CORS error

**Solution**: 
1. Check backend CORS configuration includes Vercel URL
2. Ensure backend is using HTTPS (Vercel requires HTTPS for API calls)
3. Verify `VITE_API_URL` environment variable is set correctly

### Issue: Environment variables not working

**Solution**:
1. Ensure variable name starts with `VITE_`
2. Redeploy after adding/changing environment variables
3. Check Vercel deployment logs for errors

### Issue: 404 on page refresh

**Solution**: 
The `vercel.json` file handles this by routing all requests to `index.html`. Make sure it's included in your repository.

### Issue: Build fails on Vercel

**Solution**:
1. Check build logs in Vercel dashboard
2. Ensure all dependencies are in `package.json`
3. Test build locally: `npm run build`
4. Check Node version compatibility

---

## Automatic Deployments

Vercel automatically deploys:
- **Production**: When you push to `main` branch
- **Preview**: When you create a pull request

To disable auto-deploy:
1. Go to Project Settings → Git
2. Configure deployment branches

---

## Monitoring

### View Deployment Logs
1. Vercel Dashboard → Your Project → Deployments
2. Click on any deployment to see logs

### View Runtime Logs
1. Vercel Dashboard → Your Project → Logs
2. Filter by time range and log level

---

## Backend Deployment Recommendations

For production, deploy your Spring Boot backend to:
- **Railway**: https://railway.app
- **Render**: https://render.com
- **Heroku**: https://heroku.com
- **AWS Elastic Beanstalk**
- **Google Cloud Run**
- **Azure App Service**

Ensure your backend:
1. Uses HTTPS
2. Has proper CORS configuration
3. Has environment variables for database and secrets
4. Has health check endpoint

---

## Security Checklist

- [ ] Backend uses HTTPS
- [ ] CORS properly configured
- [ ] API keys not in frontend code
- [ ] JWT tokens stored securely (localStorage)
- [ ] Environment variables used for API URL
- [ ] Supabase service_role key only in backend
- [ ] Rate limiting enabled on backend
- [ ] Input validation on both frontend and backend

---

## Performance Optimization

### Enable Compression
Vercel automatically enables gzip/brotli compression.

### Image Optimization
Use Vercel's Image Optimization:
```jsx
import Image from 'next/image' // If using Next.js
```

### Code Splitting
Vite automatically handles code splitting. You can also use:
```jsx
const LazyComponent = lazy(() => import('./Component'));
```

### Caching
Vercel automatically caches static assets. Configure in `vercel.json`:
```json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

---

## Cost

Vercel Free Tier includes:
- Unlimited deployments
- 100 GB bandwidth per month
- Automatic HTTPS
- Preview deployments
- Analytics (basic)

For production apps with high traffic, consider Vercel Pro ($20/month).

---

## Support

- Vercel Documentation: https://vercel.com/docs
- Vercel Community: https://github.com/vercel/vercel/discussions
- Vite Documentation: https://vitejs.dev

---

**Last Updated**: February 14, 2026
