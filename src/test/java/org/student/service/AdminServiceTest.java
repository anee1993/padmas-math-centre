package org.student.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.student.dto.EnrolledStudentDTO;
import org.student.dto.PendingStudentDTO;
import org.student.entity.StudentProfile;
import org.student.entity.User;
import org.student.exception.ResourceNotFoundException;
import org.student.repository.AssignmentSubmissionRepository;
import org.student.repository.PasswordResetTokenRepository;
import org.student.repository.UserRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private AssignmentSubmissionRepository submissionRepository;

    @Mock
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @InjectMocks
    private AdminService adminService;

    private User pendingStudent;
    private User approvedStudent;
    private User teacher;

    @BeforeEach
    void setUp() {
        // Setup pending student
        pendingStudent = createStudent(1L, "pending@test.com", "Pending Student", 
                                      User.RegistrationStatus.PENDING, 8);

        // Setup approved student
        approvedStudent = createStudent(2L, "approved@test.com", "Approved Student",
                                       User.RegistrationStatus.APPROVED, 9);

        // Setup teacher
        teacher = new User();
        teacher.setId(3L);
        teacher.setEmail("teacher@test.com");
        teacher.setRole(User.Role.TEACHER);
        teacher.setStatus(User.RegistrationStatus.APPROVED);
        teacher.setFullName("Test Teacher");
    }

    private User createStudent(Long id, String email, String name, 
                              User.RegistrationStatus status, Integer classGrade) {
        User user = new User();
        user.setId(id);
        user.setEmail(email);
        user.setRole(User.Role.STUDENT);
        user.setStatus(status);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        StudentProfile profile = new StudentProfile();
        profile.setUser(user);
        profile.setFullName(name);
        profile.setDateOfBirth(LocalDate.of(2010, 1, 1));
        profile.setGender(StudentProfile.Gender.MALE);
        profile.setClassGrade(classGrade);

        user.setStudentProfile(profile);
        return user;
    }

    @Test
    void getPendingRegistrations_ReturnsListOfPendingStudents() {
        // Arrange
        List<User> pendingUsers = Arrays.asList(pendingStudent);
        when(userRepository.findByRoleAndStatus(User.Role.STUDENT, User.RegistrationStatus.PENDING))
            .thenReturn(pendingUsers);

        // Act
        List<PendingStudentDTO> result = adminService.getPendingRegistrations();

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        PendingStudentDTO dto = result.get(0);
        assertEquals(pendingStudent.getId(), dto.getId());
        assertEquals(pendingStudent.getEmail(), dto.getEmail());
        assertEquals("Pending Student", dto.getFullName());
        assertEquals(8, dto.getClassGrade());

        verify(userRepository).findByRoleAndStatus(User.Role.STUDENT, User.RegistrationStatus.PENDING);
    }

    @Test
    void getPendingRegistrations_ReturnsEmptyList_WhenNoPendingStudents() {
        // Arrange
        when(userRepository.findByRoleAndStatus(User.Role.STUDENT, User.RegistrationStatus.PENDING))
            .thenReturn(Arrays.asList());

        // Act
        List<PendingStudentDTO> result = adminService.getPendingRegistrations();

        // Assert
        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    @Test
    void getEnrolledStudents_ReturnsListOfApprovedStudents() {
        // Arrange
        List<User> approvedUsers = Arrays.asList(approvedStudent);
        when(userRepository.findByRoleAndStatus(User.Role.STUDENT, User.RegistrationStatus.APPROVED))
            .thenReturn(approvedUsers);

        // Act
        List<EnrolledStudentDTO> result = adminService.getEnrolledStudents();

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        EnrolledStudentDTO dto = result.get(0);
        assertEquals(approvedStudent.getId(), dto.getId());
        assertEquals(approvedStudent.getEmail(), dto.getEmail());
        assertEquals("Approved Student", dto.getFullName());
        assertEquals(9, dto.getClassGrade());
    }

    @Test
    void getEnrolledStudents_SortsByClassGrade() {
        // Arrange
        User student1 = createStudent(1L, "s1@test.com", "Student 1", 
                                     User.RegistrationStatus.APPROVED, 10);
        User student2 = createStudent(2L, "s2@test.com", "Student 2",
                                     User.RegistrationStatus.APPROVED, 6);
        User student3 = createStudent(3L, "s3@test.com", "Student 3",
                                     User.RegistrationStatus.APPROVED, 8);

        when(userRepository.findByRoleAndStatus(User.Role.STUDENT, User.RegistrationStatus.APPROVED))
            .thenReturn(Arrays.asList(student1, student2, student3));

        // Act
        List<EnrolledStudentDTO> result = adminService.getEnrolledStudents();

        // Assert
        assertEquals(3, result.size());
        assertEquals(6, result.get(0).getClassGrade());
        assertEquals(8, result.get(1).getClassGrade());
        assertEquals(10, result.get(2).getClassGrade());
    }

    @Test
    void getEnrolledStudentsByClass_FiltersCorrectly() {
        // Arrange
        User student1 = createStudent(1L, "s1@test.com", "Student 1",
                                     User.RegistrationStatus.APPROVED, 8);
        User student2 = createStudent(2L, "s2@test.com", "Student 2",
                                     User.RegistrationStatus.APPROVED, 9);

        when(userRepository.findByRoleAndStatus(User.Role.STUDENT, User.RegistrationStatus.APPROVED))
            .thenReturn(Arrays.asList(student1, student2));

        // Act
        List<EnrolledStudentDTO> result = adminService.getEnrolledStudentsByClass(8);

        // Assert
        assertEquals(1, result.size());
        assertEquals(8, result.get(0).getClassGrade());
        assertEquals("Student 1", result.get(0).getFullName());
    }

    @Test
    void approveRegistration_Success() {
        // Arrange
        when(userRepository.findById(1L)).thenReturn(Optional.of(pendingStudent));
        when(userRepository.save(any(User.class))).thenReturn(pendingStudent);

        // Act
        adminService.approveRegistration(1L);

        // Assert
        assertEquals(User.RegistrationStatus.APPROVED, pendingStudent.getStatus());
        verify(userRepository).findById(1L);
        verify(userRepository).save(pendingStudent);
    }

    @Test
    void approveRegistration_StudentNotFound_ThrowsException() {
        // Arrange
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, 
            () -> adminService.approveRegistration(999L));
        verify(userRepository).findById(999L);
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void approveRegistration_NotStudent_ThrowsException() {
        // Arrange
        when(userRepository.findById(3L)).thenReturn(Optional.of(teacher));

        // Act & Assert
        IllegalArgumentException exception = assertThrows(
            IllegalArgumentException.class,
            () -> adminService.approveRegistration(3L)
        );
        assertEquals("User is not a student", exception.getMessage());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void approveRegistration_NotPending_ThrowsException() {
        // Arrange
        when(userRepository.findById(2L)).thenReturn(Optional.of(approvedStudent));

        // Act & Assert
        IllegalStateException exception = assertThrows(
            IllegalStateException.class,
            () -> adminService.approveRegistration(2L)
        );
        assertTrue(exception.getMessage().contains("not in pending state"));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void rejectRegistration_Success() {
        // Arrange
        when(userRepository.findById(1L)).thenReturn(Optional.of(pendingStudent));
        when(userRepository.save(any(User.class))).thenReturn(pendingStudent);

        // Act
        adminService.rejectRegistration(1L, "Does not meet requirements");

        // Assert
        assertEquals(User.RegistrationStatus.REJECTED, pendingStudent.getStatus());
        verify(userRepository).save(pendingStudent);
    }

    @Test
    void deleteStudent_Success_CascadesDeletes() {
        // Arrange
        when(userRepository.findById(2L)).thenReturn(Optional.of(approvedStudent));
        when(submissionRepository.findByStudentId(2L)).thenReturn(Arrays.asList());

        // Act
        adminService.deleteStudent(2L);

        // Assert
        verify(userRepository).findById(2L);
        verify(submissionRepository).findByStudentId(2L);
        verify(submissionRepository).deleteAll(any());
        verify(passwordResetTokenRepository).deleteByEmail(approvedStudent.getEmail());
        verify(userRepository).delete(approvedStudent);
    }

    @Test
    void deleteStudent_NotFound_ThrowsException() {
        // Arrange
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class,
            () -> adminService.deleteStudent(999L));
        verify(userRepository, never()).delete(any(User.class));
    }

    @Test
    void deleteStudent_NotStudent_ThrowsException() {
        // Arrange
        when(userRepository.findById(3L)).thenReturn(Optional.of(teacher));

        // Act & Assert
        IllegalArgumentException exception = assertThrows(
            IllegalArgumentException.class,
            () -> adminService.deleteStudent(3L)
        );
        assertEquals("User is not a student", exception.getMessage());
        verify(userRepository, never()).delete(any(User.class));
    }
}
