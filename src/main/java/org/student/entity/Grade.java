package org.student.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "grades")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Grade {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private Long submissionId;
    
    @Column(nullable = false)
    private Integer marksObtained;
    
    @Column(columnDefinition = "TEXT")
    private String feedback;
    
    @Column(nullable = false)
    private Long gradedBy;
    
    private LocalDateTime gradedAt;
}
