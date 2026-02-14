package org.student.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import org.student.entity.StudentProfile;

import java.time.LocalDate;

@Data
public class StudentRegistrationRequest {
    
    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    private String fullName;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;
    
    @NotBlank(message = "Password is required")
    @Pattern(
        regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$",
        message = "Password must be at least 8 characters with 1 uppercase, 1 lowercase, and 1 number"
    )
    private String password;
    
    @NotNull(message = "Date of birth is required")
    @Past(message = "Date of birth must be in the past")
    private LocalDate dateOfBirth;
    
    @NotNull(message = "Gender is required")
    private StudentProfile.Gender gender;
    
    @NotNull(message = "Class grade is required")
    @Min(value = 6, message = "Class must be between 6 and 10")
    @Max(value = 10, message = "Class must be between 6 and 10")
    private Integer classGrade;
}
