package by.bsuir.mis.service.impl;

import by.bsuir.mis.entity.ScheduleException;
import by.bsuir.mis.exception.ResourceNotFoundException;
import by.bsuir.mis.repository.ScheduleExceptionRepository;
import by.bsuir.mis.service.ScheduleExceptionService;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ScheduleExceptionServiceImpl implements ScheduleExceptionService {

    private final ScheduleExceptionRepository scheduleExceptionRepository;

    @Override
    @Transactional
    public ScheduleException save(ScheduleException scheduleException) {
        return scheduleExceptionRepository.save(scheduleException);
    }

    @Override
    public Optional<ScheduleException> findById(UUID id) {
        return scheduleExceptionRepository.findById(id);
    }

    @Override
    public List<ScheduleException> findAll() {
        return scheduleExceptionRepository.findAll();
    }

    @Override
    public List<ScheduleException> findByEmployeeId(UUID employeeId) {
        return scheduleExceptionRepository.findByEmployee_Id(employeeId);
    }

    @Override
    public List<ScheduleException> findByEmployeeIdAndDateRange(UUID employeeId, LocalDate dateFrom, LocalDate dateTo) {
        return scheduleExceptionRepository.findByEmployeeIdInDateRange(employeeId, dateFrom, dateTo);
    }

    @Override
    public boolean hasExceptionOnDate(UUID employeeId, LocalDate date) {
        return !scheduleExceptionRepository
                .findByEmployeeIdOnDate(employeeId, date)
                .isEmpty();
    }

    @Override
    @Transactional
    public ScheduleException update(ScheduleException scheduleException) {
        if (!scheduleExceptionRepository.existsById(scheduleException.getId())) {
            throw new ResourceNotFoundException("ScheduleException", "id", scheduleException.getId());
        }
        return scheduleExceptionRepository.save(scheduleException);
    }

    @Override
    @Transactional
    public void deleteById(UUID id) {
        if (!scheduleExceptionRepository.existsById(id)) {
            throw new ResourceNotFoundException("ScheduleException", "id", id);
        }
        scheduleExceptionRepository.deleteById(id);
    }
}
