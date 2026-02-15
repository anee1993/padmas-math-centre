package org.student.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.student.entity.BlockedStudent;

import java.util.Optional;

@Repository
public interface BlockedStudentRepository extends JpaRepository<BlockedStudent, Long> {
    Optional<BlockedStudent> findByStudentId(Long studentId);
    boolean existsByStudentId(Long studentId);
    void deleteByStudentId(Long studentId);
}
