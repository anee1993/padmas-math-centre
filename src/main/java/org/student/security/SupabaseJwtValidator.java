package org.student.security;

import com.nimbusds.jose.JWSVerifier;
import com.nimbusds.jose.crypto.ECDSAVerifier;
import com.nimbusds.jose.jwk.ECKey;
import com.nimbusds.jwt.SignedJWT;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.interfaces.ECPublicKey;
import java.util.Date;
import java.util.Map;

@Component
public class SupabaseJwtValidator {
    
    @Value("${supabase.url}")
    private String supabaseUrl;
    
    // Supabase JWT secret in JWK format (for ECC keys)
    @Value("${supabase.jwt.secret:}")
    private String jwtSecret;
    
    private ECPublicKey getSigningKey() {
        // If no JWT secret is configured, we can't validate signatures
        if (jwtSecret == null || jwtSecret.isEmpty()) {
            return null;
        }
        
        try {
            // Parse the JWK (JSON Web Key) format
            ECKey ecKey = ECKey.parse(jwtSecret);
            return ecKey.toECPublicKey();
        } catch (Exception e) {
            System.err.println("Error parsing ECC JWK: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }
    
    private SignedJWT parseAndVerifyToken(String token) {
        try {
            // Parse the JWT
            SignedJWT signedJWT = SignedJWT.parse(token);
            
            ECPublicKey publicKey = getSigningKey();
            
            if (publicKey != null) {
                // Verify the signature
                JWSVerifier verifier = new ECDSAVerifier(publicKey);
                
                if (signedJWT.verify(verifier)) {
                    System.out.println("JWT signature verified successfully with ES256");
                    return signedJWT;
                } else {
                    System.err.println("JWT signature verification failed");
                    throw new RuntimeException("Invalid JWT signature");
                }
            } else {
                System.out.println("WARNING: No public key configured, skipping signature verification");
                return signedJWT;
            }
        } catch (Exception e) {
            System.err.println("Error parsing/verifying JWT: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("JWT validation failed", e);
        }
    }
    
    public String extractUserId(String token) {
        try {
            SignedJWT signedJWT = parseAndVerifyToken(token);
            String userId = signedJWT.getJWTClaimsSet().getSubject();
            System.out.println("Extracted user ID from token: " + userId);
            return userId;
        } catch (Exception e) {
            System.err.println("Error extracting user ID: " + e.getMessage());
            throw new RuntimeException("Failed to extract user ID", e);
        }
    }
    
    public String extractEmail(String token) {
        try {
            SignedJWT signedJWT = parseAndVerifyToken(token);
            return signedJWT.getJWTClaimsSet().getStringClaim("email");
        } catch (Exception e) {
            System.err.println("Error extracting email: " + e.getMessage());
            throw new RuntimeException("Failed to extract email", e);
        }
    }
    
    public String extractRole(String token) {
        try {
            SignedJWT signedJWT = parseAndVerifyToken(token);
            Map<String, Object> userMetadata = signedJWT.getJWTClaimsSet().getJSONObjectClaim("user_metadata");
            
            if (userMetadata != null) {
                return (String) userMetadata.get("role");
            }
            
            return null;
        } catch (Exception e) {
            System.err.println("Error extracting role: " + e.getMessage());
            return null;
        }
    }
    
    public boolean isTokenExpired(String token) {
        try {
            SignedJWT signedJWT = parseAndVerifyToken(token);
            Date expirationTime = signedJWT.getJWTClaimsSet().getExpirationTime();
            return expirationTime != null && expirationTime.before(new Date());
        } catch (Exception e) {
            return true;
        }
    }
    
    public boolean validateToken(String token) {
        try {
            System.out.println("Starting token validation...");
            SignedJWT signedJWT = parseAndVerifyToken(token);
            
            // Verify issuer
            String issuer = signedJWT.getJWTClaimsSet().getIssuer();
            System.out.println("Token issuer: " + issuer);
            
            if (issuer == null || !issuer.contains("supabase")) {
                System.err.println("Invalid issuer: " + issuer);
                return false;
            }
            
            // Check expiration
            if (isTokenExpired(token)) {
                System.err.println("Token is expired");
                return false;
            }
            
            System.out.println("Token validation successful");
            return true;
        } catch (Exception e) {
            System.err.println("Token validation error: " + e.getClass().getName() + " - " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }
}
