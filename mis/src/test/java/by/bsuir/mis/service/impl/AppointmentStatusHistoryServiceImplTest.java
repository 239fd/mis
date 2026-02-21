package by.bsuir.mis.service.impl;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import by.bsuir.mis.entity.Appointment;
import by.bsuir.mis.entity.AppointmentStatusHistory;
import by.bsuir.mis.entity.User;
import by.bsuir.mis.entity.enums.AppointmentStatus;
import by.bsuir.mis.repository.AppointmentStatusHistoryRepository;
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
class AppointmentStatusHistoryServiceImplTest {

    @Mock
    private AppointmentStatusHistoryRepository appointmentStatusHistoryRepository;

    @InjectMocks
    private AppointmentStatusHistoryServiceImpl appointmentStatusHistoryService;

    private AppointmentStatusHistory history;
    private UUID historyId;
    private UUID appointmentId;
    private UUID userId;

    @BeforeEach
    void setUp() {
        historyId = UUID.randomUUID();
        appointmentId = UUID.randomUUID();
        userId = UUID.randomUUID();

        Appointment appointment = Appointment.builder().id(appointmentId).build();
        User user = User.builder().id(userId).build();

        history = AppointmentStatusHistory.builder()
                .id(historyId)
                .appointment(appointment)
                .oldStatus(AppointmentStatus.WAITING)
                .newStatus(AppointmentStatus.IN_PROGRESS)
                .changedBy(user)
                .build();
    }

    @Test
    void save_ShouldReturnSavedHistory() {
        when(appointmentStatusHistoryRepository.save(any(AppointmentStatusHistory.class)))
                .thenReturn(history);

        AppointmentStatusHistory result = appointmentStatusHistoryService.save(history);

        assertNotNull(result);
        assertEquals(historyId, result.getId());
        verify(appointmentStatusHistoryRepository, times(1)).save(history);
    }

    @Test
    void findById_WhenExists_ShouldReturnHistory() {
        when(appointmentStatusHistoryRepository.findById(historyId)).thenReturn(Optional.of(history));

        Optional<AppointmentStatusHistory> result = appointmentStatusHistoryService.findById(historyId);

        assertTrue(result.isPresent());
        assertEquals(historyId, result.get().getId());
    }

    @Test
    void findById_WhenNotExists_ShouldReturnEmpty() {
        when(appointmentStatusHistoryRepository.findById(historyId)).thenReturn(Optional.empty());

        Optional<AppointmentStatusHistory> result = appointmentStatusHistoryService.findById(historyId);

        assertFalse(result.isPresent());
    }

    @Test
    void findAll_ShouldReturnAllHistories() {
        List<AppointmentStatusHistory> histories = List.of(history);
        when(appointmentStatusHistoryRepository.findAll()).thenReturn(histories);

        List<AppointmentStatusHistory> result = appointmentStatusHistoryService.findAll();

        assertEquals(1, result.size());
    }

    @Test
    void findByAppointmentId_ShouldReturnHistories() {
        List<AppointmentStatusHistory> histories = List.of(history);
        when(appointmentStatusHistoryRepository.findByAppointment_IdOrderByCreatedAtDesc(appointmentId))
                .thenReturn(histories);

        List<AppointmentStatusHistory> result = appointmentStatusHistoryService.findByAppointmentId(appointmentId);

        assertEquals(1, result.size());
    }

    @Test
    void findByChangedByUserId_ShouldReturnHistories() {
        List<AppointmentStatusHistory> histories = List.of(history);
        when(appointmentStatusHistoryRepository.findByChangedBy_Id(userId)).thenReturn(histories);

        List<AppointmentStatusHistory> result = appointmentStatusHistoryService.findByChangedByUserId(userId);

        assertEquals(1, result.size());
    }
}
