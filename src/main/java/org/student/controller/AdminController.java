package org.student.controller;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.student.dto.ApiResponse;
import org.student.dto.ApprovalRequest;
import org.student.dto.EnrolledStudentDTO;
import org.student.dto.PendingStudentDTO;
import org.student.service.AdminService;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    
    private final AdminService adminService;
    
    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }
    
    @GetMapping("/pending-registrations")
    public ResponseEntity<List<PendingStudentDTO>> getPendingRegistrations() {
        List<PendingStudentDTO> pendingStudents = adminService.getPendingRegistrations();
        return ResponseEntity.ok(pendingStudents);
    }
    
    @PutMapping("/approve-registration")
    public ResponseEntity<ApiResponse> approveRegistration(@Valid @RequestBody ApprovalRequest request) {
        adminService.approveRegistration(request.getStudentId());
        return ResponseEntity.ok(new ApiResponse(true, "Student registration approved successfully"));
    }
    
    @GetMapping("/enrolled-students")
    public ResponseEntity<List<EnrolledStudentDTO>> getEnrolledStudents() {
        List<EnrolledStudentDTO> students = adminService.getEnrolledStudents();
        return ResponseEntity.ok(students);
    }
    
    @GetMapping("/enrolled-students/class/{classGrade}")
    public ResponseEntity<List<EnrolledStudentDTO>> getEnrolledStudentsByClass(@PathVariable Integer classGrade) {
        List<EnrolledStudentDTO> students = adminService.getEnrolledStudentsByClass(classGrade);
        return ResponseEntity.ok(students);
    }
    public ResponseEntity<ApiResponse> rejectRegistration(@Valid @RequestBody ApprovalRequest request) {
        adminService.rejectRegistration(request.getStudentId(), request.getReason());
        return ResponseEntity.ok(new ApiResponse(true, "Student registration rejected"));
    }
}
