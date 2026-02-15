package org.student.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.student.entity.LateSubmissionRequest;

@Data
public class RespondToLateSubmissionRequest {
    
    @NotNull(message = "Request ID is required")
    private Long requestId;
    
    @NotNull(message = "Status is required")
    private LateSubmissionRequest.RequestStatus status;
    
    private String teacherResponse;
}
