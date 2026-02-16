package org.student.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SubmitAssignmentRequest {
    
    @NotNull(message = "Assignment ID is required")
    private Long assignmentId;
    
    private String submissionText;
    
    private String attachmentUrl;
    
    // Custom validation: at least one of submissionText or attachmentUrl must be provided
    public boolean hasContent() {
        return (submissionText != null && !submissionText.trim().isEmpty()) ||
               (attachmentUrl != null && !attachmentUrl.trim().isEmpty());
    }
}
