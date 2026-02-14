# Quick Security Setup - 2 Minutes

## ⚠️ IMPORTANT: Your credentials are now secured!

All sensitive information has been moved to environment variables. Follow these steps to run the application.

## Step 1: Create .env File

```bash
# Copy the template
copy .env.example .env
```

## Step 2: Edit .env File

Open `.env` in a text editor and fill in your actual credentials:

```bash
# Your actual database password
DATABASE_PASSWORD=Assassin#199320

# Your actual JWT secret
JWT_SECRET=your-secret-key-change-this-in-production-minimum-256-bits-for-supabase-math-tuition

# Your actual Supabase key
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Your actual email credentials
MAIL_USERNAME=anirudh.anantharamakrishnan@gmail.com
MAIL_PASSWORD=nzdlygifmkfochgk
```

## Step 3: Run Application

### Option A: Use the Script (Easiest)

**Windows (PowerShell):**
```powershell
.\load-env-and-run.ps1
```

**Windows (Command Prompt):**
```cmd
load-env-and-run.bat
```

### Option B: Manual

**Load environment variables:**
```cmd
for /f "tokens=*" %i in (.env) do set %i
```

**Run application:**
```cmd
mvn spring-boot:run
```

## That's It! 🎉

Your application is now running with secure credentials.

## Important Notes

### ✅ Do:
- Keep `.env` file on your local machine only
- Never commit `.env` to Git (it's already in `.gitignore`)
- Share `.env.example` with team members
- Update `.env` when credentials change

### ❌ Don't:
- Don't commit `.env` to Git
- Don't share `.env` via email or chat
- Don't hardcode credentials in code anymore

## Troubleshooting

### "Could not resolve placeholder" Error

This means environment variables aren't loaded.

**Solution:**
1. Make sure `.env` file exists
2. Run using the provided scripts
3. Or manually load variables before running

### Application Can't Connect to Database

**Check:**
1. `DATABASE_PASSWORD` in `.env` is correct
2. Environment variables are loaded
3. Database is accessible

## For Production

Don't use `.env` file in production. Instead:

1. Set environment variables on your server
2. Use cloud platform's secrets management
3. See `SECURITY-CREDENTIALS-GUIDE.md` for details

## Need More Help?

See detailed guide: `SECURITY-CREDENTIALS-GUIDE.md`
