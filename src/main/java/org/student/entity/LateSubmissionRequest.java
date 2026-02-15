package org.student.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "late_submission_requests")
@Data
public class LateSubmissionRequest {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private Long assignmentId;
    
    @Column(nullable = false)
    private Long studentId;
    
    @Column(length = 500)
    private String reason;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RequestStatus status = RequestStatus.PENDING;
    
    @Column(nullable = false)
    private LocalDateTime requestedAt = LocalDateTime.now();
    
    private LocalDateTime respondedAt;
    
    private String teacherResponse;
    
    public enum RequestStatus {
        PENDING,
        APPROVED,
        REJECTED
    }
}
