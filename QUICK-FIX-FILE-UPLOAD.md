# Quick Fix: File Upload "Signature Verification Failed" Error

## Problem
Getting error: `Failed to upload file to Supabase: {"statusCode":"403","error":"Unauthorized","message":"signature verification failed"}`

## Root Cause
You're using the wrong Supabase API key. For server-side file uploads, you need the `service_role` key, not the `anon` key.

---

## Solution (3 Steps)

### Step 1: Get Your Service Role Key

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Click "Settings" (gear icon) in the left sidebar
4. Click "API" under Project Settings
5. Scroll down to "Project API keys"
6. Find the **service_role** key (NOT the anon key)
7. Click the eye icon to reveal it
8. Copy the entire key (starts with `eyJ...`)

**Important**: 
- The service_role key is SECRET - never share it or commit it to Git
- It has full database access, so keep it secure

---

### Step 2: Update Your Configuration

Open `src/main/resources/application.yml` and update the supabase section:

```yaml
supabase:
  url: https://bvtawdcbfkwbklhhovre.supabase.co
  key: YOUR_SERVICE_ROLE_KEY_HERE
```

Replace `YOUR_SERVICE_ROLE_KEY_HERE` with the service_role key you copied.

**Example** (your key will be different):
```yaml
supabase:
  url: https://bvtawdcbfkwbklhhovre.supabase.co
  key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2dGF3ZGNiZmt3YmtsaGhvdnJlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcwOTU1NTU1NSwiZXhwIjoyMDI1MTMxNTU1fQ.your-actual-signature-here
```

---

### Step 3: Restart Your Backend

1. Stop your Spring Boot application (if running)
2. Start it again:
   ```bash
   mvn spring-boot:run
   ```

---

## Verify It Works

1. Login as teacher
2. Go to "Create Assignment"
3. Try uploading a PDF file
4. Should now work without the signature error

---

## Alternative: Use Environment Variable (Recommended for Production)

Instead of hardcoding the key in `application.yml`, use an environment variable:

### In application.yml:
```yaml
supabase:
  url: https://bvtawdcbfkwbklhhovre.supabase.co
  key: ${SUPABASE_SERVICE_KEY}
```

### Set the environment variable:

**Windows Command Prompt:**
```cmd
set SUPABASE_SERVICE_KEY=your_service_role_key_here
mvn spring-boot:run
```

**Windows PowerShell:**
```powershell
$env:SUPABASE_SERVICE_KEY="your_service_role_key_here"
mvn spring-boot:run
```

**Linux/Mac:**
```bash
export SUPABASE_SERVICE_KEY=your_service_role_key_here
mvn spring-boot:run
```

---

## Why This Happens

Supabase has two main API keys:

1. **anon (public) key**: 
   - Used for client-side operations (frontend)
   - Respects Row Level Security (RLS) policies
   - Limited permissions

2. **service_role key**: 
   - Used for server-side operations (backend)
   - Bypasses RLS policies
   - Full database access
   - Required for Storage API uploads from backend

Since we're uploading files from the Spring Boot backend (not the React frontend), we need the service_role key.

---

## Still Not Working?

If you still get errors after following these steps:

1. **Check the bucket exists**:
   - Go to Supabase Dashboard → Storage
   - Verify you have a bucket named `assignments`
   - Make sure it's set as a public bucket

2. **Check the key is correct**:
   - The service_role key should be very long (200+ characters)
   - It should start with `eyJ`
   - Make sure you copied the entire key

3. **Check for typos**:
   - No extra spaces before or after the key
   - No line breaks in the middle of the key

4. **Restart the application**:
   - Changes to `application.yml` require a restart

---

**Date**: February 14, 2026
