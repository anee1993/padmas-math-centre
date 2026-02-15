package org.student.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.student.entity.LateSubmissionRequest;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LateSubmissionRequestDTO {
    private Long id;
    private Long assignmentId;
    private String assignmentTitle;
    private Long studentId;
    private String studentName;
    private String studentEmail;
    private String reason;
    private LateSubmissionRequest.RequestStatus status;
    private LocalDateTime requestedAt;
    private LocalDateTime respondedAt;
    private String teacherResponse;
}
