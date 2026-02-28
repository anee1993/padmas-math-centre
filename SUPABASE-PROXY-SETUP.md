# Supabase Auth Proxy Setup

## Problem
Supabase has been blocked by Indian ISPs, preventing users in India from accessing Supabase services directly from their browsers.

## Solution
We've implemented a proxy layer in the Spring Boot backend that forwards authentication requests to Supabase. Since the backend is hosted on Railway (outside India), it can access Supabase without issues.

## Architecture

```
Indian User Browser → Railway Backend (Proxy) → Supabase
```

### Flow:
1. User makes auth request (login, signup, etc.) from browser
2. Request goes to `/api/supabase-proxy/*` endpoints on Railway backend
3. Backend forwards request to Supabase
4. Backend returns Supabase response to user

## Implementation Details

### Backend Components

1. **SupabaseAuthProxyService** (`src/main/java/org/student/service/SupabaseAuthProxyService.java`)
   - Handles HTTP requests to Supabase Auth API
   - Methods: signIn, signUp, signOut, getSession, resetPassword, refreshToken

2. **SupabaseProxyController** (`src/main/java/org/student/controller/SupabaseProxyController.java`)
   - REST endpoints that proxy auth requests
   - Endpoints:
     - `POST /api/supabase-proxy/auth/signin` - Sign in with email/password
     - `POST /api/supabase-proxy/auth/signup` - Sign up new user
     - `POST /api/supabase-proxy/auth/signout` - Sign out
     - `GET /api/supabase-proxy/auth/session` - Get current session
     - `POST /api/supabase-proxy/auth/reset-password` - Reset password
     - `POST /api/supabase-proxy/auth/refresh` - Refresh access token

3. **SecurityConfig** - Updated to allow proxy endpoints without authentication

### Frontend Components

1. **supabaseProxy.js** (`frontend/src/lib/supabaseProxy.js`)
   - Drop-in replacement for Supabase client
   - Routes all auth requests through backend proxy
   - Maintains same API as Supabase client for minimal code changes
   - Handles session management in localStorage

2. **AuthContext.jsx** - Updated to use `supabaseProxy` instead of direct Supabase client

## Configuration

### Environment Variables

Add to `.env` and Railway:

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_ANON_KEY=your-anon-key  # Same as SUPABASE_KEY
SUPABASE_JWT_SECRET=your-jwt-secret-in-jwk-format
```

### application.yml

```yaml
supabase:
  url: ${SUPABASE_URL}
  key: ${SUPABASE_KEY}
  anon:
    key: ${SUPABASE_ANON_KEY:${SUPABASE_KEY}}
  jwt:
    secret: ${SUPABASE_JWT_SECRET}
```

## Testing

### Test Sign In
```bash
curl -X POST http://localhost:8080/api/supabase-proxy/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Test Sign Up
```bash
curl -X POST http://localhost:8080/api/supabase-proxy/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email":"newuser@example.com",
    "password":"password123",
    "options": {
      "data": {
        "role": "STUDENT",
        "full_name": "Test User"
      }
    }
  }'
```

## Deployment

### Railway Backend
1. Ensure all environment variables are set in Railway dashboard
2. Deploy the updated backend code
3. Proxy endpoints will be available at: `https://your-app.railway.app/api/supabase-proxy/*`

### Vercel Frontend
1. Deploy the updated frontend code
2. Frontend will automatically use the proxy through the backend API

## Benefits

1. **Bypasses ISP Blocks**: Users in India can access Supabase through the proxy
2. **No User-Side Setup**: Users don't need VPN or any special configuration
3. **Minimal Code Changes**: Drop-in replacement for Supabase client
4. **Centralized Control**: All Supabase access goes through backend
5. **Future-Proof**: Easy to migrate to different auth provider later

## Limitations

1. **Additional Latency**: Extra hop through backend adds ~100-200ms
2. **Backend Dependency**: Auth requires backend to be running
3. **Rate Limiting**: All requests go through single backend, may hit rate limits faster

## Migration Path

If you want to move away from Supabase in the future:

1. **Firebase Auth**: Replace proxy with Firebase Admin SDK
2. **Custom Auth**: Implement JWT-based auth entirely in Spring Boot
3. **Auth0**: Use Auth0 SDK (accessible in India)

## Troubleshooting

### Issue: "Supabase request failed"
- Check Railway logs for detailed error
- Verify SUPABASE_URL and SUPABASE_ANON_KEY are correct
- Test Supabase access from Railway using curl

### Issue: "CORS error"
- Verify CorsConfig allows your frontend domain
- Check SecurityConfig permits `/api/supabase-proxy/**`

### Issue: "Session not persisting"
- Check browser localStorage for `supabase_session`
- Verify token expiration times
- Check if refresh token is working

## Security Notes

1. **HTTPS Only**: Always use HTTPS in production
2. **Token Storage**: Tokens stored in localStorage (consider httpOnly cookies for better security)
3. **Rate Limiting**: Consider adding rate limiting to proxy endpoints
4. **Logging**: Be careful not to log sensitive data (passwords, tokens)

## Support

For issues or questions:
1. Check Railway logs for backend errors
2. Check browser console for frontend errors
3. Verify all environment variables are set correctly
4. Test direct Supabase access from Railway using curl
