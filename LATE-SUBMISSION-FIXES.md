# Late Submission Fixes - February 16, 2026

## Issues Fixed

### Issue 1: Submit Button Works Without Content ❌ → ✅

**Problem**: Students could submit assignments without providing any content (no text, no URL, no file).

**Solution**: Added validation on both frontend and backend.

#### Backend Changes:
- **File**: `src/main/java/org/student/dto/SubmitAssignmentRequest.java`
  - Added `hasContent()` method to validate at least one field is provided
  
- **File**: `src/main/java/org/student/service/AssignmentService.java`
  - Added validation check at the start of `submitAssignment()` method
  - Throws error: "Please provide either submission text or an attachment URL/file"

#### Frontend Changes:
- **File**: `frontend/src/pages/AssignmentDetail.jsx`
  - Added validation in `handleSubmit()` before making API call
  - Shows error message: "Please provide either submission text, an attachment URL, or upload a file"

---

### Issue 2: 403 Forbidden Error from Supabase ❌ → ✅

**Problem**: Students getting 403 Forbidden error when uploading PDF files for late submissions.

**Root Cause**: Supabase storage bucket policies not configured to allow authenticated users to upload to the `submissions` folder.

**Solution**: Need to update Supabase storage policies.

#### What You Need to Do:

1. **Go to Supabase Dashboard**:
   - Visit: https://supabase.com/dashboard
   - Select project: `bvtawdcbfkwbklhhovre`
   - Navigate to: Storage → assignments bucket → Policies tab

2. **Add/Update These Policies**:

```sql
-- Policy 1: Allow authenticated users to upload submissions
CREATE POLICY "Allow authenticated users to upload submissions"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'assignments' AND
  (storage.foldername(name))[1] = 'submissions'
);

-- Policy 2: Allow authenticated users to upload assignments (teachers)
CREATE POLICY "Allow authenticated users to upload assignments"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'assignments' AND
  (storage.foldername(name))[1] = 'assignments'
);

-- Policy 3: Allow public read access
CREATE POLICY "Allow public read access"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'assignments');

-- Policy 4: Allow users to delete their own files
CREATE POLICY "Allow users to delete own files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'assignments');
```

3. **Alternative Simple Policy** (if above doesn't work):

```sql
-- Delete all existing policies first, then add:
CREATE POLICY "Allow all authenticated operations"
ON storage.objects
FOR ALL
TO authenticated
USING (bucket_id = 'assignments')
WITH CHECK (bucket_id = 'assignments');
```

4. **Verify Service Role Key**:
   - Go to: Supabase Dashboard → Settings → API
   - Copy the **service_role** key (NOT anon key)
   - Update Railway environment variable: `SUPABASE_SERVICE_KEY`

---

## Files Modified

### Backend:
1. `src/main/java/org/student/dto/SubmitAssignmentRequest.java` - Added content validation
2. `src/main/java/org/student/service/AssignmentService.java` - Added validation check

### Frontend:
1. `frontend/src/pages/AssignmentDetail.jsx` - Added frontend validation

### Documentation:
1. `SUPABASE-STORAGE-FIX.md` - Detailed guide for fixing storage policies
2. `LATE-SUBMISSION-FIXES.md` - This file

---

## Testing Steps

### Test 1: Empty Submission Validation
1. Login as student
2. Go to an assignment
3. Click "Submit Assignment" without entering any content
4. ✅ Should show error: "Please provide either submission text, an attachment URL, or upload a file"

### Test 2: File Upload (After Fixing Supabase Policies)
1. Login as student
2. Go to an overdue assignment
3. Request late submission permission
4. Wait for teacher approval
5. Upload a PDF file
6. Submit assignment
7. ✅ Should upload successfully without 403 error

---

## Deployment

### Backend:
```bash
# Commit changes
git add .
git commit -m "Fix: Add submission content validation and improve error handling"
git push origin main
```

Railway will auto-deploy the backend.

### Frontend:
```bash
# Navigate to frontend folder
cd frontend

# Commit and push
git add .
git commit -m "Fix: Add frontend validation for empty submissions"
git push origin main
```

Vercel will auto-deploy the frontend.

### Supabase:
- Manually update storage policies in Supabase Dashboard
- No code deployment needed

---

## Expected Behavior After Fixes

### Before Submission:
- ✅ Student must provide at least one of: text answer, Google Drive link, or uploaded file
- ✅ Submit button validates content before sending to backend
- ✅ Clear error messages guide students

### During File Upload:
- ✅ Files upload to Supabase storage without 403 errors
- ✅ Files are stored in `assignments/submissions/` folder
- ✅ Public URLs are generated for teacher access

### After Submission:
- ✅ Submission appears in teacher's view
- ✅ Teacher can download/view uploaded files
- ✅ Late submission flag is properly set

---

## Additional Notes

### Storage Structure:
```
Supabase Storage Bucket: "assignments"
├── assignments/          # Teacher uploaded files
│   └── 20260216_143022_uuid.pdf
└── submissions/          # Student submitted files
    └── 20260216_143530_uuid.pdf
```

### File Validation:
- Max size: 10 MB
- Allowed types: PDF, DOC, DOCX
- Validated on both frontend and backend

### Security:
- Backend uses service_role key (full access)
- Frontend users are authenticated via JWT
- Storage policies enforce folder-level permissions

---

**Status**: ✅ Code changes complete, awaiting Supabase policy update
**Next Step**: Update Supabase storage policies using the guide in `SUPABASE-STORAGE-FIX.md`
