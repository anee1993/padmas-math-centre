package org.student.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.student.entity.User;
import org.student.repository.UserRepository;

import java.io.IOException;
import java.util.Collections;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    private final SupabaseJwtValidator supabaseJwtValidator;
    private final UserRepository userRepository;
    
    public JwtAuthenticationFilter(SupabaseJwtValidator supabaseJwtValidator, UserRepository userRepository) {
        this.supabaseJwtValidator = supabaseJwtValidator;
        this.userRepository = userRepository;
    }
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        final String authHeader = request.getHeader("Authorization");
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }
        
        try {
            final String jwt = authHeader.substring(7);
            System.out.println("Validating JWT token...");
            
            if (supabaseJwtValidator.validateToken(jwt)) {
                final String supabaseUserId = supabaseJwtValidator.extractUserId(jwt);
                System.out.println("Token valid, user ID: " + supabaseUserId);
                
                if (supabaseUserId != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    // Load user from database
                    User user = userRepository.findBySupabaseUserId(supabaseUserId).orElse(null);
                    
                    if (user != null) {
                        String role = user.getRole().name();
                        System.out.println("Found user in DB: " + user.getEmail() + ", role: " + role);
                        
                        SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + role);
                        System.out.println("Setting authority: " + authority.getAuthority());
                        
                        // Use email as principal so authentication.getName() returns email
                        // The 3-parameter constructor automatically sets authenticated=true
                        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                                user.getEmail(),  // Use email as principal, not supabaseUserId
                                null,
                                Collections.singletonList(authority)
                        );
                        
                        authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(authToken);
                        
                        System.out.println("=== AUTHENTICATION DEBUG ===");
                        System.out.println("Principal: " + user.getEmail());
                        System.out.println("Authorities: " + authToken.getAuthorities());
                        System.out.println("Authority string: " + authority.getAuthority());
                        System.out.println("Is authenticated: " + authToken.isAuthenticated());
                        System.out.println("===========================");
                    } else {
                        System.err.println("User not found in database for Supabase ID: " + supabaseUserId);
                    }
                }
            } else {
                System.err.println("Token validation failed");
            }
        } catch (Exception e) {
            System.err.println("JWT authentication failed: " + e.getMessage());
            e.printStackTrace();
        }
        
        filterChain.doFilter(request, response);
    }
}
