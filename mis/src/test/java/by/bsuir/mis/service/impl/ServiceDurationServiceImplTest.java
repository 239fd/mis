package by.bsuir.mis.service.impl;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import by.bsuir.mis.entity.Service;
import by.bsuir.mis.entity.ServiceDuration;
import by.bsuir.mis.exception.ResourceNotFoundException;
import by.bsuir.mis.repository.ServiceDurationRepository;
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
class ServiceDurationServiceImplTest {

    @Mock
    private ServiceDurationRepository serviceDurationRepository;

    @InjectMocks
    private ServiceDurationServiceImpl serviceDurationService;

    private ServiceDuration serviceDuration;
    private UUID serviceDurationId;
    private UUID serviceId;

    @BeforeEach
    void setUp() {
        serviceDurationId = UUID.randomUUID();
        serviceId = UUID.randomUUID();

        Service service = Service.builder().id(serviceId).build();

        serviceDuration = ServiceDuration.builder()
                .id(serviceDurationId)
                .service(service)
                .durationMin(30)
                .effectiveFrom(LocalDate.now())
                .build();
    }

    @Test
    void save_ShouldReturnSavedServiceDuration() {
        when(serviceDurationRepository.save(any(ServiceDuration.class))).thenReturn(serviceDuration);

        ServiceDuration result = serviceDurationService.save(serviceDuration);

        assertNotNull(result);
        assertEquals(serviceDurationId, result.getId());
        verify(serviceDurationRepository, times(1)).save(serviceDuration);
    }

    @Test
    void findById_WhenExists_ShouldReturnServiceDuration() {
        when(serviceDurationRepository.findById(serviceDurationId)).thenReturn(Optional.of(serviceDuration));

        Optional<ServiceDuration> result = serviceDurationService.findById(serviceDurationId);

        assertTrue(result.isPresent());
        assertEquals(serviceDurationId, result.get().getId());
    }

    @Test
    void findById_WhenNotExists_ShouldReturnEmpty() {
        when(serviceDurationRepository.findById(serviceDurationId)).thenReturn(Optional.empty());

        Optional<ServiceDuration> result = serviceDurationService.findById(serviceDurationId);

        assertFalse(result.isPresent());
    }

    @Test
    void findAll_ShouldReturnAllServiceDurations() {
        List<ServiceDuration> durations = List.of(serviceDuration);
        when(serviceDurationRepository.findAll()).thenReturn(durations);

        List<ServiceDuration> result = serviceDurationService.findAll();

        assertEquals(1, result.size());
    }

    @Test
    void findByServiceId_ShouldReturnServiceDurations() {
        List<ServiceDuration> durations = List.of(serviceDuration);
        when(serviceDurationRepository.findByService_Id(serviceId)).thenReturn(durations);

        List<ServiceDuration> result = serviceDurationService.findByServiceId(serviceId);

        assertEquals(1, result.size());
    }

    @Test
    void findActiveByServiceId_ShouldReturnActiveServiceDuration() {
        LocalDate date = LocalDate.now();
        when(serviceDurationRepository.findActiveByServiceIdOnDate(serviceId, date))
                .thenReturn(Optional.of(serviceDuration));

        Optional<ServiceDuration> result = serviceDurationService.findActiveByServiceId(serviceId, date);

        assertTrue(result.isPresent());
    }

    @Test
    void update_WhenExists_ShouldReturnUpdatedServiceDuration() {
        when(serviceDurationRepository.existsById(serviceDurationId)).thenReturn(true);
        when(serviceDurationRepository.save(any(ServiceDuration.class))).thenReturn(serviceDuration);

        ServiceDuration result = serviceDurationService.update(serviceDuration);

        assertNotNull(result);
        verify(serviceDurationRepository, times(1)).save(serviceDuration);
    }

    @Test
    void update_WhenNotExists_ShouldThrowException() {
        when(serviceDurationRepository.existsById(serviceDurationId)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () -> serviceDurationService.update(serviceDuration));
    }

    @Test
    void deleteById_WhenExists_ShouldDelete() {
        when(serviceDurationRepository.existsById(serviceDurationId)).thenReturn(true);
        doNothing().when(serviceDurationRepository).deleteById(serviceDurationId);

        serviceDurationService.deleteById(serviceDurationId);

        verify(serviceDurationRepository, times(1)).deleteById(serviceDurationId);
    }

    @Test
    void deleteById_WhenNotExists_ShouldThrowException() {
        when(serviceDurationRepository.existsById(serviceDurationId)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () -> serviceDurationService.deleteById(serviceDurationId));
    }
}
