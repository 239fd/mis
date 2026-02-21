package by.bsuir.mis.service.impl;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import by.bsuir.mis.entity.*;
import by.bsuir.mis.exception.ResourceNotFoundException;
import by.bsuir.mis.repository.*;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class EmployeeServiceImplTest {

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private DoctorServiceRepository doctorServiceRepository;

    @Mock
    private DoctorScheduleRepository doctorScheduleRepository;

    @Mock
    private ScheduleExceptionRepository scheduleExceptionRepository;

    @Mock
    private AppointmentRepository appointmentRepository;

    @Mock
    private AppointmentStatusHistoryRepository appointmentStatusHistoryRepository;

    @InjectMocks
    private EmployeeServiceImpl employeeService;

    private Employee employee;
    private UUID employeeId;
    private UUID userId;
    private UUID specialtyId;

    @BeforeEach
    void setUp() {
        employeeId = UUID.randomUUID();
        userId = UUID.randomUUID();
        specialtyId = UUID.randomUUID();

        User user = User.builder().id(userId).build();
        MedicalSpecialty specialty = MedicalSpecialty.builder().id(specialtyId).build();

        employee = Employee.builder()
                .id(employeeId)
                .user(user)
                .specialty(specialty)
                .firstName("John")
                .lastName("Doe")
                .position("Doctor")
                .hireDate(LocalDate.now())
                .isActive(true)
                .build();
    }

    @Test
    void save_ShouldReturnSavedEmployee() {
        when(employeeRepository.save(any(Employee.class))).thenReturn(employee);

        Employee result = employeeService.save(employee);

        assertNotNull(result);
        assertEquals(employeeId, result.getId());
        verify(employeeRepository, times(1)).save(employee);
    }

    @Test
    void findById_WhenExists_ShouldReturnEmployee() {
        when(employeeRepository.findById(employeeId)).thenReturn(Optional.of(employee));

        Optional<Employee> result = employeeService.findById(employeeId);

        assertTrue(result.isPresent());
        assertEquals(employeeId, result.get().getId());
    }

    @Test
    void findById_WhenNotExists_ShouldReturnEmpty() {
        when(employeeRepository.findById(employeeId)).thenReturn(Optional.empty());

        Optional<Employee> result = employeeService.findById(employeeId);

        assertFalse(result.isPresent());
    }

    @Test
    void findByUserId_ShouldReturnEmployee() {
        when(employeeRepository.findByUser_Id(userId)).thenReturn(Optional.of(employee));

        Optional<Employee> result = employeeService.findByUserId(userId);

        assertTrue(result.isPresent());
    }

    @Test
    void findAll_ShouldReturnAllEmployees() {
        List<Employee> employees = List.of(employee);
        when(employeeRepository.findAll()).thenReturn(employees);

        List<Employee> result = employeeService.findAll();

        assertEquals(1, result.size());
    }

    @Test
    void findAllActive_ShouldReturnActiveEmployees() {
        List<Employee> employees = List.of(employee);
        when(employeeRepository.findByIsActive(true)).thenReturn(employees);

        List<Employee> result = employeeService.findAllActive();

        assertEquals(1, result.size());
    }

    @Test
    void findBySpecialtyId_ShouldReturnEmployees() {
        List<Employee> employees = List.of(employee);
        when(employeeRepository.findBySpecialty_Id(specialtyId)).thenReturn(employees);

        List<Employee> result = employeeService.findBySpecialtyId(specialtyId);

        assertEquals(1, result.size());
    }

    @Test
    void update_WhenExists_ShouldReturnUpdatedEmployee() {
        when(employeeRepository.existsById(employeeId)).thenReturn(true);
        when(employeeRepository.save(any(Employee.class))).thenReturn(employee);

        Employee result = employeeService.update(employee);

        assertNotNull(result);
        verify(employeeRepository, times(1)).save(employee);
    }

    @Test
    void update_WhenNotExists_ShouldThrowException() {
        when(employeeRepository.existsById(employeeId)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () -> employeeService.update(employee));
    }

    @Test
    void deleteById_WhenExists_ShouldDeleteWithRelatedData() {
        when(employeeRepository.existsById(employeeId)).thenReturn(true);
        when(appointmentRepository.findByEmployee_Id(employeeId)).thenReturn(List.of());
        when(doctorServiceRepository.findByEmployee_Id(employeeId)).thenReturn(List.of());
        when(doctorScheduleRepository.findByEmployee_Id(employeeId)).thenReturn(List.of());
        when(scheduleExceptionRepository.findByEmployee_Id(employeeId)).thenReturn(List.of());
        doNothing().when(employeeRepository).deleteById(employeeId);

        employeeService.deleteById(employeeId);

        verify(employeeRepository, times(1)).deleteById(employeeId);
    }

    @Test
    void deleteById_WhenNotExists_ShouldThrowException() {
        when(employeeRepository.existsById(employeeId)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () -> employeeService.deleteById(employeeId));
    }

    @Test
    void deleteById_WithAppointments_ShouldDeleteAppointmentsAndHistory() {
        UUID appointmentId = UUID.randomUUID();
        Appointment appointment = Appointment.builder().id(appointmentId).build();
        UUID historyId = UUID.randomUUID();
        AppointmentStatusHistory history =
                AppointmentStatusHistory.builder().id(historyId).build();

        when(employeeRepository.existsById(employeeId)).thenReturn(true);
        when(appointmentRepository.findByEmployee_Id(employeeId)).thenReturn(List.of(appointment));
        when(appointmentStatusHistoryRepository.findByAppointment_Id(appointmentId))
                .thenReturn(List.of(history));
        when(doctorServiceRepository.findByEmployee_Id(employeeId)).thenReturn(List.of());
        when(doctorScheduleRepository.findByEmployee_Id(employeeId)).thenReturn(List.of());
        when(scheduleExceptionRepository.findByEmployee_Id(employeeId)).thenReturn(List.of());
        doNothing().when(appointmentStatusHistoryRepository).deleteById(historyId);
        doNothing().when(appointmentRepository).deleteById(appointmentId);
        doNothing().when(employeeRepository).deleteById(employeeId);

        employeeService.deleteById(employeeId);

        verify(appointmentStatusHistoryRepository, times(1)).deleteById(historyId);
        verify(appointmentRepository, times(1)).deleteById(appointmentId);
    }

    @Test
    void deactivate_WhenExists_ShouldDeactivate() {
        when(employeeRepository.findById(employeeId)).thenReturn(Optional.of(employee));
        when(employeeRepository.save(any(Employee.class))).thenReturn(employee);

        employeeService.deactivate(employeeId);

        assertFalse(employee.getIsActive());
        verify(employeeRepository, times(1)).save(employee);
    }

    @Test
    void deactivate_WhenNotExists_ShouldThrowException() {
        when(employeeRepository.findById(employeeId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> employeeService.deactivate(employeeId));
    }

    @Test
    void activate_WhenExists_ShouldActivate() {
        employee.setIsActive(false);
        when(employeeRepository.findById(employeeId)).thenReturn(Optional.of(employee));
        when(employeeRepository.save(any(Employee.class))).thenReturn(employee);

        employeeService.activate(employeeId);

        assertTrue(employee.getIsActive());
        verify(employeeRepository, times(1)).save(employee);
    }

    @Test
    void activate_WhenNotExists_ShouldThrowException() {
        when(employeeRepository.findById(employeeId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> employeeService.activate(employeeId));
    }
}
