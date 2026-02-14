package org.student.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.student.entity.VirtualClassroom;

import java.util.Optional;

@Repository
public interface VirtualClassroomRepository extends JpaRepository<VirtualClassroom, Long> {
    Optional<VirtualClassroom> findByClassGrade(Integer classGrade);
    boolean existsByClassGrade(Integer classGrade);
}
