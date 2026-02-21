package by.bsuir.mis.service.impl;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import by.bsuir.mis.entity.DoctorService;
import by.bsuir.mis.entity.Employee;
import by.bsuir.mis.entity.Service;
import by.bsuir.mis.exception.ResourceNotFoundException;
import by.bsuir.mis.repository.DoctorServiceRepository;
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
class DoctorServiceServiceImplTest {

    @Mock
    private DoctorServiceRepository doctorServiceRepository;

    @InjectMocks
    private DoctorServiceServiceImpl doctorServiceService;

    private DoctorService doctorService;
    private UUID doctorServiceId;
    private UUID employeeId;
    private UUID serviceId;

    @BeforeEach
    void setUp() {
        doctorServiceId = UUID.randomUUID();
        employeeId = UUID.randomUUID();
        serviceId = UUID.randomUUID();

        Employee employee = Employee.builder().id(employeeId).build();
        Service service = Service.builder().id(serviceId).build();

        doctorService = DoctorService.builder()
                .id(doctorServiceId)
                .employee(employee)
                .service(service)
                .isActive(true)
                .build();
    }

    @Test
    void save_ShouldReturnSavedDoctorService() {
        when(doctorServiceRepository.save(any(DoctorService.class))).thenReturn(doctorService);

        DoctorService result = doctorServiceService.save(doctorService);

        assertNotNull(result);
        assertEquals(doctorServiceId, result.getId());
        verify(doctorServiceRepository, times(1)).save(doctorService);
    }

    @Test
    void findById_WhenExists_ShouldReturnDoctorService() {
        when(doctorServiceRepository.findById(doctorServiceId)).thenReturn(Optional.of(doctorService));

        Optional<DoctorService> result = doctorServiceService.findById(doctorServiceId);

        assertTrue(result.isPresent());
        assertEquals(doctorServiceId, result.get().getId());
    }

    @Test
    void findById_WhenNotExists_ShouldReturnEmpty() {
        when(doctorServiceRepository.findById(doctorServiceId)).thenReturn(Optional.empty());

        Optional<DoctorService> result = doctorServiceService.findById(doctorServiceId);

        assertFalse(result.isPresent());
    }

    @Test
    void findAll_ShouldReturnAllDoctorServices() {
        List<DoctorService> doctorServices = List.of(doctorService);
        when(doctorServiceRepository.findAll()).thenReturn(doctorServices);

        List<DoctorService> result = doctorServiceService.findAll();

        assertEquals(1, result.size());
    }

    @Test
    void findByEmployeeId_ShouldReturnDoctorServices() {
        List<DoctorService> doctorServices = List.of(doctorService);
        when(doctorServiceRepository.findByEmployee_Id(employeeId)).thenReturn(doctorServices);

        List<DoctorService> result = doctorServiceService.findByEmployeeId(employeeId);

        assertEquals(1, result.size());
    }

    @Test
    void findByServiceId_ShouldReturnDoctorServices() {
        List<DoctorService> doctorServices = List.of(doctorService);
        when(doctorServiceRepository.findByService_Id(serviceId)).thenReturn(doctorServices);

        List<DoctorService> result = doctorServiceService.findByServiceId(serviceId);

        assertEquals(1, result.size());
    }

    @Test
    void findActiveByEmployeeId_ShouldReturnActiveDoctorServices() {
        List<DoctorService> doctorServices = List.of(doctorService);
        when(doctorServiceRepository.findByEmployee_IdAndIsActive(employeeId, true))
                .thenReturn(doctorServices);

        List<DoctorService> result = doctorServiceService.findActiveByEmployeeId(employeeId);

        assertEquals(1, result.size());
    }

    @Test
    void findByEmployeeIdAndServiceId_ShouldReturnDoctorService() {
        when(doctorServiceRepository.findByEmployee_IdAndService_Id(employeeId, serviceId))
                .thenReturn(Optional.of(doctorService));

        Optional<DoctorService> result = doctorServiceService.findByEmployeeIdAndServiceId(employeeId, serviceId);

        assertTrue(result.isPresent());
    }

    @Test
    void update_WhenExists_ShouldReturnUpdatedDoctorService() {
        when(doctorServiceRepository.existsById(doctorServiceId)).thenReturn(true);
        when(doctorServiceRepository.save(any(DoctorService.class))).thenReturn(doctorService);

        DoctorService result = doctorServiceService.update(doctorService);

        assertNotNull(result);
        verify(doctorServiceRepository, times(1)).save(doctorService);
    }

    @Test
    void update_WhenNotExists_ShouldThrowException() {
        when(doctorServiceRepository.existsById(doctorServiceId)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () -> doctorServiceService.update(doctorService));
    }

    @Test
    void deleteById_WhenExists_ShouldDelete() {
        when(doctorServiceRepository.existsById(doctorServiceId)).thenReturn(true);
        doNothing().when(doctorServiceRepository).deleteById(doctorServiceId);

        doctorServiceService.deleteById(doctorServiceId);

        verify(doctorServiceRepository, times(1)).deleteById(doctorServiceId);
    }

    @Test
    void deleteById_WhenNotExists_ShouldThrowException() {
        when(doctorServiceRepository.existsById(doctorServiceId)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () -> doctorServiceService.deleteById(doctorServiceId));
    }

    @Test
    void deactivate_WhenExists_ShouldDeactivate() {
        when(doctorServiceRepository.findById(doctorServiceId)).thenReturn(Optional.of(doctorService));
        when(doctorServiceRepository.save(any(DoctorService.class))).thenReturn(doctorService);

        doctorServiceService.deactivate(doctorServiceId);

        assertFalse(doctorService.getIsActive());
        verify(doctorServiceRepository, times(1)).save(doctorService);
    }

    @Test
    void deactivate_WhenNotExists_ShouldThrowException() {
        when(doctorServiceRepository.findById(doctorServiceId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> doctorServiceService.deactivate(doctorServiceId));
    }
}
