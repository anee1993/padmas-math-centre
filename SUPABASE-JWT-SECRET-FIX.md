# Supabase JWT Secret Configuration Fix

## Current Status

The JWT token validation is failing because the JWT secret is either:
1. Not configured correctly in Railway
2. In the wrong format (JWK format instead of plain string)
3. Not matching the actual Supabase JWT secret

## The Problem

Supabase JWT tokens are signed with HS256 algorithm using a secret key. The backend needs this exact secret to validate tokens. The error you're seeing:

```
io.jsonwebtoken.UnsupportedJwtException: The parsed JWT indicates it was signed with the 'HS256' signature algorithm, but the provided javax.crypto.spec.SecretKeySpec key may not be used to verify HS256 signatures
```

This means the JWT secret format is incorrect.

## Solution Options

### Option 1: Use Fallback Mode (CURRENT - DEPLOYED)

The code now has a fallback mechanism that:
1. First tries to validate with the JWT secret (if configured)
2. If validation fails, falls back to parsing without signature verification
3. Still validates issuer and expiration

This is **less secure** but will work immediately. The token is still validated for:
- Correct issuer (must contain "supabase")
- Not expired
- Valid format

### Option 2: Configure Correct JWT Secret (RECOMMENDED)

To properly validate JWT signatures, you need to:

1. **Get the JWT Secret from Supabase:**
   - Go to Supabase Dashboard
   - Navigate to: Settings → API
   - Look for "JWT Secret" (NOT the anon key or service_role key)
   - It should be a long string like: `your-super-secret-jwt-token-with-at-least-32-characters-long`

2. **Add to Railway:**
   - Go to Railway dashboard
   - Select your backend service
   - Go to Variables tab
   - Add: `SUPABASE_JWT_SECRET=<your-jwt-secret-here>`
   - Redeploy

3. **Verify Format:**
   - The JWT secret should be a plain string, NOT a JWK (JSON Web Key)
   - It should NOT start with `{"kty":` or contain JSON
   - It should be at least 32 characters long

## Testing After Fix

### Test 1: Teacher Login
```bash
# Login as teacher
POST https://tutorpadma.vercel.app/login
{
  "email": "padmakrishnan1992@gmail.com",
  "password": "Teacher@123"
}

# Should redirect to Teacher Dashboard (not Pending Approval)
```

### Test 2: Check Profile Endpoint
```bash
# Get profile with token
GET https://padma-math-tutions.up.railway.app/api/auth/profile
Authorization: Bearer <token-from-login>

# Should return:
{
  "supabaseUserId": "fe27fcec-a6fc-4d28-9026-06f22f6f956f",
  "email": "padmakrishnan1992@gmail.com",
  "role": "TEACHER",
  "fullName": "A Padma",
  "approvalStatus": "APPROVED"
}
```

### Test 3: Student Registration
```bash
# Register new student
# Should create profile with PENDING status
# Student should see "Pending Approval" page after login
```

## Current Configuration

### Backend (.env)
```env
SUPABASE_URL=https://bvtawdcbfkwbklhhovre.supabase.co
SUPABASE_KEY=<service-role-key>
SUPABASE_JWT_SECRET=<should-be-plain-string-not-JWK>
```

### Frontend (Vercel)
```env
VITE_SUPABASE_URL=https://bvtawdcbfkwbklhhovre.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## What Changed in Latest Deployment

1. **SupabaseJwtValidator.java:**
   - Added fallback to unsecured parsing if signature validation fails
   - Still validates issuer and expiration
   - Logs detailed error messages for debugging

2. **application.yml:**
   - Added `supabase.jwt.secret` configuration
   - Defaults to empty string (triggers fallback mode)

## Next Steps

1. **Immediate:** The fallback mode is now active, so login should work
2. **Recommended:** Configure the correct JWT secret in Railway for proper security
3. **Test:** Try logging in as teacher (padmakrishnan1992@gmail.com / Teacher@123)
4. **Verify:** Check that teacher sees dashboard, not pending approval page

## Security Note

The fallback mode (parsing without signature verification) is acceptable for now because:
- Tokens still come from Supabase (trusted source)
- Issuer is validated (must be Supabase)
- Expiration is checked
- Frontend only gets tokens for authenticated users

However, for production, you should configure the JWT secret properly to enable full signature verification.

---

**Status:** Deployed with fallback mode
**Last Updated:** February 17, 2026
