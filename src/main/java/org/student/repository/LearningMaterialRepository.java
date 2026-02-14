package org.student.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.student.entity.LearningMaterial;

import java.util.List;

@Repository
public interface LearningMaterialRepository extends JpaRepository<LearningMaterial, Long> {
    List<LearningMaterial> findByClassGradeOrderByUploadedAtDesc(Integer classGrade);
    List<LearningMaterial> findAllByOrderByUploadedAtDesc();
}
