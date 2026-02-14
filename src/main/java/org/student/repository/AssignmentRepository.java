package org.student.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.student.entity.Assignment;

import java.util.List;

@Repository
public interface AssignmentRepository extends JpaRepository<Assignment, Long> {
    List<Assignment> findByClassGradeOrderByDueDateDesc(Integer classGrade);
    List<Assignment> findByClassGradeAndStatusOrderByDueDateDesc(Integer classGrade, Assignment.AssignmentStatus status);
}
