package org.student.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "blocked_students")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BlockedStudent {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private Long studentId;
    
    @Column(nullable = false)
    private String reason;
    
    @CreationTimestamp
    private LocalDateTime blockedAt;
}
