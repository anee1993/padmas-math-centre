# Learning Materials Storage Setup Guide

## Issue
When students click "View/Download" on learning materials, they see:
```
{"statusCode":"404","error":"Bucket not found","message":"Bucket not found"}
```

## Root Cause
The learning materials are stored in the same "assignments" bucket that you already have, but there might be:
1. The bucket doesn't exist in Supabase Storage
2. The bucket exists but RLS policies are blocking access
3. The bucket name in the backend configuration doesn't match Supabase

## Solution

### Step 1: Verify Bucket Exists
1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **Storage** in the left sidebar
4. Check if you have a bucket named **"assignments"**

### Step 2: If Bucket Doesn't Exist - Create It
1. Click **"New bucket"**
2. Name: `assignments`
3. **Public bucket**: Toggle ON (important!)
4. Click **"Create bucket"**

### Step 3: Configure Storage Policies

The bucket needs proper RLS (Row Level Security) policies to allow:
- Teachers to upload files
- Students to view/download files

#### Option A: Make Bucket Fully Public (Simplest)
1. Go to Storage → assignments bucket
2. Click on **"Policies"** tab
3. Click **"New Policy"**
4. Select **"For full customization"**
5. Create this policy:

**Policy Name**: Public Access for All Operations
**Policy Definition**:
```sql
true
```
**Allowed Operations**: SELECT, INSERT, UPDATE, DELETE

This allows anyone with the link to access files.

#### Option B: Authenticated Users Only (More Secure)
Create separate policies:

**Policy 1: Allow Authenticated Users to Read**
- Policy Name: `Allow authenticated users to read`
- Allowed Operations: SELECT
- Policy Definition:
```sql
(auth.role() = 'authenticated')
```

**Policy 2: Allow Authenticated Users to Upload**
- Policy Name: `Allow authenticated users to upload`
- Allowed Operations: INSERT
- Policy Definition:
```sql
(auth.role() = 'authenticated')
```

**Policy 3: Allow Authenticated Users to Delete**
- Policy Name: `Allow authenticated users to delete`
- Allowed Operations: DELETE
- Policy Definition:
```sql
(auth.role() = 'authenticated')
```

### Step 4: Verify Backend Configuration

Check your `application.yml` or `application.properties`:

```yaml
supabase:
  url: https://bvtawdcbfkwbklhhovre.supabase.co
  key: YOUR_SERVICE_ROLE_KEY_HERE  # Must be service_role key, not anon key
```

**Important**: You MUST use the `service_role` key (not the `anon` key) for file uploads to work properly.

To find your service_role key:
1. Go to Supabase Dashboard
2. Project Settings → API
3. Copy the `service_role` key (under "Project API keys")
4. Update your backend configuration

### Step 5: Test the Setup

1. **Test Upload (Teacher)**:
   - Login as teacher
   - Go to Learning Materials
   - Try uploading a PDF file
   - Should succeed without errors

2. **Test Download (Student)**:
   - Login as student
   - Go to Learning Materials
   - Click "View/Download" on a material
   - File should open/download successfully

### Step 6: Verify File Structure in Supabase

After uploading, check in Supabase Storage:
```
assignments/
├── materials/
│   ├── 20240214_143022_abc123.pdf
│   └── 20240214_143045_def456.docx
├── assignments/
│   └── (teacher assignment files)
└── submissions/
    └── (student submission files)
```

## Common Issues and Fixes

### Issue 1: "Bucket not found"
**Fix**: Create the "assignments" bucket in Supabase Storage (see Step 2)

### Issue 2: "Unauthorized" or "403 Forbidden"
**Fix**: 
- Check RLS policies (see Step 3)
- Verify you're using `service_role` key in backend (see Step 4)

### Issue 3: Files upload but can't be accessed
**Fix**: 
- Make sure bucket is set to **Public**
- Check RLS policies allow SELECT operations

### Issue 4: "Invalid Compact JWS" or "signature verification failed"
**Fix**: 
- You're using the wrong API key
- Use `service_role` key, not `anon` key
- Copy the key exactly without extra spaces

## Quick Fix Command

If you want to quickly test if it's a policy issue, you can temporarily disable RLS:

1. Go to Storage → assignments bucket → Policies
2. Click the three dots on any policy
3. Select "Disable RLS" (for testing only!)
4. Try uploading/downloading again
5. **Remember to re-enable RLS after testing!**

## File URL Format

Correct URL format for files:
```
https://bvtawdcbfkwbklhhovre.supabase.co/storage/v1/object/public/assignments/materials/20240214_143022_abc123.pdf
```

If your URLs don't match this format, there's a configuration issue in the backend.

## Need Help?

If you're still having issues:
1. Check the browser console for detailed error messages
2. Check the backend logs for upload errors
3. Verify the exact URL being generated for files
4. Make sure the bucket name in code matches Supabase exactly (case-sensitive)
