# Fix Supabase Storage 403 Forbidden Error

## Problem
Students getting 403 Forbidden error when uploading assignment submissions.

## Root Cause
The Supabase storage bucket policies may not be configured correctly to allow authenticated users to upload files to the `submissions` folder.

---

## Solution: Update Storage Policies

### Step 1: Go to Supabase Dashboard

1. Visit: https://supabase.com/dashboard
2. Select your project: `bvtawdcbfkwbklhhovre`
3. Click "Storage" in the left sidebar
4. Click on the `assignments` bucket
5. Click the "Policies" tab

### Step 2: Check Existing Policies

You should see policies listed. If they're missing or incorrect, follow Step 3.

### Step 3: Create/Update Policies

Click "New Policy" and add these policies:

#### Policy 1: Allow Authenticated Upload to Submissions Folder

```sql
CREATE POLICY "Allow authenticated users to upload submissions"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'assignments' AND
  (storage.foldername(name))[1] = 'submissions'
);
```

#### Policy 2: Allow Authenticated Upload to Assignments Folder (Teachers)

```sql
CREATE POLICY "Allow authenticated users to upload assignments"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'assignments' AND
  (storage.foldername(name))[1] = 'assignments'
);
```

#### Policy 3: Allow Public Read Access

```sql
CREATE POLICY "Allow public read access"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'assignments');
```

#### Policy 4: Allow Users to Delete Their Own Files

```sql
CREATE POLICY "Allow users to delete own files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'assignments');
```

### Step 4: Alternative - Simple Policy (If Above Doesn't Work)

If the folder-specific policies don't work, use this simpler policy:

```sql
-- Delete all existing policies first, then add this one:
CREATE POLICY "Allow all authenticated operations"
ON storage.objects
FOR ALL
TO authenticated
USING (bucket_id = 'assignments')
WITH CHECK (bucket_id = 'assignments');
```

This allows all authenticated users to upload, read, update, and delete files in the `assignments` bucket.

---

## Step 5: Verify Service Role Key

Make sure your backend is using the correct Supabase service role key:

1. Go to Supabase Dashboard → Settings → API
2. Copy the **service_role** key (NOT the anon key)
3. Update your Railway environment variables:
   - Variable name: `SUPABASE_KEY`
   - Value: Your service_role key (starts with `eyJ...`)

**CRITICAL**: The current key in your `.env` is the `anon` key which respects RLS policies. You MUST use the `service_role` key for backend operations to bypass RLS and avoid 403 errors.

### How to identify which key you have:
- Decode the JWT at https://jwt.io
- Look for the `"role"` field:
  - `"role": "anon"` ❌ Wrong key - will cause 403 errors
  - `"role": "service_role"` ✅ Correct key - bypasses RLS

---

## Step 6: Test the Fix

1. Redeploy your backend on Railway (if you changed the service key)
2. Login as a student
3. Go to an assignment
4. Try uploading a PDF file
5. Submit the assignment

If you still get 403 error, check the browser console and Railway logs for more details.

---

## Additional Troubleshooting

### Check Bucket Configuration

1. In Supabase Dashboard → Storage → assignments bucket
2. Click the settings icon
3. Verify:
   - ✅ Public bucket is enabled
   - File size limit: 10 MB or higher
   - Allowed MIME types: Include `application/pdf`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`

### Check Backend Logs

In Railway dashboard:
1. Go to your backend service
2. Click "Deployments"
3. Click on the latest deployment
4. Check logs for any Supabase-related errors

### Common Error Messages

- **"signature verification failed"**: Wrong API key (use service_role, not anon)
- **"Bucket not found"**: Bucket name mismatch (should be "assignments")
- **"Policy violation"**: Storage policies not configured correctly
- **"File too large"**: File exceeds 10MB limit

---

## Quick Fix Commands

If you have Supabase CLI installed, you can run these commands:

```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref bvtawdcbfkwbklhhovre

# Apply policies (create a file policies.sql with the policies above)
supabase db push
```

---

**Last Updated**: February 16, 2026
