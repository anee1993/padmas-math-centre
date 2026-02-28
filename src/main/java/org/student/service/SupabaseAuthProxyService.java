package org.student.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class SupabaseAuthProxyService {

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.anon.key}")
    private String supabaseAnonKey;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public SupabaseAuthProxyService() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Sign in with email and password
     */
    public JsonNode signInWithPassword(String email, String password) {
        String url = supabaseUrl + "/auth/v1/token?grant_type=password";
        
        Map<String, String> requestBody = new HashMap<>();
        requestBody.put("email", email);
        requestBody.put("password", password);
        
        return makeSupabaseRequest(url, requestBody);
    }

    /**
     * Sign up with email and password
     */
    public JsonNode signUp(String email, String password, Map<String, Object> metadata) {
        String url = supabaseUrl + "/auth/v1/signup";
        
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("email", email);
        requestBody.put("password", password);
        if (metadata != null && !metadata.isEmpty()) {
            requestBody.put("data", metadata);
        }
        
        return makeSupabaseRequest(url, requestBody);
    }

    /**
     * Sign out
     */
    public JsonNode signOut(String accessToken) {
        String url = supabaseUrl + "/auth/v1/logout";
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("apikey", supabaseAnonKey);
        headers.set("Authorization", "Bearer " + accessToken);
        
        HttpEntity<String> entity = new HttpEntity<>("{}", headers);
        
        try {
            ResponseEntity<String> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                entity,
                String.class
            );
            
            return objectMapper.readTree(response.getBody() != null ? response.getBody() : "{}");
        } catch (HttpClientErrorException e) {
            throw new RuntimeException("Supabase signout failed: " + e.getResponseBodyAsString());
        } catch (Exception e) {
            throw new RuntimeException("Supabase signout failed: " + e.getMessage());
        }
    }

    /**
     * Get current session
     */
    public JsonNode getSession(String accessToken) {
        String url = supabaseUrl + "/auth/v1/user";
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("apikey", supabaseAnonKey);
        headers.set("Authorization", "Bearer " + accessToken);
        
        HttpEntity<String> entity = new HttpEntity<>(headers);
        
        try {
            ResponseEntity<String> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                entity,
                String.class
            );
            
            return objectMapper.readTree(response.getBody());
        } catch (HttpClientErrorException e) {
            throw new RuntimeException("Failed to get session: " + e.getResponseBodyAsString());
        } catch (Exception e) {
            throw new RuntimeException("Failed to get session: " + e.getMessage());
        }
    }

    /**
     * Reset password
     */
    public JsonNode resetPasswordForEmail(String email, String redirectTo) {
        String url = supabaseUrl + "/auth/v1/recover";
        
        Map<String, String> requestBody = new HashMap<>();
        requestBody.put("email", email);
        if (redirectTo != null) {
            requestBody.put("redirect_to", redirectTo);
        }
        
        return makeSupabaseRequest(url, requestBody);
    }

    /**
     * Refresh token
     */
    public JsonNode refreshToken(String refreshToken) {
        String url = supabaseUrl + "/auth/v1/token?grant_type=refresh_token";
        
        Map<String, String> requestBody = new HashMap<>();
        requestBody.put("refresh_token", refreshToken);
        
        return makeSupabaseRequest(url, requestBody);
    }

    /**
     * Helper method to make Supabase requests
     */
    private JsonNode makeSupabaseRequest(String url, Map<String, ?> requestBody) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("apikey", supabaseAnonKey);
        
        HttpEntity<Map<String, ?>> entity = new HttpEntity<>(requestBody, headers);
        
        try {
            ResponseEntity<String> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                entity,
                String.class
            );
            
            return objectMapper.readTree(response.getBody());
        } catch (HttpClientErrorException e) {
            throw new RuntimeException("Supabase request failed: " + e.getResponseBodyAsString());
        } catch (Exception e) {
            throw new RuntimeException("Supabase request failed: " + e.getMessage());
        }
    }
}
