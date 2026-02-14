# File Upload Feature - Implementation Summary

## Overview
Added direct file upload capability for both teachers (assignment files) and students (submission files) using Supabase Storage.

---

## Features Implemented

### Teacher Features
✅ Upload PDF/Word documents when creating assignments
✅ Choose between file upload OR external URL (not both)
✅ Drag-and-drop file upload interface
✅ File validation (type and size)
✅ Visual feedback during upload
✅ Preview selected file before upload

### Student Features
✅ Upload completed assignments as PDF/Word documents
✅ Choose between file upload OR external URL (not both)
✅ Drag-and-drop file upload interface
✅ File validation (type and size)
✅ Visual feedback during upload
✅ Preview selected file before upload

### System Features
✅ File type validation (PDF, DOC, DOCX only)
✅ File size limit (10MB max)
✅ Secure file storage in Supabase
✅ Unique filename generation (timestamp + UUID)
✅ Organized folder structure (assignments/ and submissions/)
✅ Public URL generation for file access
✅ Role-based upload restrictions

---

## Backend Implementation

### New Service: FileStorageService.java

**Location**: `src/main/java/org/student/service/FileStorageService.java`

**Methods**:
- `uploadFile(MultipartFile file, String folder)` - Uploads file to Supabase Storage
- `deleteFile(String fileUrl)` - Deletes file from Supabase Storage
- `isValidFileType(String contentType)` - Validates file MIME type

**Features**:
- Validates file type (PDF, DOC, DOCX)
- Validates file size (max 10MB)
- Generates unique filenames with timestamp and UUID
- Uploads to Supabase Storage via REST API
- Returns public URL for file access

### Updated Controller: AssignmentController.java

**New Endpoint**:
```
POST /api/assignments/upload-file
```

**Parameters**:
- `file` (MultipartFile) - The file to upload
- `folder` (String) - Target folder ("assignments" or "submissions")

**Response**:
```json
{
  "url": "https://bvtawdcbfkwbklhhovre.supabase.co/storage/v1/object/public/assignments/...",
  "filename": "original-filename.pdf"
}
```

**Security**:
- Requires authentication (TEACHER or STUDENT role)
- Teachers can only upload to "assignments" folder
- Students can only upload to "submissions" folder

### Configuration Updates

**application.yml**:
```yaml
spring:
  servlet:
    multipart:
      enabled: true
      max-file-size: 10MB
      max-request-size: 10MB

supabase:
  url: https://bvtawdcbfkwbklhhovre.supabase.co
  key: ${SUPABASE_KEY}
```

---

## Frontend Implementation

### Updated: CreateAssignment.jsx

**New Features**:
- File input with drag-and-drop support
- File preview showing selected filename
- Remove file button
- Upload progress indicator
- Disabled URL input when file is selected
- Disabled file input when URL is provided

**State Management**:
```javascript
const [selectedFile, setSelectedFile] = useState(null);
const [uploading, setUploading] = useState(false);
```

**File Upload Flow**:
1. User selects file via drag-drop or click
2. Frontend validates file type and size
3. On form submit, file is uploaded first
4. Upload returns file URL
5. Assignment is created with file URL

### Updated: AssignmentDetail.jsx

**New Features**:
- File input with drag-and-drop support for student submissions
- File preview showing selected filename
- Remove file button
- Upload progress indicator
- Disabled URL input when file is selected
- Disabled file input when URL is provided

**State Management**:
```javascript
const [selectedFile, setSelectedFile] = useState(null);
const [uploading, setUploading] = useState(false);
```

**File Upload Flow**:
1. Student selects completed assignment file
2. Frontend validates file type and size
3. On submit, file is uploaded first
4. Upload returns file URL
5. Submission is created with file URL

---

## File Validation

### Frontend Validation
- File type: PDF, DOC, DOCX only
- File size: Maximum 10MB
- Immediate feedback on invalid files

### Backend Validation
- MIME type check:
  - `application/pdf`
  - `application/msword`
  - `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- File size check: Maximum 10MB
- Returns error message if validation fails

---

## File Storage Structure

```
Supabase Storage Bucket: assignments/
│
├── assignments/                    # Teacher uploaded files
│   ├── 20260214_143022_abc123.pdf
│   ├── 20260214_143530_def456.docx
│   └── ...
│
└── submissions/                    # Student uploaded files
    ├── 20260214_150022_ghi789.pdf
    ├── 20260214_150530_jkl012.docx
    └── ...
```

**Filename Format**: `{folder}/{YYYYMMDD_HHmmss}_{UUID}.{extension}`

Example: `assignments/20260214_143022_abc123-def456-ghi789.pdf`

---

## User Experience

### Teacher Creating Assignment

1. Navigate to "Create Assignment"
2. Fill in assignment details
3. **Option A**: Upload a file
   - Click or drag-drop PDF/Word file
   - See filename preview
   - Can remove and select different file
4. **Option B**: Provide external URL
   - Paste Google Drive/Dropbox link
5. Click "Create Assignment"
6. If file selected, see "Uploading..." message
7. Assignment created with file URL

### Student Submitting Assignment

1. Navigate to assignment detail page
2. Fill in answer text (optional)
3. **Option A**: Upload completed assignment
   - Click or drag-drop PDF/Word file
   - See filename preview
   - Can remove and select different file
4. **Option B**: Provide external URL
   - Paste Google Drive/Dropbox link
5. Click "Submit Assignment"
6. If file selected, see "Uploading..." message
7. Submission created with file URL

---

## Error Handling

### Common Errors

1. **"Please select a PDF or Word document"**
   - Cause: Invalid file type
   - Solution: Select PDF, DOC, or DOCX file

2. **"File size must be less than 10MB"**
   - Cause: File too large
   - Solution: Compress file or use external link

3. **"Failed to upload file to Supabase"**
   - Cause: Supabase configuration issue
   - Solution: Check Supabase Storage setup (see SUPABASE-STORAGE-SETUP.md)

4. **"Invalid folder"**
   - Cause: User trying to upload to wrong folder
   - Solution: System automatically assigns correct folder based on role

---

## Setup Requirements

### Before Using File Upload

1. **Create Supabase Storage Bucket**
   - Name: `assignments`
   - Type: Public bucket
   - See: `docs/SUPABASE-STORAGE-SETUP.md`

2. **Set Bucket Policies**
   - Allow authenticated users to upload
   - Allow public read access
   - See: `docs/SUPABASE-STORAGE-SETUP.md`

3. **Configure Supabase API Key**
   - Get anon/public key from Supabase Dashboard
   - Add to `application.yml` or environment variable
   - See: `docs/SUPABASE-STORAGE-SETUP.md`

### Alternative: Skip File Upload Setup

If you don't want to set up Supabase Storage:
- Users can still use external URLs (Google Drive, Dropbox, etc.)
- Simply don't configure Supabase Storage
- File upload will fail, but URL input will work

---

## Files Modified/Created

### Backend
- **Created**: `FileStorageService.java` - File upload service
- **Modified**: `AssignmentController.java` - Added upload endpoint
- **Modified**: `application.yml` - Added multipart and Supabase config

### Frontend
- **Modified**: `CreateAssignment.jsx` - Added file upload UI
- **Modified**: `AssignmentDetail.jsx` - Added file upload UI

### Documentation
- **Created**: `SUPABASE-STORAGE-SETUP.md` - Setup guide
- **Created**: `FILE-UPLOAD-FEATURE.md` - This document

---

## Testing Checklist

### Teacher File Upload
- [ ] Can select PDF file via click
- [ ] Can drag-drop PDF file
- [ ] Can select Word document
- [ ] Cannot select invalid file type (shows error)
- [ ] Cannot select file > 10MB (shows error)
- [ ] Can remove selected file
- [ ] URL input disabled when file selected
- [ ] File input disabled when URL provided
- [ ] Upload shows progress indicator
- [ ] Assignment created with file URL
- [ ] File accessible via URL

### Student File Upload
- [ ] Can select PDF file via click
- [ ] Can drag-drop PDF file
- [ ] Can select Word document
- [ ] Cannot select invalid file type (shows error)
- [ ] Cannot select file > 10MB (shows error)
- [ ] Can remove selected file
- [ ] URL input disabled when file selected
- [ ] File input disabled when URL provided
- [ ] Upload shows progress indicator
- [ ] Submission created with file URL
- [ ] File accessible via URL

### Error Handling
- [ ] Invalid file type shows error message
- [ ] File too large shows error message
- [ ] Upload failure shows error message
- [ ] Can retry after error

---

## Future Enhancements

Potential improvements for future versions:

1. **File Preview** - Show PDF preview before upload
2. **Multiple Files** - Allow multiple file attachments
3. **File Compression** - Auto-compress large files
4. **Progress Bar** - Show upload percentage
5. **File Management** - Delete/replace uploaded files
6. **File Versioning** - Track file versions
7. **Thumbnail Generation** - Generate thumbnails for PDFs
8. **Virus Scanning** - Scan uploaded files for malware
9. **Download Statistics** - Track file downloads
10. **Batch Upload** - Upload multiple files at once

---

**Implementation Date**: February 14, 2026
**Status**: ✅ Complete - Ready for testing after Supabase Storage setup
