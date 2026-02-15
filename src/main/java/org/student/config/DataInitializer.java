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
    private String teacherDefaultPassword;
    
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
        // Check if teacher account exists
        User teacher = userRepository.findByEmail(teacherEmail).orElse(null);
        
        if (teacher == null) {
            // Check if old email exists and migrate it
            User oldTeacher = userRepository.findByEmail("teacher@mathtuition.com").orElse(null);
            if (oldTeacher != null) {
                // Migrate old teacher account to new email
                oldTeacher.setEmail(teacherEmail);
                oldTeacher.setFullName(teacherName);
                // Keep existing password - don't reset it
                userRepository.save(oldTeacher);
                System.out.println("Teacher account migrated to: " + teacherEmail);
                System.out.println("Password unchanged - use forgot password to reset if needed");
            } else {
                // Create new teacher account with default password
                teacher = new User();
                teacher.setEmail(teacherEmail);
                teacher.setFullName(teacherName);
                teacher.setPasswordHash(passwordEncoder.encode(teacherDefaultPassword));
                teacher.setRole(User.Role.TEACHER);
                teacher.setStatus(User.RegistrationStatus.APPROVED);
                
                userRepository.save(teacher);
                System.out.println("=".repeat(60));
                System.out.println("NEW TEACHER ACCOUNT CREATED");
                System.out.println("Email: " + teacherEmail);
                System.out.println("Default Password: " + teacherDefaultPassword);
                System.out.println("IMPORTANT: Please change this password after first login!");
                System.out.println("=".repeat(60));
            }
        } else {
            // Teacher account exists - update name if needed but DON'T touch password
            if (teacher.getFullName() == null || !teacher.getFullName().equals(teacherName)) {
                teacher.setFullName(teacherName);
                userRepository.save(teacher);
                System.out.println("Teacher name updated to: " + teacherName);
            }
            System.out.println("Teacher account exists: " + teacherEmail);
            System.out.println("Use forgot password feature to reset password if needed");
        }
        
        // Initialize virtual classrooms for grades 6-10
        virtualClassroomService.initializeClassrooms();
        System.out.println("Virtual classrooms initialized for grades 6-10");
    }
}
