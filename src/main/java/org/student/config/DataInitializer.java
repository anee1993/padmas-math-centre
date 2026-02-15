package org.student.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.student.entity.User;
import org.student.repository.UserRepository;
import org.student.service.VirtualClassroomService;

@Component
public class DataInitializer implements CommandLineRunner {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final VirtualClassroomService virtualClassroomService;
    
    @Value("${teacher.email}")
    private String teacherEmail;
    
    @Value("${teacher.password}")
    private String teacherPassword;
    
    @Value("${teacher.name}")
    private String teacherName;
    
    public DataInitializer(UserRepository userRepository, 
                          PasswordEncoder passwordEncoder,
                          VirtualClassroomService virtualClassroomService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.virtualClassroomService = virtualClassroomService;
    }
    
    @Override
    public void run(String... args) {
        // Create or update teacher account
        User teacher = userRepository.findByEmail(teacherEmail)
            .orElse(null);
        
        if (teacher == null) {
            // Check if old email exists and update it
            User oldTeacher = userRepository.findByEmail("teacher@mathtuition.com").orElse(null);
            if (oldTeacher != null) {
                // Update old teacher email to new email
                oldTeacher.setEmail(teacherEmail);
                oldTeacher.setFullName(teacherName);
                oldTeacher.setPasswordHash(passwordEncoder.encode(teacherPassword));
                userRepository.save(oldTeacher);
                System.out.println("Teacher email updated to: " + teacherEmail);
                System.out.println("Teacher password reset");
            } else {
                // Create new teacher account
                teacher = new User();
                teacher.setEmail(teacherEmail);
                teacher.setFullName(teacherName);
                teacher.setPasswordHash(passwordEncoder.encode(teacherPassword));
                teacher.setRole(User.Role.TEACHER);
                teacher.setStatus(User.RegistrationStatus.APPROVED);
                
                userRepository.save(teacher);
                System.out.println("Teacher account created: " + teacherEmail);
            }
        } else {
            // Update existing teacher account
            boolean updated = false;
            
            if (teacher.getFullName() == null || teacher.getFullName().isEmpty() || !teacher.getFullName().equals(teacherName)) {
                teacher.setFullName(teacherName);
                updated = true;
            }
            
            // Always ensure password is set correctly
            teacher.setPasswordHash(passwordEncoder.encode(teacherPassword));
            updated = true;
            
            if (updated) {
                userRepository.save(teacher);
                System.out.println("Teacher account updated: " + teacherEmail);
                System.out.println("Password confirmed");
            }
        }
        
        // Initialize virtual classrooms for grades 6-10
        virtualClassroomService.initializeClassrooms();
        System.out.println("Virtual classrooms initialized for grades 6-10");
    }
}
