package org.student.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.student.dto.EnrolledStudentDTO;
import org.student.dto.PendingStudentDTO;
import org.student.entity.User;
import org.student.exception.ResourceNotFoundException;
import org.student.repository.UserRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminService {
    
    private final UserRepository userRepository;
    
    public AdminService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
    
    public List<PendingStudentDTO> getPendingRegistrations() {
        List<User> pendingUsers = userRepository.findByRoleAndStatus(
            User.Role.STUDENT, 
            User.RegistrationStatus.PENDING
        );
        
        return pendingUsers.stream()
            .map(user -> new PendingStudentDTO(
                user.getId(),
                user.getEmail(),
                user.getStudentProfile().getFullName(),
                user.getStudentProfile().getDateOfBirth(),
                user.getStudentProfile().getGender(),
                user.getStudentProfile().getClassGrade(),
                user.getCreatedAt()
            ))
            .collect(Collectors.toList());
    }
    
    public List<EnrolledStudentDTO> getEnrolledStudents() {
        List<User> enrolledUsers = userRepository.findByRoleAndStatus(
            User.Role.STUDENT,
            User.RegistrationStatus.APPROVED
        );
        
        return enrolledUsers.stream()
            .map(user -> new EnrolledStudentDTO(
                user.getId(),
                user.getEmail(),
                user.getStudentProfile().getFullName(),
                user.getStudentProfile().getDateOfBirth(),
                user.getStudentProfile().getGender(),
                user.getStudentProfile().getClassGrade(),
                user.getUpdatedAt()
            ))
            .sorted((a, b) -> a.getClassGrade().compareTo(b.getClassGrade()))
            .collect(Collectors.toList());
    }
    
    public List<EnrolledStudentDTO> getEnrolledStudentsByClass(Integer classGrade) {
        List<User> enrolledUsers = userRepository.findByRoleAndStatus(
            User.Role.STUDENT,
            User.RegistrationStatus.APPROVED
        );
        
        return enrolledUsers.stream()
            .filter(user -> user.getStudentProfile().getClassGrade().equals(classGrade))
            .map(user -> new EnrolledStudentDTO(
                user.getId(),
                user.getEmail(),
                user.getStudentProfile().getFullName(),
                user.getStudentProfile().getDateOfBirth(),
                user.getStudentProfile().getGender(),
                user.getStudentProfile().getClassGrade(),
                user.getUpdatedAt()
            ))
            .collect(Collectors.toList());
    }
    
    @Transactional
    public void approveRegistration(Long studentId) {
        User user = userRepository.findById(studentId)
            .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        
        if (user.getRole() != User.Role.STUDENT) {
            throw new IllegalArgumentException("User is not a student");
        }
        
        if (user.getStatus() != User.RegistrationStatus.PENDING) {
            throw new IllegalStateException("Registration is not in pending state");
        }
        
        user.setStatus(User.RegistrationStatus.APPROVED);
        userRepository.save(user);
    }
    
    @Transactional
    public void rejectRegistration(Long studentId, String reason) {
        User user = userRepository.findById(studentId)
            .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        
        if (user.getRole() != User.Role.STUDENT) {
            throw new IllegalArgumentException("User is not a student");
        }
        
        if (user.getStatus() != User.RegistrationStatus.PENDING) {
            throw new IllegalStateException("Registration is not in pending state");
        }
        
        user.setStatus(User.RegistrationStatus.REJECTED);
        userRepository.save(user);
    }
}
