package org.student.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.student.dto.VirtualClassroomDTO;
import org.student.entity.ClassroomSession;
import org.student.entity.VirtualClassroom;
import org.student.exception.ResourceNotFoundException;
import org.student.repository.ClassroomSessionRepository;
import org.student.repository.VirtualClassroomRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class VirtualClassroomService {
    
    private final VirtualClassroomRepository virtualClassroomRepository;
    private final ClassroomSessionRepository classroomSessionRepository;
    
    public VirtualClassroomService(VirtualClassroomRepository virtualClassroomRepository,
                                  ClassroomSessionRepository classroomSessionRepository) {
        this.virtualClassroomRepository = virtualClassroomRepository;
        this.classroomSessionRepository = classroomSessionRepository;
    }
    
    @Transactional
    public void initializeClassrooms() {
        for (int grade = 6; grade <= 10; grade++) {
            if (!virtualClassroomRepository.existsByClassGrade(grade)) {
                VirtualClassroom classroom = new VirtualClassroom();
                classroom.setClassGrade(grade);
                classroom.setRoomId("class-" + grade);
                classroom.setMeetingLink(null); // Teacher will add link later
                classroom.setIsActive(true);
                virtualClassroomRepository.save(classroom);
            }
            
            // Initialize session tracking
            if (!classroomSessionRepository.findByClassGrade(grade).isPresent()) {
                ClassroomSession session = new ClassroomSession();
                session.setClassGrade(grade);
                session.setTeacherPresent(false);
                session.setLastUpdated(LocalDateTime.now());
                classroomSessionRepository.save(session);
            }
        }
    }
    
    public VirtualClassroomDTO getClassroomByGrade(Integer classGrade) {
        VirtualClassroom classroom = virtualClassroomRepository.findByClassGrade(classGrade)
            .orElseThrow(() -> new ResourceNotFoundException("Virtual classroom not found for class " + classGrade));
        
        return new VirtualClassroomDTO(
            classroom.getId(),
            classroom.getClassGrade(),
            classroom.getRoomId(),
            classroom.getMeetingLink(),
            classroom.getIsActive(),
            "Class " + classGrade + " - Mathematics",
            classroom.getMeetingLink() != null && !classroom.getMeetingLink().isEmpty()
        );
    }
    
    public List<VirtualClassroomDTO> getAllClassrooms() {
        return virtualClassroomRepository.findAll().stream()
            .map(classroom -> new VirtualClassroomDTO(
                classroom.getId(),
                classroom.getClassGrade(),
                classroom.getRoomId(),
                classroom.getMeetingLink(),
                classroom.getIsActive(),
                "Class " + classroom.getClassGrade() + " - Mathematics",
                classroom.getMeetingLink() != null && !classroom.getMeetingLink().isEmpty()
            ))
            .collect(Collectors.toList());
    }
    
    @Transactional
    public void updateMeetingLink(Integer classGrade, String meetingLink) {
        VirtualClassroom classroom = virtualClassroomRepository.findByClassGrade(classGrade)
            .orElseThrow(() -> new ResourceNotFoundException("Virtual classroom not found"));
        
        classroom.setMeetingLink(meetingLink);
        virtualClassroomRepository.save(classroom);
    }
    
    @Transactional
    public void toggleClassroomStatus(Integer classGrade, Boolean isActive) {
        VirtualClassroom classroom = virtualClassroomRepository.findByClassGrade(classGrade)
            .orElseThrow(() -> new ResourceNotFoundException("Virtual classroom not found"));
        
        classroom.setIsActive(isActive);
        virtualClassroomRepository.save(classroom);
    }
    
    @Transactional
    public void teacherJoined(Integer classGrade) {
        ClassroomSession session = classroomSessionRepository.findByClassGrade(classGrade)
            .orElseGet(() -> {
                ClassroomSession newSession = new ClassroomSession();
                newSession.setClassGrade(classGrade);
                return newSession;
            });
        
        session.setTeacherPresent(true);
        session.setTeacherJoinedAt(LocalDateTime.now());
        session.setLastUpdated(LocalDateTime.now());
        classroomSessionRepository.save(session);
    }
    
    @Transactional
    public void teacherLeft(Integer classGrade) {
        ClassroomSession session = classroomSessionRepository.findByClassGrade(classGrade)
            .orElseThrow(() -> new ResourceNotFoundException("Session not found"));
        
        session.setTeacherPresent(false);
        session.setLastUpdated(LocalDateTime.now());
        classroomSessionRepository.save(session);
    }
    
    public boolean isTeacherPresent(Integer classGrade) {
        ClassroomSession session = classroomSessionRepository.findByClassGrade(classGrade)
            .orElse(null);
        
        if (session == null) {
            return false;
        }
        
        // Check if teacher joined recently (within last 5 minutes for safety)
        if (session.getTeacherPresent() && session.getLastUpdated() != null) {
            LocalDateTime fiveMinutesAgo = LocalDateTime.now().minusMinutes(5);
            return session.getLastUpdated().isAfter(fiveMinutesAgo);
        }
        
        return session.getTeacherPresent();
    }
}

