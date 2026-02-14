package org.student.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.student.entity.StudentProfile;

import java.time.LocalDate;

@Data
@AllArgsConstructor
public class StudentProfileDTO {
    private Long id;
    private String fullName;
    private LocalDate dateOfBirth;
    private StudentProfile.Gender gender;
    private Integer classGrade;
}
