package org.student.controller;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.student.dto.ApiResponse;
import org.student.dto.CreateTimetableRequest;
import org.student.dto.TimetableDTO;
import org.student.service.TimetableService;

import java.util.List;

@RestController
@RequestMapping("/api/timetable")
public class TimetableController {
    
    private final TimetableService timetableService;
    
    public TimetableController(TimetableService timetableService) {
        this.timetableService = timetableService;
    }
    
    @PostMapping
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<TimetableDTO> createTimetable(@Valid @RequestBody CreateTimetableRequest request) {
        TimetableDTO timetable = timetableService.createTimetable(request);
        return ResponseEntity.ok(timetable);
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<TimetableDTO> updateTimetable(
            @PathVariable Long id,
            @Valid @RequestBody CreateTimetableRequest request) {
        TimetableDTO timetable = timetableService.updateTimetable(id, request);
        return ResponseEntity.ok(timetable);
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<ApiResponse> deleteTimetable(@PathVariable Long id) {
        timetableService.deleteTimetable(id);
        return ResponseEntity.ok(new ApiResponse(true, "Timetable entry deleted successfully"));
    }
    
    @GetMapping("/class/{classGrade}")
    public ResponseEntity<List<TimetableDTO>> getTimetableByClass(@PathVariable Integer classGrade) {
        List<TimetableDTO> timetables = timetableService.getTimetableByClass(classGrade);
        return ResponseEntity.ok(timetables);
    }
    
    @GetMapping("/all")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<List<TimetableDTO>> getAllTimetables() {
        List<TimetableDTO> timetables = timetableService.getAllTimetables();
        return ResponseEntity.ok(timetables);
    }
}
