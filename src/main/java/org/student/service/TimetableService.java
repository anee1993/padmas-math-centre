package org.student.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.student.dto.CreateTimetableRequest;
import org.student.dto.TimetableDTO;
import org.student.entity.Timetable;
import org.student.exception.ResourceNotFoundException;
import org.student.repository.TimetableRepository;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TimetableService {
    
    private final TimetableRepository timetableRepository;
    private final DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");
    
    public TimetableService(TimetableRepository timetableRepository) {
        this.timetableRepository = timetableRepository;
    }
    
    @Transactional
    public TimetableDTO createTimetable(CreateTimetableRequest request) {
        Timetable timetable = new Timetable();
        timetable.setClassGrade(request.getClassGrade());
        timetable.setDayOfWeek(Timetable.DayOfWeek.valueOf(request.getDayOfWeek().toUpperCase()));
        timetable.setStartTime(LocalTime.parse(request.getStartTime(), timeFormatter));
        timetable.setEndTime(LocalTime.parse(request.getEndTime(), timeFormatter));
        timetable.setNotes(request.getNotes());
        
        Timetable saved = timetableRepository.save(timetable);
        return mapToDTO(saved);
    }
    
    @Transactional
    public TimetableDTO updateTimetable(Long id, CreateTimetableRequest request) {
        Timetable timetable = timetableRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Timetable entry not found"));
        
        timetable.setClassGrade(request.getClassGrade());
        timetable.setDayOfWeek(Timetable.DayOfWeek.valueOf(request.getDayOfWeek().toUpperCase()));
        timetable.setStartTime(LocalTime.parse(request.getStartTime(), timeFormatter));
        timetable.setEndTime(LocalTime.parse(request.getEndTime(), timeFormatter));
        timetable.setNotes(request.getNotes());
        
        Timetable updated = timetableRepository.save(timetable);
        return mapToDTO(updated);
    }
    
    @Transactional
    public void deleteTimetable(Long id) {
        if (!timetableRepository.existsById(id)) {
            throw new ResourceNotFoundException("Timetable entry not found");
        }
        timetableRepository.deleteById(id);
    }
    
    public List<TimetableDTO> getTimetableByClass(Integer classGrade) {
        List<Timetable> timetables = timetableRepository.findByClassGradeOrderByDayOfWeekAscStartTimeAsc(classGrade);
        return timetables.stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }
    
    public List<TimetableDTO> getAllTimetables() {
        List<Timetable> timetables = timetableRepository.findAllByOrderByClassGradeAscDayOfWeekAscStartTimeAsc();
        return timetables.stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }
    
    private TimetableDTO mapToDTO(Timetable timetable) {
        return new TimetableDTO(
            timetable.getId(),
            timetable.getClassGrade(),
            timetable.getDayOfWeek().name(),
            timetable.getStartTime().format(timeFormatter),
            timetable.getEndTime().format(timeFormatter),
            timetable.getNotes()
        );
    }
}
