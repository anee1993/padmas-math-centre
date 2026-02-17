package org.student.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.student.entity.StudentProfile;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateProfileRequest {
    
    @NotBlank(message = "Supabase user ID is required")
    private String supabaseUserId;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;
    
    @NotBlank(message = "Role is required")
    private String role;
    
    @NotBlank(message = "Full name is required")
    private String fullName;
    
    // Student-specific fields (optional for teachers)
    private LocalDate dateOfBirth;
    private StudentProfile.Gender gender;
    private Integer classGrade;
}
