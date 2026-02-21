package by.bsuir.mis.service;

import by.bsuir.mis.entity.ScheduleException;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ScheduleExceptionService {

    ScheduleException save(ScheduleException scheduleException);

    Optional<ScheduleException> findById(UUID id);

    List<ScheduleException> findAll();

    List<ScheduleException> findByEmployeeId(UUID employeeId);

    List<ScheduleException> findByEmployeeIdAndDateRange(UUID employeeId, LocalDate dateFrom, LocalDate dateTo);

    boolean hasExceptionOnDate(UUID employeeId, LocalDate date);

    ScheduleException update(ScheduleException scheduleException);

    void deleteById(UUID id);
}
