package by.bsuir.mis.service.impl;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import by.bsuir.mis.entity.Employee;
import by.bsuir.mis.entity.ScheduleException;
import by.bsuir.mis.entity.User;
import by.bsuir.mis.entity.enums.ExceptionType;
import by.bsuir.mis.exception.ResourceNotFoundException;
import by.bsuir.mis.repository.ScheduleExceptionRepository;
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
class ScheduleExceptionServiceImplTest {

    @Mock
    private ScheduleExceptionRepository scheduleExceptionRepository;

    @InjectMocks
    private ScheduleExceptionServiceImpl scheduleExceptionService;

    private ScheduleException scheduleException;
    private UUID scheduleExceptionId;
    private UUID employeeId;

    @BeforeEach
    void setUp() {
        scheduleExceptionId = UUID.randomUUID();
        employeeId = UUID.randomUUID();

        Employee employee = Employee.builder().id(employeeId).build();
        User user = User.builder().id(UUID.randomUUID()).build();

        scheduleException = ScheduleException.builder()
                .id(scheduleExceptionId)
                .employee(employee)
                .exceptionType(ExceptionType.VACATION)
                .dateFrom(LocalDate.now())
                .dateTo(LocalDate.now().plusDays(7))
                .reason("Annual leave")
                .createdBy(user)
                .build();
    }

    @Test
    void save_ShouldReturnSavedException() {
        when(scheduleExceptionRepository.save(any(ScheduleException.class))).thenReturn(scheduleException);

        ScheduleException result = scheduleExceptionService.save(scheduleException);

        assertNotNull(result);
        assertEquals(scheduleExceptionId, result.getId());
        verify(scheduleExceptionRepository, times(1)).save(scheduleException);
    }

    @Test
    void findById_WhenExists_ShouldReturnException() {
        when(scheduleExceptionRepository.findById(scheduleExceptionId)).thenReturn(Optional.of(scheduleException));

        Optional<ScheduleException> result = scheduleExceptionService.findById(scheduleExceptionId);

        assertTrue(result.isPresent());
        assertEquals(scheduleExceptionId, result.get().getId());
    }

    @Test
    void findById_WhenNotExists_ShouldReturnEmpty() {
        when(scheduleExceptionRepository.findById(scheduleExceptionId)).thenReturn(Optional.empty());

        Optional<ScheduleException> result = scheduleExceptionService.findById(scheduleExceptionId);

        assertFalse(result.isPresent());
    }

    @Test
    void findAll_ShouldReturnAllExceptions() {
        List<ScheduleException> exceptions = List.of(scheduleException);
        when(scheduleExceptionRepository.findAll()).thenReturn(exceptions);

        List<ScheduleException> result = scheduleExceptionService.findAll();

        assertEquals(1, result.size());
    }

    @Test
    void findByEmployeeId_ShouldReturnExceptions() {
        List<ScheduleException> exceptions = List.of(scheduleException);
        when(scheduleExceptionRepository.findByEmployee_Id(employeeId)).thenReturn(exceptions);

        List<ScheduleException> result = scheduleExceptionService.findByEmployeeId(employeeId);

        assertEquals(1, result.size());
    }

    @Test
    void findByEmployeeIdAndDateRange_ShouldReturnExceptions() {
        LocalDate dateFrom = LocalDate.now();
        LocalDate dateTo = LocalDate.now().plusDays(7);
        List<ScheduleException> exceptions = List.of(scheduleException);
        when(scheduleExceptionRepository.findByEmployeeIdInDateRange(employeeId, dateFrom, dateTo))
                .thenReturn(exceptions);

        List<ScheduleException> result =
                scheduleExceptionService.findByEmployeeIdAndDateRange(employeeId, dateFrom, dateTo);

        assertEquals(1, result.size());
    }

    @Test
    void hasExceptionOnDate_WhenExists_ShouldReturnTrue() {
        LocalDate date = LocalDate.now();
        when(scheduleExceptionRepository.findByEmployeeIdOnDate(employeeId, date))
                .thenReturn(List.of(scheduleException));

        boolean result = scheduleExceptionService.hasExceptionOnDate(employeeId, date);

        assertTrue(result);
    }

    @Test
    void hasExceptionOnDate_WhenNotExists_ShouldReturnFalse() {
        LocalDate date = LocalDate.now();
        when(scheduleExceptionRepository.findByEmployeeIdOnDate(employeeId, date))
                .thenReturn(List.of());

        boolean result = scheduleExceptionService.hasExceptionOnDate(employeeId, date);

        assertFalse(result);
    }

    @Test
    void update_WhenExists_ShouldReturnUpdatedException() {
        when(scheduleExceptionRepository.existsById(scheduleExceptionId)).thenReturn(true);
        when(scheduleExceptionRepository.save(any(ScheduleException.class))).thenReturn(scheduleException);

        ScheduleException result = scheduleExceptionService.update(scheduleException);

        assertNotNull(result);
        verify(scheduleExceptionRepository, times(1)).save(scheduleException);
    }

    @Test
    void update_WhenNotExists_ShouldThrowException() {
        when(scheduleExceptionRepository.existsById(scheduleExceptionId)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () -> scheduleExceptionService.update(scheduleException));
    }

    @Test
    void deleteById_WhenExists_ShouldDelete() {
        when(scheduleExceptionRepository.existsById(scheduleExceptionId)).thenReturn(true);
        doNothing().when(scheduleExceptionRepository).deleteById(scheduleExceptionId);

        scheduleExceptionService.deleteById(scheduleExceptionId);

        verify(scheduleExceptionRepository, times(1)).deleteById(scheduleExceptionId);
    }

    @Test
    void deleteById_WhenNotExists_ShouldThrowException() {
        when(scheduleExceptionRepository.existsById(scheduleExceptionId)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () -> scheduleExceptionService.deleteById(scheduleExceptionId));
    }
}
