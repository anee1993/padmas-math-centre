package org.student.controller;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.student.service.SupabaseAuthProxyService;

import java.util.Map;

@RestController
@RequestMapping("/api/supabase-proxy")
@CrossOrigin(origins = "*")
public class SupabaseProxyController {

    private final SupabaseAuthProxyService supabaseAuthProxyService;

    public SupabaseProxyController(SupabaseAuthProxyService supabaseAuthProxyService) {
        this.supabaseAuthProxyService = supabaseAuthProxyService;
    }

    /**
     * Proxy for sign in with password
     * POST /api/supabase-proxy/auth/signin
     */
    @PostMapping("/auth/signin")
    public ResponseEntity<?> signIn(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String password = request.get("password");
            
            if (email == null || password == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email and password are required"));
            }
            
            JsonNode response = supabaseAuthProxyService.signInWithPassword(email, password);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Proxy for sign up
     * POST /api/supabase-proxy/auth/signup
     */
    @PostMapping("/auth/signup")
    public ResponseEntity<?> signUp(@RequestBody Map<String, Object> request) {
        try {
            String email = (String) request.get("email");
            String password = (String) request.get("password");
            
            if (email == null || password == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email and password are required"));
            }
            
            @SuppressWarnings("unchecked")
            Map<String, Object> metadata = (Map<String, Object>) request.get("options");
            Map<String, Object> data = null;
            
            if (metadata != null && metadata.containsKey("data")) {
                @SuppressWarnings("unchecked")
                Map<String, Object> dataMap = (Map<String, Object>) metadata.get("data");
                data = dataMap;
            }
            
            JsonNode response = supabaseAuthProxyService.signUp(email, password, data);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Proxy for sign out
     * POST /api/supabase-proxy/auth/signout
     */
    @PostMapping("/auth/signout")
    public ResponseEntity<?> signOut(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            JsonNode response = supabaseAuthProxyService.signOut(token);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Proxy for get session
     * GET /api/supabase-proxy/auth/session
     */
    @GetMapping("/auth/session")
    public ResponseEntity<?> getSession(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            JsonNode response = supabaseAuthProxyService.getSession(token);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Proxy for password reset
     * POST /api/supabase-proxy/auth/reset-password
     */
    @PostMapping("/auth/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String redirectTo = request.get("redirectTo");
            
            if (email == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
            }
            
            JsonNode response = supabaseAuthProxyService.resetPasswordForEmail(email, redirectTo);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Proxy for token refresh
     * POST /api/supabase-proxy/auth/refresh
     */
    @PostMapping("/auth/refresh")
    public ResponseEntity<?> refreshToken(@RequestBody Map<String, String> request) {
        try {
            String refreshToken = request.get("refresh_token");
            
            if (refreshToken == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Refresh token is required"));
            }
            
            JsonNode response = supabaseAuthProxyService.refreshToken(refreshToken);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("error", e.getMessage()));
        }
    }
}
