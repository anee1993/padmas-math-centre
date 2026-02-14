package org.student.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.student.dto.LearningMaterialDTO;
import org.student.dto.UploadMaterialRequest;
import org.student.entity.LearningMaterial;
import org.student.entity.User;
import org.student.exception.ResourceNotFoundException;
import org.student.repository.LearningMaterialRepository;
import org.student.repository.UserRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class LearningMaterialService {
    
    private final LearningMaterialRepository materialRepository;
    private final UserRepository userRepository;
    
    public LearningMaterialService(LearningMaterialRepository materialRepository,
                                  UserRepository userRepository) {
        this.materialRepository = materialRepository;
        this.userRepository = userRepository;
    }
    
    @Transactional
    public LearningMaterialDTO uploadMaterial(UploadMaterialRequest request, Long teacherId) {
        LearningMaterial material = new LearningMaterial();
        material.setTitle(request.getTitle());
        material.setDescription(request.getDescription());
        material.setClassGrade(request.getClassGrade());
        material.setFileUrl(request.getFileUrl());
        material.setFileName(request.getFileName());
        material.setFileType(request.getFileType());
        material.setUploadedBy(teacherId);
        
        LearningMaterial saved = materialRepository.save(material);
        return mapToDTO(saved);
    }
    
    public List<LearningMaterialDTO> getMaterialsByClass(Integer classGrade) {
        return materialRepository.findByClassGradeOrderByUploadedAtDesc(classGrade).stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }
    
    public List<LearningMaterialDTO> getAllMaterials() {
        return materialRepository.findAllByOrderByUploadedAtDesc().stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }
    
    public LearningMaterialDTO getMaterialById(Long id) {
        LearningMaterial material = materialRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Learning material not found"));
        return mapToDTO(material);
    }
    
    @Transactional
    public void deleteMaterial(Long id) {
        LearningMaterial material = materialRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Learning material not found"));
        materialRepository.delete(material);
    }
    
    private LearningMaterialDTO mapToDTO(LearningMaterial material) {
        User teacher = userRepository.findById(material.getUploadedBy()).orElse(null);
        String teacherName = teacher != null ? teacher.getFullName() : "Unknown";
        
        return new LearningMaterialDTO(
            material.getId(),
            material.getTitle(),
            material.getDescription(),
            material.getClassGrade(),
            material.getFileUrl(),
            material.getFileName(),
            material.getFileType(),
            teacherName,
            material.getUploadedAt()
        );
    }
}
