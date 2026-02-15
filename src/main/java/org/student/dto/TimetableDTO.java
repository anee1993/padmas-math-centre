package org.student.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TimetableDTO {
    private Long id;
    private Integer classGrade;
    private String dayOfWeek;
    private String startTime;
    private String endTime;
    private String notes;
}
