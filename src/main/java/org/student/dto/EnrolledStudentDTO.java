package org.student.dto;

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
    private LocalDateTime approvedAt;
}
