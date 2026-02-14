# Phase 1 Requirements - Mathematics Tuition Management System

## Overview
A classroom management service designed for a mathematics tuition center, enabling student registration, authentication, and teacher administration.

## User Roles

### 1. Student
- Primary users who register and access the platform
- Require approval from teacher before accessing the system

### 2. Teacher (Admin)
- Single teacher with administrative privileges
- Manages student registrations and approvals

---

## Functional Requirements

### FR1: Student Registration
**Description:** Students can self-register on the platform by providing required information.

**Details:**
- Students must provide:
  - Full Name
  - Email Address (used as username)
  - Password
  - Date of Birth
  - Gender
  - Class (restricted to grades 6-10)
  
**Acceptance Criteria:**
- Registration form validates all required fields
- Email must be unique in the system
- Password must meet security requirements (to be defined)
- Class selection limited to options: 6, 7, 8, 9, 10
- Upon successful registration, student account is created in "Pending Approval" status
- Student receives confirmation that registration is pending teacher approval

---

### FR2: Student Authentication
**Description:** Approved students can login using their email and password.

**Details:**
- Login requires email address and password
- Only approved students can successfully authenticate
- Pending/rejected registrations cannot login

**Acceptance Criteria:**
- Valid credentials grant access to student dashboard
- Invalid credentials show appropriate error message
- Unapproved accounts show "Registration pending approval" message
- Session management maintains logged-in state

---

### FR3: Teacher Registration Approval
**Description:** Teacher can view and approve/reject pending student registrations.

**Details:**
- Teacher has access to list of pending registrations
- Teacher can view student details before approval
- Teacher can approve or reject registration requests

**Acceptance Criteria:**
- Teacher dashboard shows all pending registrations
- Teacher can view: name, email, date of birth, gender, class for each pending student
- Teacher can approve individual registrations
- Teacher can reject individual registrations (optional: with reason)
- Approved students can immediately login
- Students are notified of approval/rejection status

---

### FR4: Teacher Authentication
**Description:** Teacher can login with admin privileges.

**Details:**
- Single teacher account with pre-configured credentials
- Teacher has access to admin dashboard upon login

**Acceptance Criteria:**
- Teacher can login using email and password
- Teacher session provides access to admin features
- Teacher dashboard is distinct from student dashboard

---

## Non-Functional Requirements

### NFR1: Security
- Passwords must be hashed and stored securely (bcrypt or similar)
- Minimum password requirements: 8 characters, at least 1 uppercase, 1 lowercase, 1 number
- Session tokens must expire after period of inactivity
- HTTPS must be used for all communications (production)

### NFR2: Data Validation
- Email format validation
- Age validation based on date of birth (students should be school-age)
- Input sanitization to prevent SQL injection and XSS attacks

### NFR3: Usability
- Registration form should be simple and intuitive
- Clear error messages for validation failures
- Responsive design for mobile and desktop access

### NFR4: Performance
- Login response time < 2 seconds
- Registration approval action < 1 second
- Support for at least 100 concurrent users

### NFR5: Availability
- System uptime target: 99% during operational hours
- Graceful error handling with user-friendly messages

---

## Out of Scope for Phase 1
- Password reset functionality
- Student profile editing
- Class/course content management
- Assignment submission
- Grading system
- Communication features (messaging, announcements)
- Multiple teacher support
- Parent/guardian accounts

---

## Technical Considerations

### Database Schema (Preliminary)
**Users Table:**
- id (primary key)
- email (unique)
- password_hash
- role (STUDENT/TEACHER)
- status (PENDING/APPROVED/REJECTED) - for students only
- created_at
- updated_at

**Student_Profiles Table:**
- id (primary key)
- user_id (foreign key)
- full_name
- date_of_birth
- gender
- class_grade (6-10)

### API Endpoints (Suggested)
- POST /api/auth/register - Student registration
- POST /api/auth/login - Authentication
- GET /api/admin/pending-registrations - List pending students
- PUT /api/admin/approve-registration/:id - Approve student
- PUT /api/admin/reject-registration/:id - Reject student

---

## Questions for Clarification

1. Should rejected students be able to re-register with the same email?
2. What notification mechanism for approval/rejection? (Email, in-app, both?)
3. Should there be a teacher registration flow, or is the teacher account pre-seeded?
4. Any specific requirements for password reset in Phase 1?
5. Should student profiles be editable after approval?
6. Any data retention policy for rejected registrations?
7. Should there be audit logging for teacher actions?

---

## Success Metrics
- Students can successfully register and await approval
- Teacher can review and approve registrations within the system
- Approved students can login and access their dashboard
- Zero unauthorized access to admin features
- All user data stored securely
