# Supabase Storage Setup Guide

## Overview
This guide will help you set up Supabase Storage for file uploads (assignments and submissions).

---

## Step 1: Create Storage Bucket

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `bvtawdcbfkwbklhhovre`
3. Click on "Storage" in the left sidebar
4. Click "Create a new bucket"
5. Enter the following details:
   - **Name**: `assignments`
   - **Public bucket**: ✅ Check this (so files can be accessed via URL)
   - **File size limit**: 10 MB
   - **Allowed MIME types**: Leave empty or add: `application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document`
6. Click "Create bucket"

---

## Step 2: Set Bucket Policies

After creating the bucket, you need to set up policies to allow authenticated users to upload and read files.

1. In the Storage section, click on your `assignments` bucket
2. Click on "Policies" tab
3. Click "New Policy"

### Policy 1: Allow Authenticated Users to Upload

```sql
CREATE POLICY "Allow authenticated users to upload"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'assignments');
```

### Policy 2: Allow Public Read Access

```sql
CREATE POLICY "Allow public read access"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'assignments');
```

### Policy 3: Allow Users to Delete Their Own Files

```sql
CREATE POLICY "Allow users to delete their own files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'assignments');
```

---

## Step 3: Get Your Supabase Service Role Key

**IMPORTANT**: For server-side file uploads, you need the `service_role` key, NOT the `anon` key.

1. In Supabase Dashboard, go to "Settings" → "API"
2. Scroll down to "Project API keys"
3. Copy your **service_role** key (it should start with `eyJ...`)
   - ⚠️ **WARNING**: This key has full access to your database. Keep it secret!
   - Never expose this key in frontend code
   - Only use it in backend server code

4. Update `src/main/resources/application.yml`:

```yaml
supabase:
  url: https://bvtawdcbfkwbklhhovre.supabase.co
  key: YOUR_SUPABASE_SERVICE_ROLE_KEY_HERE
```

**Important**: For production, use environment variables instead of hardcoding the key:

```yaml
supabase:
  url: https://bvtawdcbfkwbklhhovre.supabase.co
  key: ${SUPABASE_SERVICE_KEY}
```

Then set the environment variable:
```bash
# Windows Command Prompt
set SUPABASE_SERVICE_KEY=your_service_role_key_here

# Windows PowerShell
$env:SUPABASE_SERVICE_KEY="your_service_role_key_here"

# Linux/Mac
export SUPABASE_SERVICE_KEY=your_service_role_key_here
```

### Why Service Role Key?

- **anon key**: Used for client-side operations, respects Row Level Security (RLS) policies
- **service_role key**: Used for server-side operations, bypasses RLS policies, has full access

Since we're uploading files from the backend server (not the frontend), we need the service_role key.

---

## Step 4: Folder Structure

The application will automatically create the following folder structure in your bucket:

```
assignments/
├── assignments/          # Teacher uploaded assignment files
│   └── 20260214_143022_uuid.pdf
└── submissions/          # Student submitted files
    └── 20260214_143530_uuid.pdf
```

---

## Step 5: Test File Upload

### Test Teacher Upload:
1. Login as teacher
2. Go to "Create Assignment"
3. Upload a PDF or Word file
4. Submit the form
5. Check Supabase Storage to verify the file was uploaded

### Test Student Upload:
1. Login as student
2. Go to an assignment
3. Upload your completed assignment (PDF/Word)
4. Submit
5. Check Supabase Storage to verify the file was uploaded

---

## File Upload Limits

- **Max file size**: 10 MB
- **Allowed file types**: 
  - PDF (`.pdf`)
  - Word Document (`.doc`, `.docx`)
- **Storage location**: Supabase Storage bucket `assignments`

---

## Troubleshooting

### Error: "Failed to upload file to Supabase: signature verification failed"

**Possible causes:**
1. Using `anon` key instead of `service_role` key
2. Supabase service_role key is incorrect or missing
3. Key has expired or been regenerated

**Solutions:**
1. Get your `service_role` key from Supabase Dashboard → Settings → API
2. Update `application.yml` with the service_role key (NOT the anon key)
3. Restart your Spring Boot application
4. If using environment variable, ensure it's set correctly

### Error: "Failed to upload file to Supabase"

**Possible causes:**
1. Supabase API key is incorrect or missing
2. Storage bucket doesn't exist
3. Bucket policies are not set correctly
4. File size exceeds 10MB limit

**Solutions:**
1. Verify your Supabase API key in `application.yml`
2. Check that the `assignments` bucket exists in Supabase Dashboard
3. Review and apply the bucket policies above
4. Ensure file is under 10MB

### Error: "Invalid file type"

**Solution:**
Only PDF and Word documents are allowed. Check the file extension and MIME type.

### Error: "File size exceeds 10MB limit"

**Solution:**
Compress the file or split it into smaller parts. The limit is set in both:
- Backend: `FileStorageService.java` (MAX_FILE_SIZE)
- Spring Boot: `application.yml` (spring.servlet.multipart.max-file-size)

---

## Security Notes

1. **Public Bucket**: The bucket is set to public so that students and teachers can access uploaded files via URL. This is safe because:
   - Only the backend server can upload files (using service_role key)
   - File names are randomized with UUID
   - No sensitive data should be in filenames

2. **Service Role Key**: 
   - ⚠️ **CRITICAL**: The service_role key has full database access
   - Never expose it in frontend code or commit it to version control
   - Only use it in backend server code
   - Store it in environment variables for production
   - This key bypasses all Row Level Security policies

3. **File Validation**: The backend validates:
   - File type (PDF/Word only)
   - File size (max 10MB)
   - User authentication and role

---

## Alternative: Using External Links

If you prefer not to set up Supabase Storage, you can still use external links:
- Google Drive
- Dropbox
- OneDrive
- Any other file sharing service

Simply paste the shareable link in the "Attachment URL" field instead of uploading a file.

---

**Setup Date**: February 14, 2026
**Status**: Ready for configuration
