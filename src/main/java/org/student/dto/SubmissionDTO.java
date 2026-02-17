package org.student.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.student.entity.AssignmentSubmission;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubmissionDTO {
    private Long id;
    private Long assignmentId;
    private Long studentId;
    private String studentName;
    private String studentEmail;
    private String submissionText;
    private String attachmentUrl;
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", timezone = "UTC")
    private LocalDateTime submittedAt;
    
    private AssignmentSubmission.SubmissionStatus status;
    private Boolean isLate;
    private Integer marksObtained;
    private String feedback;
}
