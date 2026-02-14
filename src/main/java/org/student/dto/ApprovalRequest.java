package org.student.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ApprovalRequest {
    @NotNull(message = "Student ID is required")
    private Long studentId;
    
    private String reason;
}
