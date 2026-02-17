package org.student.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProfileResponse {
    
    private String supabaseUserId;
    private String email;
    private String role;
    private String fullName;
    private Integer classGrade;
    private String approvalStatus;
}
