package org.student.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SubmitAssignmentRequest {
    
    @NotNull(message = "Assignment ID is required")
    private Long assignmentId;
    
    private String submissionText;
    
    private String attachmentUrl;
}
