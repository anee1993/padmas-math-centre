# Quick Setup: Groq API for AI Assignment Generator

## What You Need

A free Groq API key to enable AI-powered assignment generation.

## Step 1: Get Your Free API Key

1. Go to: https://console.groq.com/
2. Sign up with your email (it's free!)
3. Once logged in, click on "API Keys" in the left sidebar
4. Click "Create API Key"
5. Give it a name (e.g., "Padma Math Centre")
6. Copy the API key (starts with `gsk_...`)

**Important**: Copy the key immediately - you won't be able to see it again!

## Step 2: Add to Your .env File

Open the `.env` file in your project root and update this line:

```env
GROQ_API_KEY=gsk_your_actual_api_key_here
```

Replace `gsk_your_actual_api_key_here` with the key you copied.

## Step 3: Restart Your Backend

### Local Development:
```bash
# Stop the current backend (Ctrl+C)
# Then restart:
load-env-and-run.bat
```

### Railway (Production):
1. Go to your Railway dashboard
2. Click on your service
3. Go to "Variables" tab
4. Add new variable:
   - Name: `GROQ_API_KEY`
   - Value: paste your API key
5. Railway will automatically redeploy

## Step 4: Test It!

1. Login as teacher (padmakrishnan1992@gmail.com)
2. Go to "Assignments" tab
3. Click "🤖 Generate Assignment"
4. Fill in the form:
   - Class: 8
   - Topic: Algebra
   - Add some questions (e.g., 5 one-mark, 3 two-mark)
   - Complexity: Medium
5. Click "Generate Assignment"
6. Wait 5-10 seconds - you should see AI-generated questions!

## Free Tier Limits

- 30 requests per minute
- More than enough for a tuition center
- No credit card required

## Troubleshooting

**"Failed to generate assignment"**
- Check if API key is correct in `.env`
- Make sure you restarted the backend
- Check internet connection

**Still not working?**
- Check backend console for error messages
- Verify the API key is active in Groq Console
- Make sure there are no extra spaces in the `.env` file

## That's It!

You're all set! Your mother can now use AI to generate custom math assignments for her students. 🎉

For more details, see: `docs/AI-ASSIGNMENT-GENERATOR.md`
