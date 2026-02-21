package by.bsuir.mis.service.impl;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import by.bsuir.mis.entity.*;
import by.bsuir.mis.entity.enums.AppointmentStatus;
import by.bsuir.mis.exception.ResourceNotFoundException;
import by.bsuir.mis.repository.AppointmentRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
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
class AppointmentServiceImplTest {

    @Mock
    private AppointmentRepository appointmentRepository;

    @InjectMocks
    private AppointmentServiceImpl appointmentService;

    private Appointment appointment;
    private UUID appointmentId;
    private UUID patientId;
    private UUID employeeId;

    @BeforeEach
    void setUp() {
        appointmentId = UUID.randomUUID();
        patientId = UUID.randomUUID();
        employeeId = UUID.randomUUID();

        Patient patient = Patient.builder().id(patientId).build();
        Employee employee = Employee.builder().id(employeeId).build();

        appointment = Appointment.builder()
                .id(appointmentId)
                .patient(patient)
                .employee(employee)
                .appointmentDate(LocalDate.now())
                .startTime(LocalDateTime.now())
                .endTime(LocalDateTime.now().plusHours(1))
                .status(AppointmentStatus.WAITING)
                .build();
    }

    @Test
    void save_ShouldReturnSavedAppointment() {
        when(appointmentRepository.save(any(Appointment.class))).thenReturn(appointment);

        Appointment result = appointmentService.save(appointment);

        assertNotNull(result);
        assertEquals(appointmentId, result.getId());
        verify(appointmentRepository, times(1)).save(appointment);
    }

    @Test
    void findById_WhenExists_ShouldReturnAppointment() {
        when(appointmentRepository.findById(appointmentId)).thenReturn(Optional.of(appointment));

        Optional<Appointment> result = appointmentService.findById(appointmentId);

        assertTrue(result.isPresent());
        assertEquals(appointmentId, result.get().getId());
    }

    @Test
    void findById_WhenNotExists_ShouldReturnEmpty() {
        when(appointmentRepository.findById(appointmentId)).thenReturn(Optional.empty());

        Optional<Appointment> result = appointmentService.findById(appointmentId);

        assertFalse(result.isPresent());
    }

    @Test
    void findAll_ShouldReturnAllAppointments() {
        List<Appointment> appointments = List.of(appointment);
        when(appointmentRepository.findAll()).thenReturn(appointments);

        List<Appointment> result = appointmentService.findAll();

        assertEquals(1, result.size());
        verify(appointmentRepository, times(1)).findAll();
    }

    @Test
    void findByPatientId_ShouldReturnAppointments() {
        List<Appointment> appointments = List.of(appointment);
        when(appointmentRepository.findByPatient_Id(patientId)).thenReturn(appointments);

        List<Appointment> result = appointmentService.findByPatientId(patientId);

        assertEquals(1, result.size());
    }

    @Test
    void findByEmployeeId_ShouldReturnAppointments() {
        List<Appointment> appointments = List.of(appointment);
        when(appointmentRepository.findByEmployee_Id(employeeId)).thenReturn(appointments);

        List<Appointment> result = appointmentService.findByEmployeeId(employeeId);

        assertEquals(1, result.size());
    }

    @Test
    void findByDate_ShouldReturnAppointments() {
        LocalDate date = LocalDate.now();
        List<Appointment> appointments = List.of(appointment);
        when(appointmentRepository.findByAppointmentDate(date)).thenReturn(appointments);

        List<Appointment> result = appointmentService.findByDate(date);

        assertEquals(1, result.size());
    }

    @Test
    void findByEmployeeIdAndDate_ShouldReturnAppointments() {
        LocalDate date = LocalDate.now();
        List<Appointment> appointments = List.of(appointment);
        when(appointmentRepository.findByEmployee_IdAndAppointmentDate(employeeId, date))
                .thenReturn(appointments);

        List<Appointment> result = appointmentService.findByEmployeeIdAndDate(employeeId, date);

        assertEquals(1, result.size());
    }

    @Test
    void findByStatus_ShouldReturnAppointments() {
        List<Appointment> appointments = List.of(appointment);
        when(appointmentRepository.findByStatus(AppointmentStatus.WAITING)).thenReturn(appointments);

        List<Appointment> result = appointmentService.findByStatus(AppointmentStatus.WAITING);

        assertEquals(1, result.size());
    }

    @Test
    void update_WhenExists_ShouldReturnUpdatedAppointment() {
        when(appointmentRepository.existsById(appointmentId)).thenReturn(true);
        when(appointmentRepository.save(any(Appointment.class))).thenReturn(appointment);

        Appointment result = appointmentService.update(appointment);

        assertNotNull(result);
        verify(appointmentRepository, times(1)).save(appointment);
    }

    @Test
    void update_WhenNotExists_ShouldThrowException() {
        when(appointmentRepository.existsById(appointmentId)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () -> appointmentService.update(appointment));
    }

    @Test
    void deleteById_WhenExists_ShouldDelete() {
        when(appointmentRepository.existsById(appointmentId)).thenReturn(true);
        doNothing().when(appointmentRepository).deleteById(appointmentId);

        appointmentService.deleteById(appointmentId);

        verify(appointmentRepository, times(1)).deleteById(appointmentId);
    }

    @Test
    void deleteById_WhenNotExists_ShouldThrowException() {
        when(appointmentRepository.existsById(appointmentId)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () -> appointmentService.deleteById(appointmentId));
    }

    @Test
    void updateStatus_WhenExists_ShouldUpdateStatus() {
        when(appointmentRepository.findById(appointmentId)).thenReturn(Optional.of(appointment));
        when(appointmentRepository.save(any(Appointment.class))).thenReturn(appointment);

        Appointment result = appointmentService.updateStatus(appointmentId, AppointmentStatus.COMPLETED, null);

        assertNotNull(result);
        assertEquals(AppointmentStatus.COMPLETED, result.getStatus());
    }

    @Test
    void updateStatus_WhenCancelled_ShouldSetCancelReason() {
        when(appointmentRepository.findById(appointmentId)).thenReturn(Optional.of(appointment));
        when(appointmentRepository.save(any(Appointment.class))).thenReturn(appointment);

        Appointment result = appointmentService.updateStatus(appointmentId, AppointmentStatus.CANCELLED, "Test reason");

        assertNotNull(result);
        assertEquals("Test reason", result.getCancelReason());
    }

    @Test
    void updateStatus_WhenNotExists_ShouldThrowException() {
        when(appointmentRepository.findById(appointmentId)).thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> appointmentService.updateStatus(appointmentId, AppointmentStatus.COMPLETED, null));
    }
}
