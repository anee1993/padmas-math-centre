package org.student.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.student.validation.ValidSubmissionContent;

@Data
@ValidSubmissionContent(message = "Please provide either submission text or an attachment URL")
public class SubmitAssignmentRequest {
    
    @NotNull(message = "Assignment ID is required")
    private Long assignmentId;
    
    private String submissionText;
    
    private String attachmentUrl;
}
