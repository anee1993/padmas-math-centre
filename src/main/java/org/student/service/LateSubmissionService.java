package org.student.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.student.dto.CreateLateSubmissionRequest;
import org.student.dto.LateSubmissionRequestDTO;
import org.student.entity.Assignment;
import org.student.entity.LateSubmissionRequest;
import org.student.entity.User;
import org.student.exception.ResourceNotFoundException;
import org.student.repository.AssignmentRepository;
import org.student.repository.LateSubmissionRequestRepository;
import org.student.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class LateSubmissionService {
    
    private final LateSubmissionRequestRepository requestRepository;
    private final AssignmentRepository assignmentRepository;
    private final UserRepository userRepository;
    
    public LateSubmissionService(LateSubmissionRequestRepository requestRepository,
                                AssignmentRepository assignmentRepository,
                                UserRepository userRepository) {
        this.requestRepository = requestRepository;
        this.assignmentRepository = assignmentRepository;
        this.userRepository = userRepository;
    }
    
    @Transactional
    public LateSubmissionRequestDTO createRequest(CreateLateSubmissionRequest request, Long studentId) {
        Assignment assignment = assignmentRepository.findById(request.getAssignmentId())
            .orElseThrow(() -> new ResourceNotFoundException("Assignment not found"));
        
        // Check if assignment is overdue
        if (!LocalDateTime.now().isAfter(assignment.getDueDate())) {
            throw new IllegalStateException("Assignment is not yet overdue");
        }
        
        // Check if request already exists
        requestRepository.findByAssignmentIdAndStudentId(request.getAssignmentId(), studentId)
            .ifPresent(r -> {
                throw new IllegalStateException("Late submission request already exists for this assignment");
            });
        
        LateSubmissionRequest lateRequest = new LateSubmissionRequest();
        lateRequest.setAssignmentId(request.getAssignmentId());
        lateRequest.setStudentId(studentId);
        lateRequest.setReason(request.getReason());
        lateRequest.setStatus(LateSubmissionRequest.RequestStatus.PENDING);
        lateRequest.setRequestedAt(LocalDateTime.now());
        
        LateSubmissionRequest saved = requestRepository.save(lateRequest);
        return mapToDTO(saved);
    }
    
    public List<LateSubmissionRequestDTO> getPendingRequests() {
        return requestRepository.findByStatus(LateSubmissionRequest.RequestStatus.PENDING)
            .stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }
    
    public List<LateSubmissionRequestDTO> getAllRequests() {
        return requestRepository.findAll()
            .stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }
    
    public LateSubmissionRequestDTO getRequestByAssignmentAndStudent(Long assignmentId, Long studentId) {
        LateSubmissionRequest request = requestRepository
            .findByAssignmentIdAndStudentId(assignmentId, studentId)
            .orElse(null);
        return request != null ? mapToDTO(request) : null;
    }
    
    @Transactional
    public LateSubmissionRequestDTO respondToRequest(Long requestId, 
                                                     LateSubmissionRequest.RequestStatus status,
                                                     String teacherResponse) {
        LateSubmissionRequest request = requestRepository.findById(requestId)
            .orElseThrow(() -> new ResourceNotFoundException("Late submission request not found"));
        
        if (request.getStatus() != LateSubmissionRequest.RequestStatus.PENDING) {
            throw new IllegalStateException("Request has already been responded to");
        }
        
        request.setStatus(status);
        request.setTeacherResponse(teacherResponse);
        request.setRespondedAt(LocalDateTime.now());
        
        LateSubmissionRequest updated = requestRepository.save(request);
        return mapToDTO(updated);
    }
    
    public boolean isLateSubmissionApproved(Long assignmentId, Long studentId) {
        return requestRepository.findByAssignmentIdAndStudentId(assignmentId, studentId)
            .map(request -> request.getStatus() == LateSubmissionRequest.RequestStatus.APPROVED)
            .orElse(false);
    }
    
    private LateSubmissionRequestDTO mapToDTO(LateSubmissionRequest request) {
        Assignment assignment = assignmentRepository.findById(request.getAssignmentId())
            .orElse(null);
        User student = userRepository.findById(request.getStudentId())
            .orElse(null);
        
        return new LateSubmissionRequestDTO(
            request.getId(),
            request.getAssignmentId(),
            assignment != null ? assignment.getTitle() : "Unknown",
            request.getStudentId(),
            student != null && student.getStudentProfile() != null ? 
                student.getStudentProfile().getFullName() : "Unknown",
            student != null ? student.getEmail() : "Unknown",
            request.getReason(),
            request.getStatus(),
            request.getRequestedAt(),
            request.getRespondedAt(),
            request.getTeacherResponse()
        );
    }
}
