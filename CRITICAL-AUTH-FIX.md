# CRITICAL: Authentication Principal Bug Fix

## The Bug

When we integrated Supabase authentication, we set the authentication principal to `supabaseUserId` (a UUID):

```java
// WRONG - in JwtAuthenticationFilter
UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
    supabaseUserId,  // UUID like "fe27fcec-a6fc-4d28-9026-06f22f6f956f"
    null,
    Collections.singletonList(authority)
);
```

But ALL controllers expect `authentication.getName()` to return an email:

```java
// In AssignmentController, QueryController, LearningMaterialController, etc.
User user = userRepository.findByEmail(authentication.getName())
```

## The Impact

This broke EVERY endpoint that:
1. Uses `Authentication authentication` parameter
2. Calls `authentication.getName()` to look up the user

Affected endpoints:
- Create/upload assignments
- AI generate assignments
- Submit assignments
- Create queries
- Upload learning materials
- Get student profile
- And many more...

## Why No Logs?

The `ResourceNotFoundException` was thrown when trying to find a user by UUID (thinking it was an email), but this happened early in the request processing. The global exception handler caught it and returned a generic 500 error without detailed logging.

## The Fix

Changed the authentication principal to use email:

```java
// CORRECT - in JwtAuthenticationFilter
UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
    user.getEmail(),  // Now uses email
    null,
    Collections.singletonList(authority)
);
```

## File Changed

`src/main/java/org/student/security/JwtAuthenticationFilter.java` - Line 62

## Deploy Instructions

1. Commit and push this change to GitHub
2. Railway will auto-deploy
3. Test any previously failing endpoint - they should all work now

## Test Command

```bash
# After deployment, test with your JWT token
curl -X POST https://padma-math-tutions.up.railway.app/api/assignments \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Assignment",
    "description": "Test",
    "classGrade": 8,
    "dueDate": "2026-03-01T23:59:59",
    "totalMarks": 100
  }'
```

This should now work and create an assignment successfully!
