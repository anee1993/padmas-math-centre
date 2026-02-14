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
        User teacher = userRepository.findByEmail("teacher@mathtuition.com")
            .orElse(null);
        
        if (teacher == null) {
            // Create new teacher account
            teacher = new User();
            teacher.setEmail("teacher@mathtuition.com");
            teacher.setFullName("A Padma");
            teacher.setPasswordHash(passwordEncoder.encode("Teacher@123"));
            teacher.setRole(User.Role.TEACHER);
            teacher.setStatus(User.RegistrationStatus.APPROVED);
            
            userRepository.save(teacher);
            System.out.println("Teacher account created: teacher@mathtuition.com / Teacher@123");
        } else if (teacher.getFullName() == null || teacher.getFullName().isEmpty()) {
            // Update existing teacher account with name
            teacher.setFullName("A Padma");
            userRepository.save(teacher);
            System.out.println("Teacher account updated with name: A Padma");
        }
        
        // Initialize virtual classrooms for grades 6-10
        virtualClassroomService.initializeClassrooms();
        System.out.println("Virtual classrooms initialized for grades 6-10");
    }
}
