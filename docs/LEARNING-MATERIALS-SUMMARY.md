# Learning Materials Module - Implementation Summary

## Overview
The Learning Materials module allows teachers to upload and share study materials with students in a class-wise manner. Students can view and download materials specific to their class.

## Features

### Teacher Features
- Upload PDF/Word documents (max 10MB)
- Add external links (Google Drive, Dropbox, YouTube, etc.)
- Organize materials by class (6-10)
- Add title and description for each material
- View all uploaded materials with filtering by class
- Delete materials when no longer needed

### Student Features
- View learning materials for their specific class only
- Download PDF/Word documents
- Access external links shared by teacher
- See material details (title, description, upload date, teacher name)

## Backend Implementation

### Entity
**File**: `src/main/java/org/student/entity/LearningMaterial.java`
- `id`: Primary key
- `title`: Material title
- `description`: Material description
- `classGrade`: Class number (6-10)
- `fileUrl`: URL to file in Supabase Storage or external link
- `fileName`: Original file name
- `fileType`: PDF, DOC, DOCX, or LINK
- `uploadedBy`: Teacher ID
- `uploadedAt`: Timestamp

### Repository
**File**: `src/main/java/org/student/repository/LearningMaterialRepository.java`
- `findByClassGradeOrderByUploadedAtDesc()`: Get materials by class
- `findAllByOrderByUploadedAtDesc()`: Get all materials (teacher view)

### DTOs
**Files**: 
- `src/main/java/org/student/dto/LearningMaterialDTO.java`: Response DTO
- `src/main/java/org/student/dto/UploadMaterialRequest.java`: Request DTO

### Service
**File**: `src/main/java/org/student/service/LearningMaterialService.java`
- `uploadMaterial()`: Create new learning material
- `getMaterialsByClass()`: Get materials for specific class
- `getAllMaterials()`: Get all materials (teacher)
- `getMaterialById()`: Get single material
- `deleteMaterial()`: Delete material

### Controller
**File**: `src/main/java/org/student/controller/LearningMaterialController.java`

#### Endpoints
- `POST /api/learning-materials/upload-file`: Upload file to Supabase Storage
  - Returns: `{ url, filename, fileType }`
  - Folder: `materials/`
  
- `POST /api/learning-materials`: Create learning material
  - Request body: `{ title, description, classGrade, fileUrl, fileName, fileType }`
  - Access: TEACHER only
  
- `GET /api/learning-materials/class/{classGrade}`: Get materials by class
  - Access: STUDENT or TEACHER
  
- `GET /api/learning-materials`: Get all materials
  - Access: TEACHER only
  
- `GET /api/learning-materials/{id}`: Get single material
  - Access: STUDENT or TEACHER
  
- `DELETE /api/learning-materials/{id}`: Delete material
  - Access: TEACHER only

## Frontend Implementation

### Teacher Pages

#### Learning Materials Management Page
**File**: `frontend/src/pages/LearningMaterials.jsx`
- Upload form with file upload or external link
- Class filter (All, 6, 7, 8, 9, 10)
- Material cards showing:
  - Title and description
  - Class grade badge
  - File type icon (📄 PDF, 📝 Word, 🔗 Link)
  - Upload date and teacher name
  - View/Download and Delete buttons
- Drag-and-drop file upload interface
- File validation (PDF, DOC, DOCX only, max 10MB)

#### Teacher Dashboard Integration
**File**: `frontend/src/pages/TeacherDashboard.jsx`
- New "Learning Materials" tab added
- Clickable card to navigate to materials management page
- Information about the feature

### Student Pages

#### Student Materials Page
**File**: `frontend/src/pages/StudentMaterials.jsx`
- View materials for student's class only
- Material cards showing:
  - Title and description
  - Class grade badge
  - File type icon
  - Upload date and teacher name
  - View/Download button
- Empty state when no materials available

#### Student Dashboard Integration
**File**: `frontend/src/pages/StudentDashboard.jsx`
- New "Learning Materials" button added
- Navigates to student materials page

### Routes
**File**: `frontend/src/App.jsx`
- `/learning-materials`: Teacher materials management (TEACHER only)
- `/student/materials`: Student materials view (STUDENT only)

## File Storage

### Supabase Storage
- Bucket: `assignments` (same bucket as assignment files)
- Folder: `materials/`
- Files stored with unique names to prevent conflicts
- Public access for authenticated users

### File Upload Flow
1. Teacher selects file or enters external link
2. If file selected:
   - Validate file type (PDF, DOC, DOCX)
   - Validate file size (max 10MB)
   - Upload to Supabase Storage via `/api/learning-materials/upload-file`
   - Receive file URL, filename, and type
3. Create learning material record with file details
4. Material appears in list for teacher and students of that class

## Usage Instructions

### For Teachers
1. Go to Teacher Dashboard
2. Click "Learning Materials" tab
3. Click "Upload New Material" button
4. Fill in:
   - Title (required)
   - Description (required)
   - Select class (6-10)
   - Either upload a file OR provide external link (not both)
5. Click "Upload Material"
6. Material is now available to students of that class

### For Students
1. Go to Student Dashboard
2. Click "Learning Materials" button
3. View all materials for your class
4. Click "View/Download" to access the material
5. PDF files open in browser, can be downloaded
6. External links open in new tab

## Security
- Role-based access control (TEACHER can upload/delete, STUDENT can only view)
- Students can only see materials for their specific class
- File type validation on both frontend and backend
- File size limit enforced (10MB)
- Supabase Storage RLS policies should be configured

## Database Table
```sql
CREATE TABLE learning_materials (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    class_grade INTEGER NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    uploaded_by BIGINT NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Testing Checklist
- [ ] Teacher can upload PDF file
- [ ] Teacher can upload Word document
- [ ] Teacher can add external link
- [ ] File size validation works (reject >10MB)
- [ ] File type validation works (reject non-PDF/Word)
- [ ] Materials appear in correct class filter
- [ ] Students see only their class materials
- [ ] Download/view links work correctly
- [ ] Teacher can delete materials
- [ ] Empty states display correctly
- [ ] File upload progress shows during upload

## Future Enhancements
- Add categories/tags for materials (e.g., "Notes", "Practice Problems", "Reference")
- Add search functionality
- Add preview for PDF files
- Track download/view statistics
- Allow students to favorite materials
- Add comments/feedback on materials
- Support more file types (images, videos)
- Bulk upload multiple files at once
