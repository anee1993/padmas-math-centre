package org.student.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VirtualClassroomDTO {
    private Long id;
    private Integer classGrade;
    private String roomId;
    private String meetingLink;
    private Boolean isActive;
    private String displayName;
    private Boolean hasLink;
}
