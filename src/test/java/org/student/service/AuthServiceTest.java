package org.student.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
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

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private StudentProfileRepository studentProfileRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private AuthService authService;

    private StudentRegistrationRequest registrationRequest;
    private User mockUser;
    private StudentProfile mockProfile;

    @BeforeEach
    void setUp() {
        registrationRequest = new StudentRegistrationRequest();
        registrationRequest.setEmail("student@test.com");
        registrationRequest.setPassword("Test@123");
        registrationRequest.setFullName("Test Student");
        registrationRequest.setDateOfBirth(LocalDate.of(2010, 1, 1));
        registrationRequest.setGender(StudentProfile.Gender.MALE);
        registrationRequest.setClassGrade(8);

        mockUser = new User();
        mockUser.setId(1L);
        mockUser.setEmail("student@test.com");
        mockUser.setPasswordHash("hashedPassword");
        mockUser.setRole(User.Role.STUDENT);
        mockUser.setStatus(User.RegistrationStatus.APPROVED);

        mockProfile = new StudentProfile();
        mockProfile.setUser(mockUser);
        mockProfile.setFullName("Test Student");
        mockProfile.setClassGrade(8);
        mockUser.setStudentProfile(mockProfile);
    }

    @Test
    void registerStudent_Success() {
        // Arrange
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("hashedPassword");
        when(userRepository.save(any(User.class))).thenReturn(mockUser);
        when(studentProfileRepository.save(any(StudentProfile.class))).thenReturn(mockProfile);

        // Act
        StudentRegistrationResponse response = authService.registerStudent(registrationRequest);

        // Assert
        assertNotNull(response);
        assertEquals("student@test.com", response.getEmail());
        assertEquals("Test Student", response.getFullName());
        assertEquals("PENDING", response.getStatus());
        assertTrue(response.getMessage().contains("Awaiting teacher approval"));

        verify(userRepository).existsByEmail("student@test.com");
        verify(passwordEncoder).encode("Test@123");
        verify(userRepository).save(any(User.class));
        verify(studentProfileRepository).save(any(StudentProfile.class));
    }

    @Test
    void registerStudent_EmailAlreadyExists_ThrowsException() {
        // Arrange
        when(userRepository.existsByEmail(anyString())).thenReturn(true);

        // Act & Assert
        RegistrationException exception = assertThrows(
            RegistrationException.class,
            () -> authService.registerStudent(registrationRequest)
        );

        assertEquals("Email already registered", exception.getMessage());
        verify(userRepository).existsByEmail("student@test.com");
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void login_Success_Student() {
        // Arrange
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("student@test.com");
        loginRequest.setPassword("Test@123");
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(mockUser));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(true);
        when(jwtUtil.generateToken(anyString(), anyString())).thenReturn("jwt-token");

        // Act
        LoginResponse response = authService.login(loginRequest);

        // Assert
        assertNotNull(response);
        assertEquals("jwt-token", response.getToken());
        assertEquals("student@test.com", response.getEmail());
        assertEquals("STUDENT", response.getRole());
        assertEquals("Test Student", response.getFullName());
        assertEquals("Login successful", response.getMessage());

        verify(userRepository).findByEmail("student@test.com");
        verify(passwordEncoder).matches("Test@123", "hashedPassword");
        verify(jwtUtil).generateToken("student@test.com", "STUDENT");
    }

    @Test
    void login_Success_Teacher() {
        // Arrange
        User teacher = new User();
        teacher.setEmail("teacher@test.com");
        teacher.setPasswordHash("hashedPassword");
        teacher.setRole(User.Role.TEACHER);
        teacher.setStatus(User.RegistrationStatus.APPROVED);
        teacher.setFullName("Test Teacher");

        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("teacher@test.com");
        loginRequest.setPassword("Teacher@123");
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(teacher));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(true);
        when(jwtUtil.generateToken(anyString(), anyString())).thenReturn("jwt-token");

        // Act
        LoginResponse response = authService.login(loginRequest);

        // Assert
        assertNotNull(response);
        assertEquals("Test Teacher", response.getFullName());
        assertEquals("TEACHER", response.getRole());
    }

    @Test
    void login_InvalidEmail_ThrowsException() {
        // Arrange
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("invalid@test.com");
        loginRequest.setPassword("Test@123");
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());

        // Act & Assert
        AuthenticationException exception = assertThrows(
            AuthenticationException.class,
            () -> authService.login(loginRequest)
        );

        assertEquals("Invalid email or password", exception.getMessage());
        verify(userRepository).findByEmail("invalid@test.com");
        verify(passwordEncoder, never()).matches(anyString(), anyString());
    }

    @Test
    void login_InvalidPassword_ThrowsException() {
        // Arrange
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("student@test.com");
        loginRequest.setPassword("WrongPassword");
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(mockUser));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(false);

        // Act & Assert
        AuthenticationException exception = assertThrows(
            AuthenticationException.class,
            () -> authService.login(loginRequest)
        );

        assertEquals("Invalid email or password", exception.getMessage());
        verify(passwordEncoder).matches("WrongPassword", "hashedPassword");
        verify(jwtUtil, never()).generateToken(anyString(), anyString());
    }

    @Test
    void login_PendingApproval_ThrowsException() {
        // Arrange
        mockUser.setStatus(User.RegistrationStatus.PENDING);
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("student@test.com");
        loginRequest.setPassword("Test@123");
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(mockUser));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(true);

        // Act & Assert
        AuthenticationException exception = assertThrows(
            AuthenticationException.class,
            () -> authService.login(loginRequest)
        );

        assertTrue(exception.getMessage().contains("pending approval"));
        verify(jwtUtil, never()).generateToken(anyString(), anyString());
    }

    @Test
    void login_RejectedStudent_ThrowsException() {
        // Arrange
        mockUser.setStatus(User.RegistrationStatus.REJECTED);
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("student@test.com");
        loginRequest.setPassword("Test@123");
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(mockUser));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(true);

        // Act & Assert
        AuthenticationException exception = assertThrows(
            AuthenticationException.class,
            () -> authService.login(loginRequest)
        );

        assertTrue(exception.getMessage().contains("pending approval"));
    }
}
