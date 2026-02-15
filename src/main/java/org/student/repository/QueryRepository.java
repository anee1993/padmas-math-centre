package org.student.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.student.entity.Query;

import java.util.List;

@Repository
public interface QueryRepository extends JpaRepository<Query, Long> {
    List<Query> findByClassGradeAndIsDeletedFalseOrderByCreatedAtDesc(Integer classGrade);
    List<Query> findByIsDeletedFalseOrderByCreatedAtDesc();
    List<Query> findByStudentIdAndIsDeletedFalseOrderByCreatedAtDesc(Long studentId);
}
