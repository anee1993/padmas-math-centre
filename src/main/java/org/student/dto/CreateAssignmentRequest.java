package org.student.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CreateAssignmentRequest {
    
    @NotBlank(message = "Title is required")
    @Size(min = 3, max = 200, message = "Title must be between 3 and 200 characters")
    private String title;
    
    @NotBlank(message = "Description is required")
    private String description;
    
    @NotNull(message = "Class grade is required")
    @Min(value = 6, message = "Class must be between 6 and 10")
    @Max(value = 10, message = "Class must be between 6 and 10")
    private Integer classGrade;
    
    @NotNull(message = "Due date is required")
    @Future(message = "Due date must be in the future")
    private LocalDateTime dueDate;
    
    @NotNull(message = "Total marks is required")
    @Min(value = 1, message = "Total marks must be at least 1")
    @Max(value = 200, message = "Total marks cannot exceed 200")
    private Integer totalMarks;
    
    private String attachmentUrl;
}
