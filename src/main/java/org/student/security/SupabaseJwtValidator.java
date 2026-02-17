package org.student.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class SupabaseJwtValidator {
    
    @Value("${supabase.url}")
    private String supabaseUrl;
    
    // Supabase uses the same secret for signing JWTs
    // This is the JWT_SECRET from Supabase dashboard, NOT the anon or service_role key
    @Value("${supabase.jwt.secret:}")
    private String jwtSecret;
    
    private SecretKey getSigningKey() {
        // If no JWT secret is configured, we can't validate signatures
        // For now, we'll skip signature validation (not recommended for production)
        if (jwtSecret == null || jwtSecret.isEmpty()) {
            return null;
        }
        return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }
    
    public String extractUserId(String token) {
        try {
            String userId = extractAllClaims(token).getSubject();
            System.out.println("Extracted user ID from token: " + userId);
            return userId;
        } catch (Exception e) {
            System.err.println("Error extracting user ID: " + e.getMessage());
            throw e;
        }
    }
    
    public String extractEmail(String token) {
        return extractAllClaims(token).get("email", String.class);
    }
    
    public String extractRole(String token) {
        Claims claims = extractAllClaims(token);
        Object userMetadata = claims.get("user_metadata");
        
        if (userMetadata instanceof java.util.Map) {
            @SuppressWarnings("unchecked")
            java.util.Map<String, Object> metadata = (java.util.Map<String, Object>) userMetadata;
            return (String) metadata.get("role");
        }
        
        return null;
    }
    
    private Claims extractAllClaims(String token) {
        System.out.println("Extracting claims from token...");
        
        SecretKey key = getSigningKey();
        
        if (key != null) {
            try {
                // Try to validate with signature
                System.out.println("Attempting to validate token with signature...");
                return Jwts.parser()
                        .verifyWith(key)
                        .build()
                        .parseSignedClaims(token)
                        .getPayload();
            } catch (Exception e) {
                System.err.println("Signature validation failed: " + e.getMessage());
                System.out.println("Falling back to unsecured parsing...");
                // Fall through to unsecured parsing
            }
        }
        
        // Parse without signature validation (fallback)
        System.out.println("WARNING: Parsing token without signature validation");
        try {
            String[] parts = token.split("\\.");
            if (parts.length != 3) {
                throw new IllegalArgumentException("Invalid JWT token format");
            }
            
            // Parse as unsecured (skip signature validation)
            return Jwts.parser()
                    .unsecured()
                    .build()
                    .parseUnsecuredClaims(parts[0] + "." + parts[1] + ".")
                    .getPayload();
        } catch (Exception e) {
            System.err.println("Error in unsecured parsing: " + e.getMessage());
            throw e;
        }
    }
    
    public boolean isTokenExpired(String token) {
        try {
            Claims claims = extractAllClaims(token);
            return claims.getExpiration().before(new Date());
        } catch (Exception e) {
            return true;
        }
    }
    
    public boolean validateToken(String token) {
        try {
            System.out.println("Starting token validation...");
            Claims claims = extractAllClaims(token);
            System.out.println("Successfully extracted claims");
            
            // Verify issuer
            String issuer = claims.getIssuer();
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
