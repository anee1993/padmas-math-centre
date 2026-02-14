package org.student.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateMeetingLinkRequest {
    
    @NotNull(message = "Class grade is required")
    private Integer classGrade;
    
    @NotBlank(message = "Meeting link is required")
    private String meetingLink;
}
