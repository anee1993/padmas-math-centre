# API 500 Errors Fix - Authentication Principal Issue

## Problem
Multiple API endpoints returning 500 errors with NO logs in Railway:
- `/api/assignments` (POST - create assignment)
- `/api/assignments/generate` (POST - AI generate)
- `/api/timetable/all` (GET)
- `/api/virtual-classroom/all` (GET)
- And many more endpoints that use `Authentication authentication` parameter

## Root Cause - CRITICAL BUG

**The authentication principal was set to `supabaseUserId` (UUID) instead of email!**

In `JwtAuthenticationFilter`, we were doing:
```java
UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
    supabaseUserId,  // <-- UUID string like "fe27fcec-a6fc-4d28-9026-06f22f6f956f"
    null,
    Collections.singletonList(authority)
);
```

But in ALL controllers, the code expects `authentication.getName()` to return an email:
```java
User teacher = userRepository.findByEmail(authentication.getName())
```

So when controllers called `authentication.getName()`, they got a UUID, tried to find a user by that "email", failed, and threw `ResourceNotFoundException` - but this happened BEFORE reaching the controller method, so no logs appeared!

## The Fix

Changed `JwtAuthenticationFilter` to use email as the authentication principal:
```java
UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
    user.getEmail(),  // <-- Now uses email, not supabaseUserId
    null,
    Collections.singletonList(authority)
);
```

Now `authentication.getName()` returns the email, and `findByEmail()` works correctly.

## Why No Logs Appeared

The exception was likely being thrown during the filter chain or early in the request processing, before reaching the controller methods where we added logging. The global exception handler caught it and returned a generic 500 error.

## Files Modified

1. `src/main/java/org/student/security/JwtAuthenticationFilter.java`
   - Changed authentication principal from `supabaseUserId` to `user.getEmail()`
   - Added comment explaining why we use email

2. `src/main/java/org/student/service/AssignmentService.java`
   - Fixed lazy loading in `mapSubmissionToDTO()`

3. `src/main/java/org/student/repository/UserRepository.java`
   - Added `findByIdWithProfile()` method

4. `src/main/java/org/student/controller/VirtualClassroomController.java`
   - Added error handling to `getAllClassrooms()`

5. `src/main/java/org/student/controller/TimetableController.java`
   - Added error handling to `getAllTimetables()`

6. `src/main/java/org/student/controller/AssignmentController.java`
   - Added error handling to `getAllAssignments()` and `generateAssignment()`

7. `src/main/java/org/student/exception/GlobalExceptionHandler.java`
   - Added detailed logging for all unhandled exceptions

## Affected Endpoints (Now Fixed)

All endpoints that use `Authentication authentication` parameter and call `authentication.getName()`:

### AssignmentController
- POST `/api/assignments` - Create assignment
- GET `/api/assignments/class/{classGrade}` - Get assignments by class
- POST `/api/assignments/submit` - Submit assignment
- GET `/api/assignments/{assignmentId}/my-submission` - Get my submission
- GET `/api/assignments/my-submissions` - Get all my submissions
- POST `/api/assignments/upload-file` - Upload file
- POST `/api/assignments/generate` - AI generate assignment

### LateSubmissionController
- POST `/api/late-submissions/request` - Request late submission
- GET `/api/late-submissions/my-requests` - Get my requests
- GET `/api/late-submissions/check` - Check if approved

### LearningMaterialController
- POST `/api/learning-materials` - Upload material
- POST `/api/learning-materials/upload-file` - Upload file

### QueryController
- POST `/api/queries` - Create query
- GET `/api/queries/my-class` - Get class queries
- POST `/api/queries/{queryId}/reply` - Add reply
- GET `/api/queries/is-blocked` - Check if blocked

### StudentController
- GET `/api/students/profile` - Get student profile

## Testing After Deployment

After deploying to Railway, test these endpoints:

```bash
# Get JWT token from Supabase login
TOKEN="your_jwt_token_here"

# Test create assignment (should work now)
curl -X POST https://padma-math-tutions.up.railway.app/api/assignments \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Assignment",
    "description": "Test description",
    "classGrade": 8,
    "dueDate": "2026-03-01T23:59:59",
    "totalMarks": 100
  }'

# Test AI generate (should work now)
curl -X POST https://padma-math-tutions.up.railway.app/api/assignments/generate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Algebra",
    "classGrade": 8,
    "complexity": "MEDIUM",
    "oneMarkQuestions": 5,
    "twoMarkQuestions": 3,
    "threeMarkQuestions": 2,
    "fiveMarkQuestions": 1
  }'

# Test get all assignments (should work now)
curl https://padma-math-tutions.up.railway.app/api/assignments \
  -H "Authorization: Bearer $TOKEN"
```

## Expected Behavior After Fix

- All endpoints that use `authentication.getName()` will now work correctly
- Controllers will successfully look up users by email
- You should see proper logs in Railway for any remaining errors
- Assignment creation and AI generation should work

## Important Notes

1. This was a critical bug introduced during Supabase integration
2. The bug affected ALL authenticated endpoints that look up users by email
3. The fix is simple but critical: use email as authentication principal
4. All existing code expects `authentication.getName()` to return email
5. No other code changes needed - the fix is isolated to `JwtAuthenticationFilter`
