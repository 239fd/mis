package by.bsuir.mis.service.impl;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import by.bsuir.mis.entity.DoctorSchedule;
import by.bsuir.mis.entity.Employee;
import by.bsuir.mis.exception.ResourceNotFoundException;
import by.bsuir.mis.repository.DoctorScheduleRepository;
import java.time.LocalDate;
import java.time.LocalTime;
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
class DoctorScheduleServiceImplTest {

    @Mock
    private DoctorScheduleRepository doctorScheduleRepository;

    @InjectMocks
    private DoctorScheduleServiceImpl doctorScheduleService;

    private DoctorSchedule schedule;
    private UUID scheduleId;
    private UUID employeeId;

    @BeforeEach
    void setUp() {
        scheduleId = UUID.randomUUID();
        employeeId = UUID.randomUUID();

        Employee employee = Employee.builder().id(employeeId).build();

        schedule = DoctorSchedule.builder()
                .id(scheduleId)
                .employee(employee)
                .dayOfWeek(1)
                .startTime(LocalTime.of(9, 0))
                .endTime(LocalTime.of(17, 0))
                .effectiveFrom(LocalDate.now())
                .build();
    }

    @Test
    void save_ShouldReturnSavedSchedule() {
        when(doctorScheduleRepository.save(any(DoctorSchedule.class))).thenReturn(schedule);

        DoctorSchedule result = doctorScheduleService.save(schedule);

        assertNotNull(result);
        assertEquals(scheduleId, result.getId());
        verify(doctorScheduleRepository, times(1)).save(schedule);
    }

    @Test
    void findById_WhenExists_ShouldReturnSchedule() {
        when(doctorScheduleRepository.findById(scheduleId)).thenReturn(Optional.of(schedule));

        Optional<DoctorSchedule> result = doctorScheduleService.findById(scheduleId);

        assertTrue(result.isPresent());
        assertEquals(scheduleId, result.get().getId());
    }

    @Test
    void findById_WhenNotExists_ShouldReturnEmpty() {
        when(doctorScheduleRepository.findById(scheduleId)).thenReturn(Optional.empty());

        Optional<DoctorSchedule> result = doctorScheduleService.findById(scheduleId);

        assertFalse(result.isPresent());
    }

    @Test
    void findAll_ShouldReturnAllSchedules() {
        List<DoctorSchedule> schedules = List.of(schedule);
        when(doctorScheduleRepository.findAll()).thenReturn(schedules);

        List<DoctorSchedule> result = doctorScheduleService.findAll();

        assertEquals(1, result.size());
    }

    @Test
    void findByEmployeeId_ShouldReturnSchedules() {
        List<DoctorSchedule> schedules = List.of(schedule);
        when(doctorScheduleRepository.findByEmployee_Id(employeeId)).thenReturn(schedules);

        List<DoctorSchedule> result = doctorScheduleService.findByEmployeeId(employeeId);

        assertEquals(1, result.size());
    }

    @Test
    void findByEmployeeIdAndDayOfWeek_ShouldReturnSchedules() {
        List<DoctorSchedule> schedules = List.of(schedule);
        when(doctorScheduleRepository.findByEmployee_IdAndDayOfWeek(employeeId, 1))
                .thenReturn(schedules);

        List<DoctorSchedule> result = doctorScheduleService.findByEmployeeIdAndDayOfWeek(employeeId, 1);

        assertEquals(1, result.size());
    }

    @Test
    void findActiveByEmployeeId_ShouldReturnSchedules() {
        LocalDate date = LocalDate.now();
        List<DoctorSchedule> schedules = List.of(schedule);
        when(doctorScheduleRepository.findActiveByEmployeeOnDate(employeeId, date))
                .thenReturn(schedules);

        List<DoctorSchedule> result = doctorScheduleService.findActiveByEmployeeId(employeeId, date);

        assertEquals(1, result.size());
    }

    @Test
    void update_WhenExists_ShouldReturnUpdatedSchedule() {
        when(doctorScheduleRepository.existsById(scheduleId)).thenReturn(true);
        when(doctorScheduleRepository.save(any(DoctorSchedule.class))).thenReturn(schedule);

        DoctorSchedule result = doctorScheduleService.update(schedule);

        assertNotNull(result);
        verify(doctorScheduleRepository, times(1)).save(schedule);
    }

    @Test
    void update_WhenNotExists_ShouldThrowException() {
        when(doctorScheduleRepository.existsById(scheduleId)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () -> doctorScheduleService.update(schedule));
    }

    @Test
    void deleteById_WhenExists_ShouldDelete() {
        when(doctorScheduleRepository.existsById(scheduleId)).thenReturn(true);
        doNothing().when(doctorScheduleRepository).deleteById(scheduleId);

        doctorScheduleService.deleteById(scheduleId);

        verify(doctorScheduleRepository, times(1)).deleteById(scheduleId);
    }

    @Test
    void deleteById_WhenNotExists_ShouldThrowException() {
        when(doctorScheduleRepository.existsById(scheduleId)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () -> doctorScheduleService.deleteById(scheduleId));
    }
}
