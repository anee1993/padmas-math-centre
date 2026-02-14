package org.student.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.student.entity.ClassroomSession;

import java.util.Optional;

@Repository
public interface ClassroomSessionRepository extends JpaRepository<ClassroomSession, Long> {
    Optional<ClassroomSession> findByClassGrade(Integer classGrade);
}
