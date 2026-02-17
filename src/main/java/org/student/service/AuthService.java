package org.student.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.student.dto.*;
import org.student.entity.StudentProfile;
import org.student.entity.User;
import org.student.exception.AuthenticationException;
import org.student.exception.RegistrationException;
import org.student.repository.StudentProfileRepository;
import org.student.repository.UserRepository;
import org.student.security.JwtUtil;

@Service
public class AuthService {
    
    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    
    public AuthService(UserRepository userRepository, 
                      StudentProfileRepository studentProfileRepository,
                      PasswordEncoder passwordEncoder, 
                      JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.studentProfileRepository = studentProfileRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }
    
    // New method for Supabase Auth
    @Transactional
    public ApiResponse createProfile(CreateProfileRequest request) {
        // Check if profile already exists
        if (userRepository.findBySupabaseUserId(request.getSupabaseUserId()).isPresent()) {
            throw new RegistrationException("Profile already exists for this user");
        }
        
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RegistrationException("Email already registered");
        }
        
        User user = new User();
        user.setSupabaseUserId(request.getSupabaseUserId());
        user.setEmail(request.getEmail());
        user.setFullName(request.getFullName());
        user.setPasswordHash(""); // Not used with Supabase Auth
        user.setRole(User.Role.valueOf(request.getRole()));
        
        // Students need approval, teachers are auto-approved
        if (user.getRole() == User.Role.STUDENT) {
            user.setStatus(User.RegistrationStatus.PENDING);
        } else {
            user.setStatus(User.RegistrationStatus.APPROVED);
        }
        
        User savedUser = userRepository.save(user);
        
        // Create student profile if role is STUDENT
        if (user.getRole() == User.Role.STUDENT) {
            StudentProfile profile = new StudentProfile();
            profile.setSupabaseUserId(request.getSupabaseUserId());
            profile.setUser(savedUser);
            profile.setFullName(request.getFullName());
            profile.setDateOfBirth(request.getDateOfBirth());
            profile.setGender(request.getGender());
            profile.setClassGrade(request.getClassGrade());
            
            studentProfileRepository.save(profile);
        }
        
        return new ApiResponse(true, "Profile created successfully");
    }
    
    // New method for Supabase Auth
    public ProfileResponse getProfile(String supabaseUserId) {
        User user = userRepository.findBySupabaseUserId(supabaseUserId)
            .orElseThrow(() -> new AuthenticationException("User profile not found"));
        
        ProfileResponse response = new ProfileResponse();
        response.setSupabaseUserId(user.getSupabaseUserId());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole().name());
        response.setFullName(user.getFullName());
        response.setApprovalStatus(user.getStatus() != null ? user.getStatus().name() : "APPROVED");
        
        // Add class grade for students
        if (user.getRole() == User.Role.STUDENT && user.getStudentProfile() != null) {
            response.setClassGrade(user.getStudentProfile().getClassGrade());
        }
        
        return response;
    }
    
    // Legacy methods - kept for backward compatibility during migration
    @Transactional
    public StudentRegistrationResponse registerStudent(StudentRegistrationRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RegistrationException("Email already registered");
        }
        
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(User.Role.STUDENT);
        user.setStatus(User.RegistrationStatus.PENDING);
        
        User savedUser = userRepository.save(user);
        
        StudentProfile profile = new StudentProfile();
        profile.setUser(savedUser);
        profile.setFullName(request.getFullName());
        profile.setDateOfBirth(request.getDateOfBirth());
        profile.setGender(request.getGender());
        profile.setClassGrade(request.getClassGrade());
        
        studentProfileRepository.save(profile);
        
        return new StudentRegistrationResponse(
            savedUser.getId(),
            savedUser.getEmail(),
            request.getFullName(),
            "PENDING",
            "Registration successful. Awaiting teacher approval."
        );
    }
    
    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new AuthenticationException("Invalid email or password"));
        
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new AuthenticationException("Invalid email or password");
        }
        
        if (user.getRole() == User.Role.STUDENT && user.getStatus() != User.RegistrationStatus.APPROVED) {
            throw new AuthenticationException("Registration pending approval. Please wait for teacher approval.");
        }
        
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        
        // Get full name - for teachers from user, for students from profile
        String fullName = user.getFullName();
        if (user.getRole() == User.Role.STUDENT && user.getStudentProfile() != null) {
            fullName = user.getStudentProfile().getFullName();
        }
        
        return new LoginResponse(
            token,
            user.getEmail(),
            user.getRole().name(),
            fullName,
            "Login successful"
        );
    }
}
