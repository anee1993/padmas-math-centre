# Phase 2 Implementation Plan

## Implementation Order

### Sprint 1: Virtual Classroom (Priority 1)
**Goal:** Students can join class-specific video rooms with teacher as moderator

**Backend:**
- VirtualClassroom entity ✅
- Virtual classroom repository
- Virtual classroom service (create rooms for each grade)
- API endpoints for getting classroom links
- Teacher can start/stop classroom sessions

**Frontend:**
- Jitsi Meet React integration
- Student dashboard: "Join Virtual Classroom" button
- Teacher dashboard: Classroom management panel
- Waiting room logic (students wait until teacher joins)
- Teacher moderator controls

**Technical:**
- Jitsi Meet API integration
- Room naming: `padma-math-class-{grade}`
- JWT tokens for room access control
- Teacher role: moderator
- Student role: participant

---

### Sprint 2: Assignment Management (Priority 2)
**Goal:** Teacher creates assignments, students submit, basic file upload

**Backend:**
- Assignment & AssignmentSubmission entities ✅
- File upload service (Supabase Storage)
- Assignment CRUD APIs
- Submission APIs
- File validation and security

**Frontend:**
- Teacher: Create/edit assignment form
- Teacher: View all assignments
- Student: View assignments for their class
- Student: Submit assignment with file upload
- File upload component with drag-drop

---

### Sprint 3: Grading System (Priority 3)
**Goal:** Teacher grades submissions, students view grades

**Backend:**
- Grade entity ✅
- Grading service
- Grade calculation
- Feedback system

**Frontend:**
- Teacher: Grade submission interface
- Teacher: View all submissions
- Student: View grades and feedback
- Grade display with percentage

---

### Sprint 4: Announcements & Notifications (Priority 4)
**Goal:** Teacher posts announcements, students get notified

**Backend:**
- Announcement & Notification entities ✅
- Announcement service
- Notification service
- Auto-notification triggers

**Frontend:**
- Teacher: Create announcement
- Student: View announcements
- Notification bell with dropdown
- Mark as read functionality

---

### Sprint 5: Class Scheduling (Priority 5)
**Goal:** Teacher schedules classes, students see upcoming classes

**Backend:**
- Schedule entity ✅
- Scheduling service
- Calendar integration
- Recurring schedule logic

**Frontend:**
- Teacher: Schedule creation form
- Calendar view (FullCalendar)
- Student: Upcoming classes list
- Integration with virtual classroom

---

### Sprint 6: Progress Tracking (Priority 6)
**Goal:** Visual dashboards showing student performance

**Backend:**
- Analytics service
- Progress calculation
- Grade aggregation

**Frontend:**
- Charts (Chart.js/Recharts)
- Student: Personal progress dashboard
- Teacher: Class analytics
- Performance metrics

---

## Current Status: Starting Sprint 1 - Virtual Classroom

### What I'm Building Now:

1. **Backend Setup:**
   - Virtual classroom repository
   - Service to initialize classrooms for grades 6-10
   - API to get classroom link for student's grade
   - API for teacher to start/manage classrooms

2. **Frontend Setup:**
   - Install Jitsi Meet React SDK
   - Create VirtualClassroom component
   - Add "Join Classroom" button to student dashboard
   - Add classroom management to teacher dashboard
   - Implement waiting room logic

3. **Jitsi Configuration:**
   - Use meet.jit.si (free hosted service)
   - Configure moderator vs participant roles
   - Enable screen sharing for teacher
   - Disable screen sharing for students

---

## File Structure Being Created:

```
Backend:
├── entity/ (✅ All entities created)
├── repository/
│   ├── VirtualClassroomRepository
│   ├── AssignmentRepository
│   ├── SubmissionRepository
│   ├── GradeRepository
│   ├── AnnouncementRepository
│   ├── NotificationRepository
│   └── ScheduleRepository
├── service/
│   ├── VirtualClassroomService
│   ├── AssignmentService
│   ├── GradingService
│   ├── AnnouncementService
│   ├── NotificationService
│   ├── ScheduleService
│   └── FileStorageService
├── controller/
│   ├── VirtualClassroomController
│   ├── AssignmentController
│   ├── GradingController
│   ├── AnnouncementController
│   └── ScheduleController
└── dto/
    └── (Various DTOs for each feature)

Frontend:
├── pages/
│   ├── VirtualClassroom.jsx (NEW)
│   ├── Assignments.jsx (NEW)
│   ├── AssignmentDetail.jsx (NEW)
│   ├── Grades.jsx (NEW)
│   ├── Schedule.jsx (NEW)
│   └── Progress.jsx (NEW)
├── components/
│   ├── JitsiMeeting.jsx (NEW)
│   ├── FileUpload.jsx (NEW)
│   ├── NotificationBell.jsx (NEW)
│   ├── AnnouncementCard.jsx (NEW)
│   └── GradeChart.jsx (NEW)
└── services/
    └── fileService.js (NEW)
```

---

## Next Steps:

1. Create repositories for all entities
2. Build Virtual Classroom service and APIs
3. Initialize virtual classrooms for grades 6-10
4. Integrate Jitsi Meet in frontend
5. Test video conferencing with waiting room logic

Ready to proceed!
