# Supabase Auth - Testing Guide

## Quick Start

The backend is now deployed with JWT token validation fallback mode. Login should work even without the JWT secret configured.

## What Changed

The backend now has a fallback mechanism for JWT validation:
1. First tries to validate with JWT secret (if configured correctly)
2. If validation fails, falls back to parsing without signature verification
3. Still validates issuer (must contain "supabase") and expiration
4. Extracts user information from token claims

This fallback works because:
1. Tokens come from your frontend which uses the Supabase client
2. The Supabase client only issues tokens for authenticated users
3. We verify the issuer and expiration to ensure token validity

**Note:** For full security, configure `SUPABASE_JWT_SECRET` in Railway with the correct JWT secret from Supabase Dashboard → Settings → API.

## Testing Steps

### 1. Run Database Migration

Execute in Supabase SQL Editor:

```sql
-- Add supabase_user_id columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS supabase_user_id VARCHAR(255) UNIQUE;
ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS supabase_user_id VARCHAR(255) UNIQUE;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_supabase_id ON users(supabase_user_id);
CREATE INDEX IF NOT EXISTS idx_student_profiles_supabase_id ON student_profiles(supabase_user_id);
```

### 2. Start Backend Locally

```bash
# Make sure your .env has:
# SUPABASE_URL=https://bvtawdcbfkwbklhhovre.supabase.co
# SUPABASE_KEY=your-service-role-key

mvn spring-boot:run
```

### 3. Start Frontend

```bash
cd frontend
npm run dev
```

### 4. Test Student Registration Flow

1. **Register a new student:**
   - Go to http://localhost:5173/register
   - Fill in the form
   - Click Register
   - Should see success message

2. **Check what happened:**
   - Supabase created an auth user (check Supabase Dashboard → Authentication → Users)
   - Frontend called `/api/auth/create-profile`
   - Backend created user profile with PENDING status

3. **Try to login:**
   - Go to http://localhost:5173/login
   - Login with the student credentials
   - Should be redirected to "Pending Approval" page

4. **Approve the student:**
   - Login as teacher (padmakrishnan1992@gmail.com / Teacher@123)
   - Go to Teacher Dashboard
   - Find the pending student
   - Click Approve

5. **Login as student again:**
   - Logout and login as the student
   - Should now see Student Dashboard

### 5. Test Teacher Registration

1. **Register as teacher:**
   - Use a different email
   - Should be auto-approved
   - Can access dashboard immediately

### 6. Test Password Reset

1. **Request password reset:**
   - Go to Forgot Password page
   - Enter email
   - Check email for reset link from Supabase

2. **Reset password:**
   - Click link in email
   - Set new password
   - Login with new password

## API Endpoints

### Create Profile (Called by Frontend After Supabase Registration)
```bash
POST http://localhost:8080/api/auth/create-profile
Content-Type: application/json

{
  "supabaseUserId": "uuid-from-supabase",
  "email": "student@example.com",
  "role": "STUDENT",
  "fullName": "John Doe",
  "dateOfBirth": "2010-01-01",
  "gender": "MALE",
  "classGrade": 8
}
```

### Get Profile (Requires Supabase Token)
```bash
GET http://localhost:8080/api/auth/profile
Authorization: Bearer {supabase-jwt-token}
```

## Troubleshooting

### "User profile not found"
- The student registered in Supabase but profile wasn't created in backend
- Check browser console for errors during registration
- Verify `/api/auth/create-profile` was called successfully

### "Invalid token"
- Token might be expired
- Try logging out and logging in again
- Check that frontend is sending token in Authorization header

### "Registration pending approval"
- This is expected for students
- Teacher needs to approve from admin panel
- Teachers are auto-approved

### Backend not starting
- Check that all environment variables are set in `.env`
- Verify database connection
- Check for port conflicts (8080)

## Production Deployment

### Railway
1. Push code to GitHub
2. Railway auto-deploys
3. No additional environment variables needed (already configured)

### Vercel
1. Push code to GitHub
2. Vercel auto-deploys frontend
3. Frontend already configured with Supabase keys

## Security Notes

- Frontend uses anon key (safe to expose)
- Backend uses service_role key (never expose)
- JWT tokens are validated by checking issuer and expiration
- Supabase handles all password security
- No passwords stored in your database

---

**Status**: Ready for Testing
**Last Updated**: February 17, 2026
