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
            
            if (supabaseJwtValidator.validateToken(jwt)) {
                final String supabaseUserId = supabaseJwtValidator.extractUserId(jwt);
                
                if (supabaseUserId != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    // Load user from database
                    User user = userRepository.findBySupabaseUserId(supabaseUserId).orElse(null);
                    
                    if (user != null) {
                        String role = user.getRole().name();
                        
                        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                                supabaseUserId,
                                null,
                                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role))
                        );
                        authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(authToken);
                    }
                }
            }
        } catch (Exception e) {
            logger.error("JWT authentication failed", e);
        }
        
        filterChain.doFilter(request, response);
    }
}
