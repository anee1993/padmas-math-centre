package org.student.service;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.student.dto.AssignmentDTO;
import org.student.dto.CreateAssignmentRequest;
import org.student.dto.SubmissionDTO;
import org.student.dto.SubmitAssignmentRequest;
import org.student.entity.Assignment;
import org.student.entity.AssignmentSubmission;
import org.student.entity.User;
import org.student.exception.ResourceNotFoundException;
import org.student.repository.AssignmentRepository;
import org.student.repository.AssignmentSubmissionRepository;
import org.student.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AssignmentService {
    
    private final AssignmentRepository assignmentRepository;
    private final AssignmentSubmissionRepository submissionRepository;
    private final UserRepository userRepository;
    private final LateSubmissionService lateSubmissionService;
    
    public AssignmentService(AssignmentRepository assignmentRepository,
                           AssignmentSubmissionRepository submissionRepository,
                           UserRepository userRepository,
                           LateSubmissionService lateSubmissionService) {
        this.assignmentRepository = assignmentRepository;
        this.submissionRepository = submissionRepository;
        this.userRepository = userRepository;
        this.lateSubmissionService = lateSubmissionService;
    }
    
    @Transactional
    public AssignmentDTO createAssignment(CreateAssignmentRequest request, Long teacherId) {
        Assignment assignment = new Assignment();
        assignment.setTitle(request.getTitle());
        assignment.setDescription(request.getDescription());
        assignment.setClassGrade(request.getClassGrade());
        assignment.setDueDate(request.getDueDate());
        assignment.setTotalMarks(request.getTotalMarks());
        assignment.setAttachmentUrl(request.getAttachmentUrl());
        assignment.setStatus(Assignment.AssignmentStatus.PUBLISHED);
        assignment.setCreatedBy(teacherId);
        
        Assignment saved = assignmentRepository.save(assignment);
        return mapToDTO(saved, null, null);
    }
    
    public List<AssignmentDTO> getAssignmentsByClass(Integer classGrade, Long studentId) {
        List<Assignment> assignments = assignmentRepository
            .findByClassGradeAndStatusOrderByDueDateDesc(classGrade, Assignment.AssignmentStatus.PUBLISHED);
        
        return assignments.stream()
            .map(assignment -> {
                boolean hasSubmitted = false;
                boolean isGraded = false;
                
                if (studentId != null) {
                    var submissionOpt = submissionRepository.findByAssignmentIdAndStudentId(assignment.getId(), studentId);
                    if (submissionOpt.isPresent()) {
                        hasSubmitted = true;
                        isGraded = submissionOpt.get().getStatus() == AssignmentSubmission.SubmissionStatus.GRADED;
                    }
                }
                
                return mapToDTO(assignment, hasSubmitted, isGraded);
            })
            .collect(Collectors.toList());
    }
    
    public List<AssignmentDTO> getAllAssignments() {
        return assignmentRepository.findAll().stream()
            .map(assignment -> mapToDTO(assignment, null, null))
            .collect(Collectors.toList());
    }
    
    public AssignmentDTO getAssignmentById(Long id) {
        Assignment assignment = assignmentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Assignment not found"));
        return mapToDTO(assignment, null, null);
    }
    
    @Transactional
    public void deleteAssignment(Long id) {
        Assignment assignment = assignmentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Assignment not found"));
        assignmentRepository.delete(assignment);
    }
    
    @Transactional
    public SubmissionDTO submitAssignment(SubmitAssignmentRequest request, Long studentId) {
        // Validate that at least one content field is provided
        if (!request.hasContent()) {
            throw new IllegalArgumentException(
                "Please provide either submission text or an attachment URL/file");
        }
        
        Assignment assignment = assignmentRepository.findById(request.getAssignmentId())
            .orElseThrow(() -> new ResourceNotFoundException("Assignment not found"));
        
        // Check if already submitted
        submissionRepository.findByAssignmentIdAndStudentId(request.getAssignmentId(), studentId)
            .ifPresent(s -> {
                throw new IllegalStateException("Assignment already submitted");
            });
        
        // Check if assignment is overdue
        boolean isOverdue = LocalDateTime.now().isAfter(assignment.getDueDate());
        if (isOverdue) {
            // Check if late submission is approved
            boolean isApproved = lateSubmissionService.isLateSubmissionApproved(
                request.getAssignmentId(), studentId);
            
            if (!isApproved) {
                throw new IllegalStateException(
                    "Assignment is overdue. Please request late submission permission from your teacher.");
            }
        }
        
        AssignmentSubmission submission = new AssignmentSubmission();
        submission.setAssignmentId(request.getAssignmentId());
        submission.setStudentId(studentId);
        submission.setSubmissionText(request.getSubmissionText());
        submission.setAttachmentUrl(request.getAttachmentUrl());
        submission.setSubmittedAt(LocalDateTime.now());
        submission.setStatus(AssignmentSubmission.SubmissionStatus.SUBMITTED);
        submission.setIsLate(isOverdue);
        
        AssignmentSubmission saved = submissionRepository.save(submission);
        return mapSubmissionToDTO(saved);
    }
    
    public List<SubmissionDTO> getSubmissionsByAssignment(Long assignmentId) {
        return submissionRepository.findByAssignmentId(assignmentId).stream()
            .map(this::mapSubmissionToDTO)
            .collect(Collectors.toList());
    }
    
    public SubmissionDTO getStudentSubmission(Long assignmentId, Long studentId) {
        AssignmentSubmission submission = submissionRepository
            .findByAssignmentIdAndStudentId(assignmentId, studentId)
            .orElseThrow(() -> new ResourceNotFoundException("Submission not found"));
        return mapSubmissionToDTO(submission);
    }
    
    public List<SubmissionDTO> getStudentSubmissions(Long studentId) {
        return submissionRepository.findByStudentId(studentId).stream()
            .map(this::mapSubmissionToDTO)
            .collect(Collectors.toList());
    }
    
    @Transactional
    public SubmissionDTO gradeSubmission(Long submissionId, Integer marksObtained, String feedback) {
        AssignmentSubmission submission = submissionRepository.findById(submissionId)
            .orElseThrow(() -> new ResourceNotFoundException("Submission not found"));
        
        Assignment assignment = assignmentRepository.findById(submission.getAssignmentId())
            .orElseThrow(() -> new ResourceNotFoundException("Assignment not found"));
        
        // Validate marks
        if (marksObtained > assignment.getTotalMarks()) {
            throw new IllegalArgumentException(
                "Marks obtained (" + marksObtained + ") cannot exceed total marks (" + assignment.getTotalMarks() + ")"
            );
        }
        
        submission.setMarksObtained(marksObtained);
        submission.setFeedback(feedback);
        submission.setStatus(AssignmentSubmission.SubmissionStatus.GRADED);
        
        AssignmentSubmission updated = submissionRepository.save(submission);
        return mapSubmissionToDTO(updated);
    }
    
    private AssignmentDTO mapToDTO(Assignment assignment, Boolean hasSubmitted, Boolean isGraded) {
        boolean isOverdue = LocalDateTime.now().isAfter(assignment.getDueDate());
        return new AssignmentDTO(
            assignment.getId(),
            assignment.getTitle(),
            assignment.getDescription(),
            assignment.getClassGrade(),
            assignment.getDueDate(),
            assignment.getTotalMarks(),
            assignment.getAttachmentUrl(),
            assignment.getStatus(),
            assignment.getCreatedAt(),
            isOverdue,
            hasSubmitted,
            isGraded
        );
    }
    
    private SubmissionDTO mapSubmissionToDTO(AssignmentSubmission submission) {
        User student = userRepository.findById(submission.getStudentId())
            .orElse(null);
        
        return new SubmissionDTO(
            submission.getId(),
            submission.getAssignmentId(),
            submission.getStudentId(),
            student != null && student.getStudentProfile() != null ? 
                student.getStudentProfile().getFullName() : "Unknown",
            student != null ? student.getEmail() : "Unknown",
            submission.getSubmissionText(),
            submission.getAttachmentUrl(),
            submission.getSubmittedAt(),
            submission.getStatus(),
            submission.getIsLate(),
            submission.getMarksObtained(),
            submission.getFeedback()
        );
    }
}
