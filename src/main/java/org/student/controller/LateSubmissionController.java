package org.student.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.student.dto.ApiResponse;
import org.student.dto.CreateLateSubmissionRequest;
import org.student.dto.LateSubmissionRequestDTO;
import org.student.dto.RespondToLateSubmissionRequest;
import org.student.entity.User;
import org.student.exception.ResourceNotFoundException;
import org.student.repository.UserRepository;
import org.student.service.LateSubmissionService;

import java.util.List;

@RestController
@RequestMapping("/api/late-submissions")
public class LateSubmissionController {
    
    private final LateSubmissionService lateSubmissionService;
    private final UserRepository userRepository;
    
    public LateSubmissionController(LateSubmissionService lateSubmissionService,
                                   UserRepository userRepository) {
        this.lateSubmissionService = lateSubmissionService;
        this.userRepository = userRepository;
    }
    
    @PostMapping("/request")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<LateSubmissionRequestDTO> createRequest(
            @Valid @RequestBody CreateLateSubmissionRequest request,
            Authentication authentication) {
        
        User student = userRepository.findByEmail(authentication.getName())
            .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        
        LateSubmissionRequestDTO created = lateSubmissionService.createRequest(request, student.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    @GetMapping("/pending")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<List<LateSubmissionRequestDTO>> getPendingRequests() {
        List<LateSubmissionRequestDTO> requests = lateSubmissionService.getPendingRequests();
        return ResponseEntity.ok(requests);
    }
    
    @GetMapping("/all")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<List<LateSubmissionRequestDTO>> getAllRequests() {
        List<LateSubmissionRequestDTO> requests = lateSubmissionService.getAllRequests();
        return ResponseEntity.ok(requests);
    }
    
    @GetMapping("/assignment/{assignmentId}/my-request")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<LateSubmissionRequestDTO> getMyRequest(
            @PathVariable Long assignmentId,
            Authentication authentication) {
        
        User student = userRepository.findByEmail(authentication.getName())
            .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        
        LateSubmissionRequestDTO request = lateSubmissionService
            .getRequestByAssignmentAndStudent(assignmentId, student.getId());
        
        if (request == null) {
            return ResponseEntity.notFound().build();
        }
        
        return ResponseEntity.ok(request);
    }
    
    @PostMapping("/respond")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<LateSubmissionRequestDTO> respondToRequest(
            @Valid @RequestBody RespondToLateSubmissionRequest request) {
        
        LateSubmissionRequestDTO responded = lateSubmissionService.respondToRequest(
            request.getRequestId(),
            request.getStatus(),
            request.getTeacherResponse()
        );
        
        return ResponseEntity.ok(responded);
    }
    
    @GetMapping("/assignment/{assignmentId}/check-approval")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse> checkApproval(
            @PathVariable Long assignmentId,
            Authentication authentication) {
        
        User student = userRepository.findByEmail(authentication.getName())
            .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        
        boolean isApproved = lateSubmissionService.isLateSubmissionApproved(assignmentId, student.getId());
        
        return ResponseEntity.ok(new ApiResponse(isApproved, 
            isApproved ? "Late submission approved" : "Late submission not approved"));
    }
}
