package org.student.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.student.dto.StudentProfileDTO;
import org.student.entity.User;
import org.student.exception.ResourceNotFoundException;
import org.student.repository.UserRepository;

@RestController
@RequestMapping("/api/student")
public class StudentController {
    
    private final UserRepository userRepository;
    
    public StudentController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
    
    @GetMapping("/profile")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<StudentProfileDTO> getProfile(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        if (user.getStudentProfile() == null) {
            throw new ResourceNotFoundException("Student profile not found");
        }
        
        StudentProfileDTO profile = new StudentProfileDTO(
            user.getStudentProfile().getId(),
            user.getStudentProfile().getFullName(),
            user.getStudentProfile().getDateOfBirth(),
            user.getStudentProfile().getGender(),
            user.getStudentProfile().getClassGrade()
        );
        
        return ResponseEntity.ok(profile);
    }
}
