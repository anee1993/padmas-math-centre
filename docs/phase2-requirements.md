# Phase 2 Requirements - Advanced Learning Management System

## Overview
Expand Padma's Math Centre into a full-featured Learning Management System (LMS) with video conferencing, assignment management, progress tracking, and grading capabilities.

---

## Feature 1: Video Conferencing (Virtual Classroom)

### FR2.1: Class-Based Virtual Classrooms
**Description:** Each class (6-10) has a dedicated virtual classroom accessible via video conferencing.

**Details:**
- Each class grade has a unique classroom link/room
- Students see their class's virtual classroom link on dashboard
- Teacher can access all classroom links
- Integration with WebRTC-based video conferencing (Jitsi Meet or similar)

**Acceptance Criteria:**
- Student dashboard displays "Join Virtual Classroom" button for their grade
- Clicking button opens video conference in new tab/window
- Multiple students from same class can join simultaneously
- Teacher has moderator privileges (screen share, mute participants, etc.)
- Video, audio, and chat functionality available
- Screen sharing enabled for teacher
- Participant list visible to all
- Recording capability (optional for Phase 2)

**Technical Approach:**
- Use Jitsi Meet API (free, open-source, Google Meet-like features)
- Or use Daily.co API (easier integration, generous free tier)
- Room naming: `padma-math-class-{grade}-{date}`
- Teacher role: moderator with full controls
- Student role: participant with limited controls

---

## Feature 2: Assignment Management

### FR2.2: Create and Manage Assignments
**Description:** Teacher can create, edit, and delete assignments for specific classes.

**Details:**
- Teacher creates assignments with:
  - Title
  - Description/Instructions
  - Class grade (6-10)
  - Due date and time
  - Total marks/points
  - Attachment support (PDF, images, documents)
- Teacher can edit/delete assignments
- Teacher can view all assignments by class

**Acceptance Criteria:**
- Teacher dashboard has "Assignments" section
- Create assignment form with all required fields
- File upload for assignment materials (max 10MB)
- Assignments listed by class and due date
- Edit/delete functionality for assignments
- Assignment status: Draft, Published, Closed

### FR2.3: Student Assignment Submission
**Description:** Students can view and submit assignments.

**Details:**
- Students see assignments for their class
- Students can upload submission files
- Students can add text responses
- Submission deadline enforcement
- Late submission marking

**Acceptance Criteria:**
- Student dashboard shows pending assignments
- Assignment details page with instructions
- File upload for submission (max 5MB)
- Text editor for written responses
- Submit button with confirmation
- Cannot submit after deadline (or marked as late)
- View submission status (Pending, Submitted, Graded)

---

## Feature 3: Grading System

### FR2.4: Grade Assignments
**Description:** Teacher can grade student submissions and provide feedback.

**Details:**
- Teacher views all submissions for an assignment
- Teacher assigns marks/grade to each submission
- Teacher provides written feedback
- Students can view grades and feedback

**Acceptance Criteria:**
- Teacher sees list of submissions per assignment
- Grading interface with marks input and feedback text
- Save and publish grades
- Students notified when graded
- Grade history maintained
- Overall grade calculation per student

### FR2.5: Grade Reports
**Description:** Generate grade reports and progress summaries.

**Details:**
- Student view: Personal grade report
- Teacher view: Class-wise grade reports
- Export to PDF/Excel

**Acceptance Criteria:**
- Student sees all their grades in one view
- Teacher sees grade summary by class
- Filter by date range, class, student
- Export functionality

---

## Feature 4: Class Scheduling

### FR2.6: Schedule Management
**Description:** Teacher creates and manages class schedules.

**Details:**
- Teacher creates recurring/one-time class sessions
- Schedule includes:
  - Class grade
  - Date and time
  - Duration
  - Topic/subject
  - Virtual classroom link (auto-generated)
- Students see their class schedule

**Acceptance Criteria:**
- Teacher dashboard has "Schedule" section
- Create schedule form with date/time picker
- Recurring schedule support (weekly pattern)
- Calendar view of all schedules
- Students see upcoming classes on dashboard
- Automatic virtual classroom link generation
- Email/notification reminders (optional)

---

## Feature 5: Student Progress Tracking

### FR2.7: Progress Dashboard
**Description:** Track and visualize student performance and engagement.

**Details:**
- Metrics tracked:
  - Assignment completion rate
  - Average grades
  - Class attendance (virtual classroom joins)
  - Submission timeliness
- Visual charts and graphs
- Progress over time

**Acceptance Criteria:**
- Student dashboard shows personal progress metrics
- Teacher dashboard shows class-wide analytics
- Charts: Line graphs, bar charts, pie charts
- Filter by date range
- Identify struggling students (low grades, missed assignments)

---

## Feature 6: Announcements/Notifications

### FR2.8: Announcement System
**Description:** Teacher can post announcements visible to students.

**Details:**
- Teacher creates announcements with:
  - Title
  - Message content
  - Target audience (specific class or all students)
  - Priority level (Normal, Important, Urgent)
- Students see announcements on dashboard
- Mark as read functionality

**Acceptance Criteria:**
- Teacher dashboard has "Announcements" section
- Create announcement form
- Rich text editor for formatting
- Target specific classes or all students
- Announcements displayed prominently on student dashboard
- Unread count indicator
- Archive old announcements

### FR2.9: Notification System
**Description:** Automated notifications for important events.

**Details:**
- Notifications triggered for:
  - New assignment posted
  - Assignment due soon (24 hours before)
  - Assignment graded
  - New announcement
  - Upcoming class (1 hour before)
  - Registration approved
- In-app notification center
- Email notifications (optional)

**Acceptance Criteria:**
- Notification bell icon with unread count
- Notification dropdown/panel
- Mark as read functionality
- Notification history
- Email integration (optional for Phase 2)

---

## Feature 7: File Upload System

### FR2.10: File Management
**Description:** Secure file upload and storage for assignments and materials.

**Details:**
- File types supported: PDF, DOC, DOCX, JPG, PNG, TXT
- File size limits:
  - Teacher uploads: 10MB per file
  - Student uploads: 5MB per file
- Storage: Supabase Storage or AWS S3
- Virus scanning (optional)
- File preview capability

**Acceptance Criteria:**
- Drag-and-drop file upload
- Progress indicator during upload
- File validation (type and size)
- Secure file storage with access control
- Download functionality
- Delete uploaded files (before submission)

---

## Database Schema Updates

### New Tables Required:

**assignments**
- id, title, description, class_grade, due_date, total_marks, attachment_url, status, created_by (teacher_id), created_at, updated_at

**assignment_submissions**
- id, assignment_id, student_id, submission_text, attachment_url, submitted_at, status (pending/submitted/graded), is_late

**grades**
- id, submission_id, marks_obtained, feedback, graded_by (teacher_id), graded_at

**schedules**
- id, class_grade, date, start_time, end_time, topic, virtual_room_id, created_by (teacher_id), is_recurring, recurrence_pattern

**announcements**
- id, title, content, target_class_grade (null for all), priority, created_by (teacher_id), created_at

**notifications**
- id, user_id, type, title, message, is_read, created_at

**virtual_classrooms**
- id, class_grade, room_id, room_url, is_active, created_at

**attendance**
- id, schedule_id, student_id, joined_at, left_at, duration_minutes

---

## Technical Stack Additions

### Backend:
- File upload: Multipart file handling
- Storage: Supabase Storage or AWS S3
- Scheduling: Quartz Scheduler for notifications
- WebSocket: For real-time notifications (optional)

### Frontend:
- Video conferencing: Jitsi Meet React SDK or Daily.co
- Charts: Chart.js or Recharts
- File upload: React Dropzone
- Rich text editor: React Quill or TinyMCE
- Calendar: FullCalendar or React Big Calendar
- Date/time picker: React DatePicker

### Third-Party Services:
- Video conferencing: Jitsi Meet (self-hosted or meet.jit.si) or Daily.co
- File storage: Supabase Storage (already using Supabase)
- Email (optional): SendGrid or AWS SES

---

## Implementation Priority

### High Priority (Core Features):
1. Assignment Management (Create, View, Submit)
2. Grading System (Basic grading)
3. Virtual Classroom (Video conferencing integration)
4. Announcements

### Medium Priority:
5. Class Scheduling
6. Student Progress Tracking (Basic metrics)
7. Notifications (In-app)

### Lower Priority (Can be Phase 3):
8. Advanced analytics and reporting
9. Email notifications
10. Recording virtual classes
11. Parent portal

---

## Non-Functional Requirements

### NFR2.1: Performance
- File uploads should complete within 30 seconds for 10MB files
- Video conferencing should support up to 30 concurrent participants per room
- Dashboard should load within 2 seconds

### NFR2.2: Security
- File uploads validated and sanitized
- Access control: Students can only access their class materials
- Video room access restricted to enrolled students and teacher
- Secure file storage with encryption

### NFR2.3: Scalability
- Support 100+ students across all classes
- Handle 5 concurrent virtual classrooms
- Store up to 1GB of files initially

### NFR2.4: Usability
- Intuitive UI for assignment submission
- Clear visual indicators for due dates
- Mobile-responsive design for all features

---

## Success Metrics

- 90% of students can successfully join virtual classroom
- Average assignment submission rate > 80%
- Teacher can grade 20 assignments in under 30 minutes
- Students can view their progress dashboard without confusion
- File upload success rate > 95%

---

## Questions for Clarification

1. Should virtual classrooms be scheduled or always available?
2. Do you want to record virtual classes for later viewing?
3. Should parents have read-only access to student progress?
4. What grading scale? (Percentage, letter grades, or points?)
5. Should students be able to resubmit assignments?
6. Do you want a discussion forum or Q&A section?
7. Should there be a resource library for study materials?
8. Integration with payment system for tuition fees?

---

## Estimated Timeline

- Assignment Management: 1 week
- Grading System: 3-4 days
- Virtual Classroom Integration: 1 week
- Class Scheduling: 3-4 days
- Progress Tracking: 1 week
- Announcements/Notifications: 3-4 days
- File Upload System: 3-4 days

**Total Estimated Time: 4-5 weeks for full Phase 2 implementation**

---

## Next Steps

1. Review and approve requirements
2. Choose video conferencing solution (Jitsi vs Daily.co)
3. Set up file storage (Supabase Storage)
4. Begin with Assignment Management module
5. Iterate and test each feature
