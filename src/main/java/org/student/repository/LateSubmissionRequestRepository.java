package org.student.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.student.entity.LateSubmissionRequest;

import java.util.List;
import java.util.Optional;

@Repository
public interface LateSubmissionRequestRepository extends JpaRepository<LateSubmissionRequest, Long> {
    
    List<LateSubmissionRequest> findByStatus(LateSubmissionRequest.RequestStatus status);
    
    Optional<LateSubmissionRequest> findByAssignmentIdAndStudentId(Long assignmentId, Long studentId);
    
    List<LateSubmissionRequest> findByAssignmentId(Long assignmentId);
    
    List<LateSubmissionRequest> findByStudentId(Long studentId);
}
