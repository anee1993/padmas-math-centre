package org.student.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.student.dto.*;
import org.student.service.AuthService;
import org.student.service.PasswordResetService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
    private final AuthService authService;
    private final PasswordResetService passwordResetService;
    
    public AuthController(AuthService authService, PasswordResetService passwordResetService) {
        this.authService = authService;
        this.passwordResetService = passwordResetService;
    }
    
    // New Supabase Auth endpoints
    @PostMapping("/create-profile")
    public ResponseEntity<ApiResponse> createProfile(@Valid @RequestBody CreateProfileRequest request) {
        System.out.println("=== CREATE PROFILE REQUEST ===");
        System.out.println("Supabase User ID: " + request.getSupabaseUserId());
        System.out.println("Email: " + request.getEmail());
        System.out.println("Role: " + request.getRole());
        System.out.println("Full Name: " + request.getFullName());
        System.out.println("Date of Birth: " + request.getDateOfBirth());
        System.out.println("Gender: " + request.getGender());
        System.out.println("Class Grade: " + request.getClassGrade());
        System.out.println("==============================");
        
        ApiResponse response = authService.createProfile(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @GetMapping("/profile")
    public ResponseEntity<ProfileResponse> getProfile(Authentication authentication) {
        // authentication.getPrincipal() now returns email (not supabaseUserId)
        String email = (String) authentication.getPrincipal();
        ProfileResponse response = authService.getProfileByEmail(email);
        return ResponseEntity.ok(response);
    }
    
    // Legacy endpoints - kept for backward compatibility
    @PostMapping("/register")
    public ResponseEntity<StudentRegistrationResponse> registerStudent(
            @Valid @RequestBody StudentRegistrationRequest request) {
        StudentRegistrationResponse response = authService.registerStudent(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        passwordResetService.sendPasswordResetOtp(request.getEmail());
        return ResponseEntity.ok(new ApiResponse(true, "OTP sent to your email. Please check your inbox."));
    }
    
    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        boolean isValid = passwordResetService.verifyOtp(request.getEmail(), request.getOtp());
        if (isValid) {
            return ResponseEntity.ok(new ApiResponse(true, "OTP verified successfully"));
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ApiResponse(false, "Invalid or expired OTP"));
        }
    }
    
    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        passwordResetService.resetPassword(request.getEmail(), request.getOtp(), request.getNewPassword());
        return ResponseEntity.ok(new ApiResponse(true, "Password reset successfully. You can now login with your new password."));
    }
}
