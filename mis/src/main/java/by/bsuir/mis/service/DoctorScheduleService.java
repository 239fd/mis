package by.bsuir.mis.service;

import by.bsuir.mis.entity.DoctorSchedule;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DoctorScheduleService {

    DoctorSchedule save(DoctorSchedule schedule);

    Optional<DoctorSchedule> findById(UUID id);

    List<DoctorSchedule> findAll();

    List<DoctorSchedule> findByEmployeeId(UUID employeeId);

    List<DoctorSchedule> findByEmployeeIdAndDayOfWeek(UUID employeeId, Integer dayOfWeek);

    List<DoctorSchedule> findActiveByEmployeeId(UUID employeeId, LocalDate date);

    DoctorSchedule update(DoctorSchedule schedule);

    void deleteById(UUID id);
}
