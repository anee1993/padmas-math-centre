# API Documentation - Mathematics Tuition Management System

## Base URL
```
http://localhost:8080
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Public Endpoints

### 1. Student Registration
**POST** `/api/auth/register`

Register a new student account (requires teacher approval).

**Request Body:**
```json
{
  "fullName": "John Doe",
  "email": "john.doe@example.com",
  "password": "Password@123",
  "dateOfBirth": "2010-05-15",
  "gender": "MALE",
  "classGrade": 8
}
```

**Validation Rules:**
- `fullName`: 2-100 characters, required
- `email`: Valid email format, unique, required
- `password`: Min 8 chars, 1 uppercase, 1 lowercase, 1 number, required
- `dateOfBirth`: Past date, required
- `gender`: MALE, FEMALE, or OTHER, required
- `classGrade`: Integer between 6-10, required

**Response (201 Created):**
```json
{
  "id": 1,
  "email": "john.doe@example.com",
  "fullName": "John Doe",
  "status": "PENDING",
  "message": "Registration successful. Awaiting teacher approval."
}
```

**Error Response (400 Bad Request):**
```json
{
  "email": "Email already registered"
}
```

---

### 2. Login
**POST** `/api/auth/login`

Authenticate and receive JWT token.

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "Password@123"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "email": "john.doe@example.com",
  "role": "STUDENT",
  "message": "Login successful"
}
```

**Error Responses:**

Unapproved Student (401 Unauthorized):
```json
{
  "success": false,
  "message": "Registration pending approval. Please wait for teacher approval."
}
```

Invalid Credentials (401 Unauthorized):
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

---

## Teacher/Admin Endpoints
All admin endpoints require `ROLE_TEACHER` authentication.

### 3. Get Pending Registrations
**GET** `/api/admin/pending-registrations`

Retrieve all student registrations awaiting approval.

**Headers:**
```
Authorization: Bearer <teacher_token>
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "email": "john.doe@example.com",
    "fullName": "John Doe",
    "dateOfBirth": "2010-05-15",
    "gender": "MALE",
    "classGrade": 8,
    "registeredAt": "2024-02-14T10:30:00"
  },
  {
    "id": 2,
    "email": "jane.smith@example.com",
    "fullName": "Jane Smith",
    "dateOfBirth": "2011-08-22",
    "gender": "FEMALE",
    "classGrade": 7,
    "registeredAt": "2024-02-14T11:15:00"
  }
]
```

---

### 4. Approve Registration
**PUT** `/api/admin/approve-registration`

Approve a pending student registration.

**Headers:**
```
Authorization: Bearer <teacher_token>
```

**Request Body:**
```json
{
  "studentId": 1
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Student registration approved successfully"
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "message": "Student not found"
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Registration is not in pending state"
}
```

---

### 5. Reject Registration
**PUT** `/api/admin/reject-registration`

Reject a pending student registration.

**Headers:**
```
Authorization: Bearer <teacher_token>
```

**Request Body:**
```json
{
  "studentId": 1,
  "reason": "Incomplete information provided"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Student registration rejected"
}
```

---

## Default Teacher Account

A default teacher account is created on application startup:

```
Email: teacher@mathtuition.com
Password: Teacher@123
```

**⚠️ IMPORTANT:** Change this password in production!

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation errors) |
| 401 | Unauthorized (invalid credentials or unapproved account) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## Testing the API

### Using cURL

**1. Register a Student:**
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "email": "john.doe@example.com",
    "password": "Password@123",
    "dateOfBirth": "2010-05-15",
    "gender": "MALE",
    "classGrade": 8
  }'
```

**2. Teacher Login:**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teacher@mathtuition.com",
    "password": "Teacher@123"
  }'
```

**3. Get Pending Registrations:**
```bash
curl -X GET http://localhost:8080/api/admin/pending-registrations \
  -H "Authorization: Bearer <teacher_token>"
```

**4. Approve Registration:**
```bash
curl -X PUT http://localhost:8080/api/admin/approve-registration \
  -H "Authorization: Bearer <teacher_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": 1
  }'
```

**5. Student Login (after approval):**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "Password@123"
  }'
```

---

## Database Console

H2 Console is available at: `http://localhost:8080/h2-console`

**Connection Details:**
- JDBC URL: `jdbc:h2:mem:classroomdb`
- Username: `sa`
- Password: (leave empty)

---

## Security Notes

1. JWT tokens expire after 24 hours (configurable in `application.yml`)
2. Passwords are hashed using BCrypt
3. CSRF protection is disabled for API endpoints
4. Session management is stateless (JWT-based)
5. Change the JWT secret in production (`jwt.secret` in `application.yml`)
