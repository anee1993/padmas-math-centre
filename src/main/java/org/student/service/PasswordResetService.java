package org.student.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.student.entity.PasswordResetToken;
import org.student.entity.User;
import org.student.exception.AuthenticationException;
import org.student.repository.PasswordResetTokenRepository;
import org.student.repository.UserRepository;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class PasswordResetService {
    
    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    
    private static final int OTP_LENGTH = 6;
    private static final int OTP_EXPIRY_MINUTES = 10;
    
    public PasswordResetService(UserRepository userRepository,
                               PasswordResetTokenRepository tokenRepository,
                               EmailService emailService,
                               PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
    }
    
    @Transactional
    public void sendPasswordResetOtp(String email) {
        // Check if user exists
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new AuthenticationException("No account found with this email"));
        
        // Delete any existing tokens for this email
        tokenRepository.deleteByEmail(email);
        
        // Generate OTP
        String otp = generateOtp();
        
        // Create and save token
        PasswordResetToken token = new PasswordResetToken();
        token.setEmail(email);
        token.setOtp(otp);
        token.setExpiresAt(LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES));
        token.setUsed(false);
        
        tokenRepository.save(token);
        
        // Send OTP via email
        emailService.sendOtpEmail(email, otp);
    }
    
    public boolean verifyOtp(String email, String otp) {
        Optional<PasswordResetToken> tokenOpt = tokenRepository
            .findByEmailAndOtpAndUsedFalseAndExpiresAtAfter(email, otp, LocalDateTime.now());
        
        return tokenOpt.isPresent();
    }
    
    @Transactional
    public void resetPassword(String email, String otp, String newPassword) {
        // Verify OTP
        PasswordResetToken token = tokenRepository
            .findByEmailAndOtpAndUsedFalseAndExpiresAtAfter(email, otp, LocalDateTime.now())
            .orElseThrow(() -> new AuthenticationException("Invalid or expired OTP"));
        
        // Get user
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new AuthenticationException("User not found"));
        
        // Update password
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        
        // Mark token as used
        token.setUsed(true);
        tokenRepository.save(token);
    }
    
    @Transactional
    public void cleanupExpiredTokens() {
        tokenRepository.deleteByExpiresAtBefore(LocalDateTime.now());
    }
    
    private String generateOtp() {
        SecureRandom random = new SecureRandom();
        StringBuilder otp = new StringBuilder();
        
        for (int i = 0; i < OTP_LENGTH; i++) {
            otp.append(random.nextInt(10));
        }
        
        return otp.toString();
    }
}
