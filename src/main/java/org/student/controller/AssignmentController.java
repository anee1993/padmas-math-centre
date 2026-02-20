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
import org.student.service.AIAssignmentGeneratorService;
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
    private final AIAssignmentGeneratorService aiAssignmentGeneratorService;
    
    public AssignmentController(AssignmentService assignmentService, 
                               UserRepository userRepository,
                               FileStorageService fileStorageService,
                               AIAssignmentGeneratorService aiAssignmentGeneratorService) {
        this.assignmentService = assignmentService;
        this.userRepository = userRepository;
        this.fileStorageService = fileStorageService;
        this.aiAssignmentGeneratorService = aiAssignmentGeneratorService;
    }
    
    @PostMapping
    public ResponseEntity<AssignmentDTO> createAssignment(
            @Valid @RequestBody CreateAssignmentRequest request,
            Authentication authentication) {
        
        if (authentication == null) {
            System.err.println("ERROR: Authentication is null in createAssignment!");
            throw new RuntimeException("Authentication is null - user not authenticated");
        }
        
        System.out.println("Creating assignment - authenticated user: " + authentication.getName());
        
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
    public ResponseEntity<List<AssignmentDTO>> getAllAssignments() {
        try {
            List<AssignmentDTO> assignments = assignmentService.getAllAssignments();
            return ResponseEntity.ok(assignments);
        } catch (Exception e) {
            // Log the error and return empty list instead of 500
            System.err.println("Error fetching assignments: " + e.getMessage());
            e.printStackTrace();
            // Return empty list to prevent dashboard from breaking
            return ResponseEntity.ok(List.of());
        }
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
    
    @PostMapping("/generate")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<Map<String, String>> generateAssignment(
            @Valid @RequestBody GenerateAssignmentRequest request) {
        
        try {
            System.out.println("Generating assignment for topic: " + request.getTopic() + ", grade: " + request.getClassGrade());
            String generatedAssignment = aiAssignmentGeneratorService.generateAssignment(request);
            
            Map<String, String> response = new HashMap<>();
            response.put("content", generatedAssignment);
            response.put("topic", request.getTopic());
            response.put("classGrade", String.valueOf(request.getClassGrade()));
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("Error generating assignment: " + e.getMessage());
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to generate assignment: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}
