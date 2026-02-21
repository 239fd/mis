package by.bsuir.mis.service.impl;

import by.bsuir.mis.entity.DoctorSchedule;
import by.bsuir.mis.exception.ResourceNotFoundException;
import by.bsuir.mis.repository.DoctorScheduleRepository;
import by.bsuir.mis.service.DoctorScheduleService;
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
public class DoctorScheduleServiceImpl implements DoctorScheduleService {

    private final DoctorScheduleRepository doctorScheduleRepository;

    @Override
    @Transactional
    public DoctorSchedule save(DoctorSchedule schedule) {
        return doctorScheduleRepository.save(schedule);
    }

    @Override
    public Optional<DoctorSchedule> findById(UUID id) {
        return doctorScheduleRepository.findById(id);
    }

    @Override
    public List<DoctorSchedule> findAll() {
        return doctorScheduleRepository.findAll();
    }

    @Override
    public List<DoctorSchedule> findByEmployeeId(UUID employeeId) {
        return doctorScheduleRepository.findByEmployee_Id(employeeId);
    }

    @Override
    public List<DoctorSchedule> findByEmployeeIdAndDayOfWeek(UUID employeeId, Integer dayOfWeek) {
        return doctorScheduleRepository.findByEmployee_IdAndDayOfWeek(employeeId, dayOfWeek);
    }

    @Override
    public List<DoctorSchedule> findActiveByEmployeeId(UUID employeeId, LocalDate date) {
        return doctorScheduleRepository.findActiveByEmployeeOnDate(employeeId, date);
    }

    @Override
    @Transactional
    public DoctorSchedule update(DoctorSchedule schedule) {
        if (!doctorScheduleRepository.existsById(schedule.getId())) {
            throw new ResourceNotFoundException("DoctorSchedule", "id", schedule.getId());
        }
        return doctorScheduleRepository.save(schedule);
    }

    @Override
    @Transactional
    public void deleteById(UUID id) {
        if (!doctorScheduleRepository.existsById(id)) {
            throw new ResourceNotFoundException("DoctorSchedule", "id", id);
        }
        doctorScheduleRepository.deleteById(id);
    }
}
