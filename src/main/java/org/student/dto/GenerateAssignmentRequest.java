package org.student.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GenerateAssignmentRequest {
    
    @NotNull(message = "Class grade is required")
    @Min(value = 6, message = "Class must be between 6 and 10")
    @Max(value = 10, message = "Class must be between 6 and 10")
    private Integer classGrade;
    
    @NotBlank(message = "Topic is required")
    private String topic;
    
    @NotNull(message = "Number of 1-mark questions is required")
    @Min(value = 0, message = "Cannot be negative")
    private Integer oneMarkQuestions;
    
    @NotNull(message = "Number of 2-mark questions is required")
    @Min(value = 0, message = "Cannot be negative")
    private Integer twoMarkQuestions;
    
    @NotNull(message = "Number of 3-mark questions is required")
    @Min(value = 0, message = "Cannot be negative")
    private Integer threeMarkQuestions;
    
    @NotNull(message = "Number of 5-mark questions is required")
    @Min(value = 0, message = "Cannot be negative")
    private Integer fiveMarkQuestions;
    
    @NotBlank(message = "Complexity is required")
    private String complexity; // EASY, MEDIUM, HARD
}
