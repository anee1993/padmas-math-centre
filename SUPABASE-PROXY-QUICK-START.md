# Supabase Proxy - Quick Start Guide

## What Changed?

We've added a proxy layer to bypass Supabase ISP blocks in India. All authentication now goes through your Railway backend instead of directly to Supabase.

## Setup Steps

### 1. Update Environment Variables

Add to your Railway environment variables:

```bash
SUPABASE_ANON_KEY=your-supabase-anon-key
```

**Note**: This is the same as your public anon key from Supabase Dashboard → Settings → API

### 2. Deploy Backend

The following files were added/modified:
- ✅ `src/main/java/org/student/service/SupabaseAuthProxyService.java` (NEW)
- ✅ `src/main/java/org/student/controller/SupabaseProxyController.java` (NEW)
- ✅ `src/main/java/org/student/security/SecurityConfig.java` (MODIFIED)
- ✅ `src/main/resources/application.yml` (MODIFIED)
- ✅ `frontend/src/lib/supabaseProxy.js` (NEW)
- ✅ `frontend/src/context/AuthContext.jsx` (MODIFIED)

Push to GitHub and Railway will auto-deploy.

### 3. Deploy Frontend

Push to GitHub and Vercel will auto-deploy.

### 4. Test

1. Open your app in a browser (from India)
2. Try to login/register
3. Should work without VPN!

## How It Works

**Before (Blocked in India):**
```
User Browser → Supabase ❌ (Blocked by ISP)
```

**After (Works in India):**
```
User Browser → Railway Backend → Supabase ✅
```

## Verification

Check Railway logs for these messages when users login:
```
POST /api/supabase-proxy/auth/signin
```

## Rollback

If something goes wrong, you can rollback by:

1. Change `frontend/src/context/AuthContext.jsx`:
   ```javascript
   import { supabase } from '../lib/supabase'; // Back to direct
   ```

2. Redeploy frontend

## Next Steps

- Monitor Railway logs for any proxy errors
- Consider adding rate limiting to proxy endpoints
- Plan migration to Firebase Auth for long-term solution

## Support

If users still can't access:
1. Check Railway is deployed and running
2. Verify SUPABASE_ANON_KEY is set in Railway
3. Check browser console for errors
4. Verify frontend is using the proxy (check Network tab)
