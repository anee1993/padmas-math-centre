package org.student.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.student.entity.StudentProfile;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class EnrolledStudentDTO {
    private Long id;
    private String email;
    private String fullName;
    private LocalDate dateOfBirth;
    private StudentProfile.Gender gender;
    private Integer classGrade;
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", timezone = "UTC")
    private LocalDateTime approvedAt;
}
