# Quick Steps to Fix JWT Authentication

## What Changed
Your Supabase uses ECC keys (ES256), not HMAC keys (HS256). The code now properly parses ECC JWK format.

## Steps to Apply the Fix

### 1. Install Dependencies
```bash
mvn clean install
```
This will download the new Nimbus JOSE JWT library.

### 2. Verify Environment Variable
Check your `.env` file has the JWK format (get from Supabase Dashboard > Settings > API > JWT Settings):
```
SUPABASE_JWT_SECRET={"x":"YOUR_X_COORDINATE","y":"YOUR_Y_COORDINATE","alg":"ES256","crv":"P-256","ext":true,"kid":"YOUR_KEY_ID","kty":"EC","key_ops":["verify"]}
```

### 3. Restart Backend
```bash
# Stop current server (Ctrl+C)
# Then restart
mvn spring-boot:run
```

### 4. Test Login
- Open your frontend
- Try logging in with a valid user
- Check backend logs for "Token validation successful"

## What to Look For in Logs

✅ Success:
```
Attempting to validate token with ES256 signature...
Successfully extracted claims
Token validation successful
```

❌ Failure:
```
Error parsing ECC JWK: ...
JWT signature validation failed
```

## If It Still Fails

1. Double-check the JWK JSON has no line breaks or extra spaces
2. Verify the JWK is from your Supabase project (Settings > API > JWT Settings)
3. Ensure you restarted the backend after updating `.env`
4. Check that Maven successfully downloaded `nimbus-jose-jwt` library

## Files Modified
- `pom.xml` - Added Nimbus JOSE JWT dependency
- `src/main/java/org/student/security/SupabaseJwtValidator.java` - Updated to parse ECC JWK
- `.env` - Added SUPABASE_JWT_SECRET with JWK format
- `.env.example` - Updated with JWK format example

## Need Help?
See `ECC-JWT-FIX.md` for detailed explanation and troubleshooting.
