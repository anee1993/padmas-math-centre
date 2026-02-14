package org.student.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "assignments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Assignment {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Getter
    @Setter
    private Long id;
    
    @Column(nullable = false)
    @Getter
    @Setter
    private String title;
    
    @Column(columnDefinition = "TEXT")
    @Getter
    @Setter
    private String description;
    
    @Column(nullable = false)
    @Getter
    @Setter
    private Integer classGrade;
    
    @Column(nullable = false)
    @Getter
    @Setter
    private LocalDateTime dueDate;
    
    @Column(nullable = false)
    @Getter
    @Setter
    private Integer totalMarks;

    @Getter
    @Setter
    private String attachmentUrl;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Getter
    @Setter
    private AssignmentStatus status;
    
    @Column(nullable = false)
    @Getter
    @Setter
    private Long createdBy;
    
    @CreationTimestamp
    @Getter
    @Setter
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Getter
    @Setter
    private LocalDateTime updatedAt;
    
    public enum AssignmentStatus {
        DRAFT, PUBLISHED, CLOSED
    }
}
