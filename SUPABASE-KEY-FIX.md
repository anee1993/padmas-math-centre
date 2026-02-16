# Fix: 403 Unauthorized Error - Wrong Supabase Key

## Problem
Getting error when uploading files:
```
Failed to upload file to Supabase: {"statusCode":"403","error":"Unauthorized","message":"new row violates row-level security policy"}
```

## Root Cause
You're using the **anon** key instead of the **service_role** key in your backend.

- **anon key**: Respects Row-Level Security (RLS) policies → causes 403 errors
- **service_role key**: Bypasses RLS policies → allows all operations

## Solution

### Step 1: Get Your Service Role Key

1. Go to: https://supabase.com/dashboard
2. Select project: `bvtawdcbfkwbklhhovre`
3. Navigate to: **Settings** → **API**
4. Scroll to **Project API keys**
5. Copy the **service_role** key (NOT the anon key)

### Step 2: Update Local Environment

Edit your `.env` file:

```env
# Replace this line:
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2dGF3ZGNiZmt3YmtsaGhvdnJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwNjc0ODMsImV4cCI6MjA4NjY0MzQ4M30.lE3dgo1YeesgJsGiS7AHKsuiNZyNfdjopW2cEQAv-h0

# With your service_role key:
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2dGF3ZGNiZmt3YmtsaGhvdnJlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTA2NzQ4MywiZXhwIjoyMDg2NjQzNDgzfQ.YOUR_SERVICE_ROLE_KEY_HERE
```

### Step 3: Update Railway (Production)

1. Go to Railway dashboard: https://railway.app
2. Select your backend service
3. Click **Variables** tab
4. Find `SUPABASE_KEY`
5. Click **Edit** and paste your service_role key
6. Click **Save**
7. Railway will automatically redeploy

### Step 4: Restart Your Application

**Local:**
```bash
# Stop your Spring Boot app (Ctrl+C)
# Restart it
mvn spring-boot:run
```

**Railway:**
- Automatic redeploy after updating environment variable

---

## How to Verify Which Key You Have

You can decode your JWT token at https://jwt.io to check:

1. Paste your `SUPABASE_KEY` value
2. Look at the decoded payload
3. Check the `"role"` field:

### Anon Key (WRONG - causes 403):
```json
{
  "iss": "supabase",
  "ref": "bvtawdcbfkwbklhhovre",
  "role": "anon",  ← This is the problem!
  "iat": 1771067483,
  "exp": 2086643483
}
```

### Service Role Key (CORRECT):
```json
{
  "iss": "supabase",
  "ref": "bvtawdcbfkwbklhhovre",
  "role": "service_role",  ← This is what you need!
  "iat": 1771067483,
  "exp": 2086643483
}
```

---

## Security Notes

⚠️ **CRITICAL**: The service_role key has FULL access to your database and storage.

### DO:
- ✅ Use it ONLY in backend server code
- ✅ Store it in environment variables
- ✅ Keep it in `.gitignore` (never commit to Git)
- ✅ Treat it like a database password

### DON'T:
- ❌ Never expose it in frontend code
- ❌ Never commit it to version control
- ❌ Never share it publicly
- ❌ Never use it in client-side JavaScript

---

## Why This Happens

The backend needs to upload files on behalf of authenticated users. When using the anon key:

1. Backend tries to upload file to Supabase Storage
2. Supabase checks Row-Level Security (RLS) policies
3. RLS policies require specific user authentication
4. Backend doesn't have user context → 403 Forbidden

When using the service_role key:

1. Backend tries to upload file to Supabase Storage
2. Supabase sees service_role key → bypasses ALL RLS policies
3. Upload succeeds ✅

---

## After Fixing

Once you update the key:

1. ✅ Teacher file uploads will work
2. ✅ Student assignment submissions will work
3. ✅ Late assignment submissions will work
4. ✅ No more 403 errors

---

**Date**: February 16, 2026  
**Status**: Awaiting service_role key update
