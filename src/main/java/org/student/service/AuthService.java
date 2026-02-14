package org.student.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.student.dto.LoginRequest;
import org.student.dto.LoginResponse;
import org.student.dto.StudentRegistrationRequest;
import org.student.dto.StudentRegistrationResponse;
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
