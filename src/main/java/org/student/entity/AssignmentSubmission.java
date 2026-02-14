package org.student.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "assignment_submissions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AssignmentSubmission {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private Long assignmentId;
    
    @Column(nullable = false)
    private Long studentId;
    
    @Column(columnDefinition = "TEXT")
    private String submissionText;
    
    private String attachmentUrl;
    
    private LocalDateTime submittedAt;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SubmissionStatus status;
    
    @Column(nullable = false)
    private Boolean isLate;
    
    private Integer marksObtained;
    
    @Column(columnDefinition = "TEXT")
    private String feedback;
    
    public enum SubmissionStatus {
        PENDING, SUBMITTED, GRADED
    }
    
    // Explicit getters and setters for marksObtained and feedback
    public Integer getMarksObtained() {
        return marksObtained;
    }
    
    public void setMarksObtained(Integer marksObtained) {
        this.marksObtained = marksObtained;
    }
    
    public String getFeedback() {
        return feedback;
    }
    
    public void setFeedback(String feedback) {
        this.feedback = feedback;
    }
}
