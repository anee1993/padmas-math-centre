# ECC JWT Key Fix for Supabase Authentication

## Problem
Supabase uses ECC (Elliptic Curve Cryptography) keys with the ES256 algorithm for JWT signing, but the application was configured to parse HMAC secrets (HS256). This caused JWT validation to fail during login.

## Root Cause
The JWT key format from Supabase is a JWK (JSON Web Key) with ECC P-256 curve:
```json
{
  "x": "YOUR_X_COORDINATE_HERE",
  "y": "YOUR_Y_COORDINATE_HERE",
  "alg": "ES256",
  "crv": "P-256",
  "ext": true,
  "kid": "YOUR_KEY_ID_HERE",
  "kty": "EC",
  "key_ops": ["verify"]
}
```

The previous implementation used `Keys.hmacShaKeyFor()` which expects a simple string secret for HMAC-SHA256, not an ECC public key.

## Solution

### 1. Added Nimbus JOSE JWT Library
Added dependency to `pom.xml` for parsing JWK format:
```xml
<dependency>
    <groupId>com.nimbusds</groupId>
    <artifactId>nimbus-jose-jwt</artifactId>
    <version>9.37.3</version>
</dependency>
```

### 2. Updated SupabaseJwtValidator
Modified the validator to:
- Parse JWK format using Nimbus JOSE library
- Extract ECC public key from JWK
- Validate JWT signatures using ES256 algorithm

Key changes:
```java
import com.nimbusds.jose.jwk.ECKey;
import java.security.interfaces.ECPublicKey;

private ECPublicKey getSigningKey() {
    try {
        ECKey ecKey = ECKey.parse(jwtSecret);
        return ecKey.toECPublicKey();
    } catch (Exception e) {
        System.err.println("Error parsing ECC JWK: " + e.getMessage());
        return null;
    }
}
```

### 3. Updated Environment Configuration
Added `SUPABASE_JWT_SECRET` to `.env` with the full JWK JSON:
```
SUPABASE_JWT_SECRET={"x":"YOUR_X_COORDINATE","y":"YOUR_Y_COORDINATE","alg":"ES256","crv":"P-256","ext":true,"kid":"YOUR_KEY_ID","kty":"EC","key_ops":["verify"]}
```

## How to Get Your Supabase JWT Secret

1. Go to your Supabase Dashboard
2. Navigate to: Settings > API > JWT Settings
3. Look for "JWT Secret" section
4. Copy the FULL JWK JSON object (not just the secret string)
5. Paste it as the value for `SUPABASE_JWT_SECRET` in your `.env` file

## Testing the Fix

1. Rebuild the application:
   ```bash
   mvn clean install
   ```

2. Restart the backend server

3. Try logging in through the frontend

4. Check the logs for:
   - "Attempting to validate token with ES256 signature..."
   - "Successfully extracted claims"
   - "Token validation successful"

## Key Differences: HMAC vs ECC

| Aspect | HMAC (HS256) | ECC (ES256) |
|--------|--------------|-------------|
| Algorithm | Symmetric | Asymmetric |
| Key Type | Shared secret | Public/Private key pair |
| Key Format | Simple string | JWK JSON object |
| Security | Good | Better (shorter keys, same security) |
| Supabase Default | No | Yes |

## Troubleshooting

### Error: "Error parsing ECC JWK"
- Ensure the JWK JSON is properly formatted
- Check that all required fields are present (x, y, alg, crv, kty)
- Verify no extra spaces or line breaks in the JSON

### Error: "JWT signature validation failed"
- Verify you're using the correct JWT secret from Supabase
- Ensure the JWK matches your Supabase project
- Check that the token is from the same Supabase project

### Still getting "Parsing token without signature validation"
- The `SUPABASE_JWT_SECRET` environment variable is not set
- The JWK parsing failed (check logs for errors)
- Restart the application after setting the environment variable

## Security Notes

- The JWK contains the PUBLIC key only (safe to use for verification)
- Never expose the private key (Supabase keeps this secure)
- ES256 provides equivalent security to RSA-2048 with much shorter keys
- Always use HTTPS in production to protect tokens in transit

## References

- [Supabase JWT Documentation](https://supabase.com/docs/guides/auth/jwts)
- [RFC 7517 - JSON Web Key (JWK)](https://tools.ietf.org/html/rfc7517)
- [RFC 7518 - JSON Web Algorithms (JWA)](https://tools.ietf.org/html/rfc7518)
- [Nimbus JOSE JWT Library](https://connect2id.com/products/nimbus-jose-jwt)
