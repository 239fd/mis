package by.bsuir.mis.service.impl;

import by.bsuir.mis.entity.Appointment;
import by.bsuir.mis.entity.enums.AppointmentStatus;
import by.bsuir.mis.exception.ResourceNotFoundException;
import by.bsuir.mis.repository.AppointmentRepository;
import by.bsuir.mis.service.AppointmentService;
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
public class AppointmentServiceImpl implements AppointmentService {

    private final AppointmentRepository appointmentRepository;

    @Override
    @Transactional
    public Appointment save(Appointment appointment) {
        return appointmentRepository.save(appointment);
    }

    @Override
    public Optional<Appointment> findById(UUID id) {
        return appointmentRepository.findById(id);
    }

    @Override
    public List<Appointment> findAll() {
        return appointmentRepository.findAll();
    }

    @Override
    public List<Appointment> findByPatientId(UUID patientId) {
        return appointmentRepository.findByPatient_Id(patientId);
    }

    @Override
    public List<Appointment> findByEmployeeId(UUID employeeId) {
        return appointmentRepository.findByEmployee_Id(employeeId);
    }

    @Override
    public List<Appointment> findByDate(LocalDate date) {
        return appointmentRepository.findByAppointmentDate(date);
    }

    @Override
    public List<Appointment> findByEmployeeIdAndDate(UUID employeeId, LocalDate date) {
        return appointmentRepository.findByEmployee_IdAndAppointmentDate(employeeId, date);
    }

    @Override
    public List<Appointment> findByStatus(AppointmentStatus status) {
        return appointmentRepository.findByStatus(status);
    }

    @Override
    @Transactional
    public Appointment update(Appointment appointment) {
        if (!appointmentRepository.existsById(appointment.getId())) {
            throw new ResourceNotFoundException("Appointment", "id", appointment.getId());
        }
        return appointmentRepository.save(appointment);
    }

    @Override
    @Transactional
    public void deleteById(UUID id) {
        if (!appointmentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Appointment", "id", id);
        }
        appointmentRepository.deleteById(id);
    }

    @Override
    @Transactional
    public Appointment updateStatus(UUID id, AppointmentStatus status, String reason) {
        Appointment appointment = appointmentRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", id));
        appointment.setStatus(status);
        if (status == AppointmentStatus.CANCELLED) {
            appointment.setCancelReason(reason);
        }
        return appointmentRepository.save(appointment);
    }
}
