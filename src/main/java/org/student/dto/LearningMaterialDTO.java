package org.student.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LearningMaterialDTO {
    private Long id;
    private String title;
    private String description;
    private Integer classGrade;
    private String fileUrl;
    private String fileName;
    private String fileType;
    private String uploadedBy;
    private LocalDateTime uploadedAt;
}
