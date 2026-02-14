package org.student.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class StudentRegistrationResponse {
    private Long id;
    private String email;
    private String fullName;
    private String status;
    private String message;
}
