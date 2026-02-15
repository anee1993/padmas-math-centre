package org.student.config;

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
        User teacher = userRepository.findByEmail("padmakrishnan1992@gmail.com")
            .orElse(null);
        
        if (teacher == null) {
            // Check if old email exists and update it
            User oldTeacher = userRepository.findByEmail("teacher@mathtuition.com").orElse(null);
            if (oldTeacher != null) {
                // Update old teacher email to new email
                oldTeacher.setEmail("padmakrishnan1992@gmail.com");
                oldTeacher.setFullName("A Padma");
                oldTeacher.setPasswordHash(passwordEncoder.encode("Teacher@123"));
                userRepository.save(oldTeacher);
                System.out.println("Teacher email updated to: padmakrishnan1992@gmail.com");
                System.out.println("Teacher password reset to: Teacher@123");
            } else {
                // Create new teacher account
                teacher = new User();
                teacher.setEmail("padmakrishnan1992@gmail.com");
                teacher.setFullName("A Padma");
                teacher.setPasswordHash(passwordEncoder.encode("Teacher@123"));
                teacher.setRole(User.Role.TEACHER);
                teacher.setStatus(User.RegistrationStatus.APPROVED);
                
                userRepository.save(teacher);
                System.out.println("Teacher account created: padmakrishnan1992@gmail.com / Teacher@123");
            }
        } else {
            // Update existing teacher account
            boolean updated = false;
            
            if (teacher.getFullName() == null || teacher.getFullName().isEmpty()) {
                teacher.setFullName("A Padma");
                updated = true;
            }
            
            // Always ensure password is set correctly
            teacher.setPasswordHash(passwordEncoder.encode("Teacher@123"));
            updated = true;
            
            if (updated) {
                userRepository.save(teacher);
                System.out.println("Teacher account updated: padmakrishnan1992@gmail.com");
                System.out.println("Password confirmed: Teacher@123");
            }
        }
        
        // Initialize virtual classrooms for grades 6-10
        virtualClassroomService.initializeClassrooms();
        System.out.println("Virtual classrooms initialized for grades 6-10");
    }
}
