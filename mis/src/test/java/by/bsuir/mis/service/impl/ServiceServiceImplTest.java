package by.bsuir.mis.service.impl;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import by.bsuir.mis.entity.Service;
import by.bsuir.mis.exception.ResourceNotFoundException;
import by.bsuir.mis.repository.ServiceRepository;
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
class ServiceServiceImplTest {

    @Mock
    private ServiceRepository serviceRepository;

    @InjectMocks
    private ServiceServiceImpl serviceService;

    private Service service;
    private UUID serviceId;

    @BeforeEach
    void setUp() {
        serviceId = UUID.randomUUID();
        service = Service.builder()
                .id(serviceId)
                .name("Consultation")
                .description("Medical consultation")
                .isActive(true)
                .build();
    }

    @Test
    void save_ShouldReturnSavedService() {
        when(serviceRepository.save(any(Service.class))).thenReturn(service);

        Service result = serviceService.save(service);

        assertNotNull(result);
        assertEquals(serviceId, result.getId());
        verify(serviceRepository, times(1)).save(service);
    }

    @Test
    void findById_WhenExists_ShouldReturnService() {
        when(serviceRepository.findById(serviceId)).thenReturn(Optional.of(service));

        Optional<Service> result = serviceService.findById(serviceId);

        assertTrue(result.isPresent());
        assertEquals(serviceId, result.get().getId());
    }

    @Test
    void findById_WhenNotExists_ShouldReturnEmpty() {
        when(serviceRepository.findById(serviceId)).thenReturn(Optional.empty());

        Optional<Service> result = serviceService.findById(serviceId);

        assertFalse(result.isPresent());
    }

    @Test
    void findByName_WhenExists_ShouldReturnService() {
        when(serviceRepository.findByName("Consultation")).thenReturn(Optional.of(service));

        Optional<Service> result = serviceService.findByName("Consultation");

        assertTrue(result.isPresent());
        assertEquals("Consultation", result.get().getName());
    }

    @Test
    void findByName_WhenNotExists_ShouldReturnEmpty() {
        when(serviceRepository.findByName("Consultation")).thenReturn(Optional.empty());

        Optional<Service> result = serviceService.findByName("Consultation");

        assertFalse(result.isPresent());
    }

    @Test
    void findAll_ShouldReturnAllServices() {
        List<Service> services = List.of(service);
        when(serviceRepository.findAll()).thenReturn(services);

        List<Service> result = serviceService.findAll();

        assertEquals(1, result.size());
    }

    @Test
    void findAllActive_ShouldReturnActiveServices() {
        List<Service> services = List.of(service);
        when(serviceRepository.findByIsActive(true)).thenReturn(services);

        List<Service> result = serviceService.findAllActive();

        assertEquals(1, result.size());
    }

    @Test
    void update_WhenExists_ShouldReturnUpdatedService() {
        when(serviceRepository.existsById(serviceId)).thenReturn(true);
        when(serviceRepository.save(any(Service.class))).thenReturn(service);

        Service result = serviceService.update(service);

        assertNotNull(result);
        verify(serviceRepository, times(1)).save(service);
    }

    @Test
    void update_WhenNotExists_ShouldThrowException() {
        when(serviceRepository.existsById(serviceId)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () -> serviceService.update(service));
    }

    @Test
    void deleteById_WhenExists_ShouldDelete() {
        when(serviceRepository.existsById(serviceId)).thenReturn(true);
        doNothing().when(serviceRepository).deleteById(serviceId);

        serviceService.deleteById(serviceId);

        verify(serviceRepository, times(1)).deleteById(serviceId);
    }

    @Test
    void deleteById_WhenNotExists_ShouldThrowException() {
        when(serviceRepository.existsById(serviceId)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () -> serviceService.deleteById(serviceId));
    }

    @Test
    void deactivate_WhenExists_ShouldDeactivate() {
        when(serviceRepository.findById(serviceId)).thenReturn(Optional.of(service));
        when(serviceRepository.save(any(Service.class))).thenReturn(service);

        serviceService.deactivate(serviceId);

        assertFalse(service.getIsActive());
        verify(serviceRepository, times(1)).save(service);
    }

    @Test
    void deactivate_WhenNotExists_ShouldThrowException() {
        when(serviceRepository.findById(serviceId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> serviceService.deactivate(serviceId));
    }

    @Test
    void existsByName_WhenExists_ShouldReturnTrue() {
        when(serviceRepository.existsByName("Consultation")).thenReturn(true);

        boolean result = serviceService.existsByName("Consultation");

        assertTrue(result);
    }

    @Test
    void existsByName_WhenNotExists_ShouldReturnFalse() {
        when(serviceRepository.existsByName("Consultation")).thenReturn(false);

        boolean result = serviceService.existsByName("Consultation");

        assertFalse(result);
    }
}
