package by.bsuir.mis.service;

import by.bsuir.mis.entity.Appointment;
import by.bsuir.mis.entity.enums.AppointmentStatus;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AppointmentService {

    Appointment save(Appointment appointment);

    Optional<Appointment> findById(UUID id);

    List<Appointment> findAll();

    List<Appointment> findByPatientId(UUID patientId);

    List<Appointment> findByEmployeeId(UUID employeeId);

    List<Appointment> findByDate(LocalDate date);

    List<Appointment> findByEmployeeIdAndDate(UUID employeeId, LocalDate date);

    List<Appointment> findByStatus(AppointmentStatus status);

    Appointment update(Appointment appointment);

    void deleteById(UUID id);

    Appointment updateStatus(UUID id, AppointmentStatus status, String reason);
}
