package org.student.controller;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.student.dto.UpdateMeetingLinkRequest;
import org.student.dto.VirtualClassroomDTO;
import org.student.service.VirtualClassroomService;

import java.util.List;

@RestController
@RequestMapping("/api/virtual-classroom")
public class VirtualClassroomController {
    
    private final VirtualClassroomService virtualClassroomService;
    
    public VirtualClassroomController(VirtualClassroomService virtualClassroomService) {
        this.virtualClassroomService = virtualClassroomService;
    }
    
    @GetMapping("/my-classroom/{classGrade}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('TEACHER')")
    public ResponseEntity<VirtualClassroomDTO> getMyClassroom(@PathVariable Integer classGrade) {
        VirtualClassroomDTO classroom = virtualClassroomService.getClassroomByGrade(classGrade);
        return ResponseEntity.ok(classroom);
    }
    
    @GetMapping("/all")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<List<VirtualClassroomDTO>> getAllClassrooms() {
        try {
            List<VirtualClassroomDTO> classrooms = virtualClassroomService.getAllClassrooms();
            return ResponseEntity.ok(classrooms);
        } catch (Exception e) {
            // Log the error and return empty list instead of 500
            System.err.println("Error fetching virtual classrooms: " + e.getMessage());
            e.printStackTrace();
            // Return empty list to prevent dashboard from breaking
            return ResponseEntity.ok(List.of());
        }
    }
    
    @PutMapping("/toggle/{classGrade}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<String> toggleClassroom(
            @PathVariable Integer classGrade,
            @RequestParam Boolean isActive) {
        virtualClassroomService.toggleClassroomStatus(classGrade, isActive);
        return ResponseEntity.ok("Classroom status updated");
    }
    
    @PostMapping("/teacher-joined/{classGrade}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<String> teacherJoined(@PathVariable Integer classGrade) {
        virtualClassroomService.teacherJoined(classGrade);
        return ResponseEntity.ok("Teacher presence recorded");
    }
    
    @PostMapping("/teacher-left/{classGrade}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<String> teacherLeft(@PathVariable Integer classGrade) {
        virtualClassroomService.teacherLeft(classGrade);
        return ResponseEntity.ok("Teacher left recorded");
    }
    
    @PutMapping("/update-link")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<String> updateMeetingLink(@Valid @RequestBody UpdateMeetingLinkRequest request) {
        virtualClassroomService.updateMeetingLink(request.getClassGrade(), request.getMeetingLink());
        return ResponseEntity.ok("Meeting link updated successfully");
    }
    
    @GetMapping("/teacher-present/{classGrade}")
    public ResponseEntity<Boolean> isTeacherPresent(@PathVariable Integer classGrade) {
        boolean present = virtualClassroomService.isTeacherPresent(classGrade);
        return ResponseEntity.ok(present);
    }
}
