# Setup Supabase Storage Policies - Quick Guide

## Problem
Error: `new row violates row-level security policy`

This means your storage bucket has Row Level Security (RLS) enabled but no policies to allow uploads.

---

## Solution: Add Storage Policies

### Option 1: Disable RLS (Quickest - For Development)

This is the fastest way to get file uploads working:

1. Go to Supabase Dashboard → **Storage**
2. Click on your `assignments` bucket
3. Click on **Policies** tab
4. Look for "Enable RLS" toggle at the top
5. **Turn OFF** the RLS toggle

✅ This will allow all uploads immediately (good for development/testing)

⚠️ For production, you should use Option 2 instead for better security.

---

### Option 2: Add Policies (Recommended - For Production)

If you want to keep RLS enabled for security, add these policies:

#### Step 1: Go to Storage Policies

1. Supabase Dashboard → **Storage**
2. Click on your `assignments` bucket
3. Click on **Policies** tab
4. Click **"New Policy"** button

#### Step 2: Create "Allow All Uploads" Policy

1. Click **"New Policy"**
2. Select **"For full customization"** (or "Create a policy from scratch")
3. Enter the following:

**Policy Name**: `Allow all uploads`

**Allowed operation**: Check **INSERT**

**Policy definition**: 
```sql
true
```

Or if you want to be more specific:
```sql
bucket_id = 'assignments'
```

4. Click **"Review"** then **"Save policy"**

#### Step 3: Create "Allow All Reads" Policy

1. Click **"New Policy"** again
2. Select **"For full customization"**
3. Enter the following:

**Policy Name**: `Allow all reads`

**Allowed operation**: Check **SELECT**

**Policy definition**: 
```sql
true
```

Or:
```sql
bucket_id = 'assignments'
```

4. Click **"Review"** then **"Save policy"**

#### Step 4: Create "Allow All Deletes" Policy (Optional)

1. Click **"New Policy"** again
2. Select **"For full customization"**
3. Enter the following:

**Policy Name**: `Allow all deletes`

**Allowed operation**: Check **DELETE**

**Policy definition**: 
```sql
true
```

Or:
```sql
bucket_id = 'assignments'
```

4. Click **"Review"** then **"Save policy"**

---

## Alternative: Use SQL Editor

If you prefer SQL, you can run these commands:

1. Go to Supabase Dashboard → **SQL Editor**
2. Click **"New query"**
3. Paste this SQL:

```sql
-- Allow anyone to upload files to assignments bucket
CREATE POLICY "Allow all uploads"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'assignments');

-- Allow anyone to read files from assignments bucket
CREATE POLICY "Allow all reads"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'assignments');

-- Allow anyone to delete files from assignments bucket
CREATE POLICY "Allow all deletes"
ON storage.objects
FOR DELETE
TO public
USING (bucket_id = 'assignments');
```

4. Click **"Run"**

---

## Verify It Works

After setting up policies:

1. Go back to your application
2. Try uploading a file again
3. Should work now! ✅

---

## Understanding the Policies

### What we just did:

- **INSERT policy**: Allows uploading new files
- **SELECT policy**: Allows reading/downloading files
- **DELETE policy**: Allows deleting files

### Why `true` or `bucket_id = 'assignments'`?

- `true` = Allow everyone (simplest for development)
- `bucket_id = 'assignments'` = Only allow for this specific bucket (more specific)

Both work fine for this use case since:
- Your backend validates users before allowing uploads
- File names are randomized (no security risk)
- The bucket is meant to be public for students/teachers to access files

---

## Security Note

Since we're using the `service_role` key from the backend:
- The backend bypasses RLS anyway
- But having these policies is good practice
- It allows direct access from frontend if needed later
- It makes the bucket truly "public" for reading files

---

## Troubleshooting

### Still getting RLS error?

1. **Check the bucket name**: Make sure it's exactly `assignments` (lowercase)
2. **Refresh the page**: Sometimes Supabase needs a refresh after adding policies
3. **Check policy is enabled**: In Policies tab, make sure the toggle next to your policy is ON (green)
4. **Try disabling RLS**: As a test, turn off RLS completely to verify that's the issue

### Policy not showing up?

- Wait a few seconds and refresh the page
- Check the SQL Editor for any error messages
- Make sure you clicked "Save policy" or "Run" for SQL

---

## Quick Test

To verify your policies are working:

1. Go to Storage → assignments bucket
2. Try uploading a file manually through the Supabase UI
3. If it works, your policies are correct!
4. If it fails, RLS is still blocking

---

**Recommendation**: For development, just disable RLS (Option 1). You can always enable it later with proper policies for production.

**Date**: February 14, 2026
