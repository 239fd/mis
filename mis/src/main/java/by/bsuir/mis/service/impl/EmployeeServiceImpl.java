package by.bsuir.mis.service.impl;

import by.bsuir.mis.entity.Employee;
import by.bsuir.mis.exception.ResourceNotFoundException;
import by.bsuir.mis.repository.*;
import by.bsuir.mis.service.EmployeeService;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EmployeeServiceImpl implements EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final DoctorServiceRepository doctorServiceRepository;
    private final DoctorScheduleRepository doctorScheduleRepository;
    private final ScheduleExceptionRepository scheduleExceptionRepository;
    private final AppointmentRepository appointmentRepository;
    private final AppointmentStatusHistoryRepository appointmentStatusHistoryRepository;

    @Override
    @Transactional
    public Employee save(Employee employee) {
        return employeeRepository.save(employee);
    }

    @Override
    public Optional<Employee> findById(UUID id) {
        return employeeRepository.findById(id);
    }

    @Override
    public Optional<Employee> findByUserId(UUID userId) {
        return employeeRepository.findByUser_Id(userId);
    }

    @Override
    public List<Employee> findAll() {
        return employeeRepository.findAll();
    }

    @Override
    public List<Employee> findAllActive() {
        return employeeRepository.findByIsActive(true);
    }

    @Override
    public List<Employee> findBySpecialtyId(UUID specialtyId) {
        return employeeRepository.findBySpecialty_Id(specialtyId);
    }

    @Override
    @Transactional
    public Employee update(Employee employee) {
        if (!employeeRepository.existsById(employee.getId())) {
            throw new ResourceNotFoundException("Employee", "id", employee.getId());
        }
        return employeeRepository.save(employee);
    }

    @Override
    @Transactional
    public void deleteById(UUID id) {
        if (!employeeRepository.existsById(id)) {
            throw new ResourceNotFoundException("Employee", "id", id);
        }

        appointmentRepository.findByEmployee_Id(id).forEach(appointment -> {
            appointmentStatusHistoryRepository
                    .findByAppointment_Id(appointment.getId())
                    .forEach(history -> appointmentStatusHistoryRepository.deleteById(history.getId()));
            appointmentRepository.deleteById(appointment.getId());
        });

        doctorServiceRepository.findByEmployee_Id(id).forEach(ds -> doctorServiceRepository.deleteById(ds.getId()));

        doctorScheduleRepository
                .findByEmployee_Id(id)
                .forEach(schedule -> doctorScheduleRepository.deleteById(schedule.getId()));

        scheduleExceptionRepository
                .findByEmployee_Id(id)
                .forEach(exception -> scheduleExceptionRepository.deleteById(exception.getId()));

        employeeRepository.deleteById(id);
    }

    @Override
    @Transactional
    public void deactivate(UUID id) {
        Employee employee =
                employeeRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Employee", "id", id));
        employee.setIsActive(false);
        employeeRepository.save(employee);
    }

    @Override
    @Transactional
    public void activate(UUID id) {
        Employee employee =
                employeeRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Employee", "id", id));
        employee.setIsActive(true);
        employeeRepository.save(employee);
    }
}
