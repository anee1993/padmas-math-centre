package org.student.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.student.entity.Timetable;

import java.util.List;

@Repository
public interface TimetableRepository extends JpaRepository<Timetable, Long> {
    List<Timetable> findByClassGradeOrderByDayOfWeekAscStartTimeAsc(Integer classGrade);
    List<Timetable> findAllByOrderByClassGradeAscDayOfWeekAscStartTimeAsc();
}
