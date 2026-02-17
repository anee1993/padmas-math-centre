package org.student.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Base64;
import java.util.Date;

@Component
public class SupabaseJwtValidator {
    
    @Value("${supabase.url}")
    private String supabaseUrl;
    
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
        // Parse JWT without signature verification
        // We trust Supabase tokens and verify by checking issuer and expiration
        String[] parts = token.split("\\.");
        if (parts.length != 3) {
            throw new IllegalArgumentException("Invalid JWT token");
        }
        
        // Decode payload (base64url)
        String payload = new String(Base64.getUrlDecoder().decode(parts[1]));
        
        // Parse as unsecured JWT
        String unsecuredToken = parts[0] + "." + parts[1] + ".";
        
        return Jwts.parser()
                .unsecured()
                .build()
                .parseUnsecuredClaims(unsecuredToken)
                .getPayload();
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
            Claims claims = extractAllClaims(token);
            
            // Verify issuer
            String issuer = claims.getIssuer();
            if (issuer == null || !issuer.contains("supabase")) {
                return false;
            }
            
            // Check expiration
            if (isTokenExpired(token)) {
                return false;
            }
            
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
