package org.student.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.student.entity.Assignment;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AssignmentDTO {
    private Long id;
    private String title;
    private String description;
    private Integer classGrade;
    private LocalDateTime dueDate;
    private Integer totalMarks;
    private String attachmentUrl;
    private Assignment.AssignmentStatus status;
    private LocalDateTime createdAt;
    private Boolean isOverdue;
    private Boolean hasSubmitted;
    private Boolean isGraded;
}
