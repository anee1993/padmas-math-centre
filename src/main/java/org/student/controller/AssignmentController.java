package org.student.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.student.dto.*;
import org.student.entity.User;
import org.student.exception.ResourceNotFoundException;
import org.student.repository.UserRepository;
import org.student.service.AssignmentService;
import org.student.service.FileStorageService;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/assignments")
public class AssignmentController {
    
    private final AssignmentService assignmentService;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;
    
    public AssignmentController(AssignmentService assignmentService, 
                               UserRepository userRepository,
                               FileStorageService fileStorageService) {
        this.assignmentService = assignmentService;
        this.userRepository = userRepository;
        this.fileStorageService = fileStorageService;
    }
    
    @PostMapping
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<AssignmentDTO> createAssignment(
            @Valid @RequestBody CreateAssignmentRequest request,
            Authentication authentication) {
        User teacher = userRepository.findByEmail(authentication.getName())
            .orElseThrow(() -> new ResourceNotFoundException("Teacher not found"));
        
        AssignmentDTO assignment = assignmentService.createAssignment(request, teacher.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(assignment);
    }
    
    @GetMapping("/class/{classGrade}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('TEACHER')")
    public ResponseEntity<List<AssignmentDTO>> getAssignmentsByClass(
            @PathVariable Integer classGrade,
            Authentication authentication) {
        
        User user = userRepository.findByEmail(authentication.getName())
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        Long studentId = user.getRole() == User.Role.STUDENT ? user.getId() : null;
        List<AssignmentDTO> assignments = assignmentService.getAssignmentsByClass(classGrade, studentId);
        return ResponseEntity.ok(assignments);
    }
    
    @GetMapping
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<List<AssignmentDTO>> getAllAssignments() {
        List<AssignmentDTO> assignments = assignmentService.getAllAssignments();
        return ResponseEntity.ok(assignments);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<AssignmentDTO> getAssignment(@PathVariable Long id) {
        AssignmentDTO assignment = assignmentService.getAssignmentById(id);
        return ResponseEntity.ok(assignment);
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<ApiResponse> deleteAssignment(@PathVariable Long id) {
        assignmentService.deleteAssignment(id);
        return ResponseEntity.ok(new ApiResponse(true, "Assignment deleted successfully"));
    }
    
    @PostMapping("/submit")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<SubmissionDTO> submitAssignment(
            @Valid @RequestBody SubmitAssignmentRequest request,
            Authentication authentication) {
        
        User student = userRepository.findByEmail(authentication.getName())
            .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        
        SubmissionDTO submission = assignmentService.submitAssignment(request, student.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(submission);
    }
    
    @GetMapping("/{assignmentId}/submissions")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<List<SubmissionDTO>> getSubmissions(@PathVariable Long assignmentId) {
        List<SubmissionDTO> submissions = assignmentService.getSubmissionsByAssignment(assignmentId);
        return ResponseEntity.ok(submissions);
    }
    
    @GetMapping("/{assignmentId}/my-submission")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<SubmissionDTO> getMySubmission(
            @PathVariable Long assignmentId,
            Authentication authentication) {
        
        User student = userRepository.findByEmail(authentication.getName())
            .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        
        SubmissionDTO submission = assignmentService.getStudentSubmission(assignmentId, student.getId());
        return ResponseEntity.ok(submission);
    }
    
    @GetMapping("/my-submissions")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<SubmissionDTO>> getMySubmissions(Authentication authentication) {
        User student = userRepository.findByEmail(authentication.getName())
            .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        
        List<SubmissionDTO> submissions = assignmentService.getStudentSubmissions(student.getId());
        return ResponseEntity.ok(submissions);
    }
    
    @PostMapping("/grade")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<SubmissionDTO> gradeSubmission(
            @Valid @RequestBody GradeSubmissionRequest request) {
        
        SubmissionDTO graded = assignmentService.gradeSubmission(
            request.getSubmissionId(),
            request.getMarksObtained(),
            request.getFeedback()
        );
        
        return ResponseEntity.ok(graded);
    }
    
    @PostMapping("/upload-file")
    @PreAuthorize("hasRole('TEACHER') or hasRole('STUDENT')")
    public ResponseEntity<Map<String, String>> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("folder") String folder,
            Authentication authentication) {
        
        try {
            User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            
            // Validate folder based on role
            if (user.getRole() == User.Role.TEACHER && !folder.equals("assignments")) {
                throw new IllegalArgumentException("Invalid folder");
            }
            if (user.getRole() == User.Role.STUDENT && !folder.equals("submissions")) {
                throw new IllegalArgumentException("Invalid folder");
            }
            
            String fileUrl = fileStorageService.uploadFile(file, folder);
            
            Map<String, String> response = new HashMap<>();
            response.put("url", fileUrl);
            response.put("filename", file.getOriginalFilename());
            
            return ResponseEntity.ok(response);
            
        } catch (IOException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
}
