package org.student.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.student.dto.ApiResponse;
import org.student.dto.LearningMaterialDTO;
import org.student.dto.UploadMaterialRequest;
import org.student.entity.User;
import org.student.exception.ResourceNotFoundException;
import org.student.repository.UserRepository;
import org.student.service.FileStorageService;
import org.student.service.LearningMaterialService;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/learning-materials")
public class LearningMaterialController {
    
    private final LearningMaterialService materialService;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;
    
    public LearningMaterialController(LearningMaterialService materialService,
                                     UserRepository userRepository,
                                     FileStorageService fileStorageService) {
        this.materialService = materialService;
        this.userRepository = userRepository;
        this.fileStorageService = fileStorageService;
    }
    
    @PostMapping
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<LearningMaterialDTO> uploadMaterial(
            @Valid @RequestBody UploadMaterialRequest request,
            Authentication authentication) {
        
        User teacher = userRepository.findByEmail(authentication.getName())
            .orElseThrow(() -> new ResourceNotFoundException("Teacher not found"));
        
        LearningMaterialDTO material = materialService.uploadMaterial(request, teacher.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(material);
    }
    
    @GetMapping("/class/{classGrade}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('TEACHER')")
    public ResponseEntity<List<LearningMaterialDTO>> getMaterialsByClass(@PathVariable Integer classGrade) {
        List<LearningMaterialDTO> materials = materialService.getMaterialsByClass(classGrade);
        return ResponseEntity.ok(materials);
    }
    
    @GetMapping
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<List<LearningMaterialDTO>> getAllMaterials() {
        List<LearningMaterialDTO> materials = materialService.getAllMaterials();
        return ResponseEntity.ok(materials);
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('TEACHER')")
    public ResponseEntity<LearningMaterialDTO> getMaterial(@PathVariable Long id) {
        LearningMaterialDTO material = materialService.getMaterialById(id);
        return ResponseEntity.ok(material);
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<ApiResponse> deleteMaterial(@PathVariable Long id) {
        materialService.deleteMaterial(id);
        return ResponseEntity.ok(new ApiResponse(true, "Learning material deleted successfully"));
    }
    
    @PostMapping("/upload-file")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<Map<String, String>> uploadFile(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {
        
        try {
            User teacher = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found"));
            
            String fileUrl = fileStorageService.uploadFile(file, "materials");
            
            Map<String, String> response = new HashMap<>();
            response.put("url", fileUrl);
            response.put("filename", file.getOriginalFilename());
            response.put("fileType", getFileExtension(file.getOriginalFilename()));
            
            return ResponseEntity.ok(response);
            
        } catch (IOException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
    
    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "UNKNOWN";
        }
        String ext = filename.substring(filename.lastIndexOf(".") + 1).toUpperCase();
        return ext;
    }
}
