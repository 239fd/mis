package by.bsuir.mis.service.impl;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import by.bsuir.mis.entity.MedicalSpecialty;
import by.bsuir.mis.exception.ResourceNotFoundException;
import by.bsuir.mis.repository.MedicalSpecialtyRepository;
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
class MedicalSpecialtyServiceImplTest {

    @Mock
    private MedicalSpecialtyRepository medicalSpecialtyRepository;

    @InjectMocks
    private MedicalSpecialtyServiceImpl medicalSpecialtyService;

    private MedicalSpecialty specialty;
    private UUID specialtyId;

    @BeforeEach
    void setUp() {
        specialtyId = UUID.randomUUID();
        specialty = MedicalSpecialty.builder()
                .id(specialtyId)
                .name("Cardiology")
                .description("Heart specialist")
                .build();
    }

    @Test
    void save_ShouldReturnSavedSpecialty() {
        when(medicalSpecialtyRepository.save(any(MedicalSpecialty.class))).thenReturn(specialty);

        MedicalSpecialty result = medicalSpecialtyService.save(specialty);

        assertNotNull(result);
        assertEquals(specialtyId, result.getId());
        verify(medicalSpecialtyRepository, times(1)).save(specialty);
    }

    @Test
    void findById_WhenExists_ShouldReturnSpecialty() {
        when(medicalSpecialtyRepository.findById(specialtyId)).thenReturn(Optional.of(specialty));

        Optional<MedicalSpecialty> result = medicalSpecialtyService.findById(specialtyId);

        assertTrue(result.isPresent());
        assertEquals(specialtyId, result.get().getId());
    }

    @Test
    void findById_WhenNotExists_ShouldReturnEmpty() {
        when(medicalSpecialtyRepository.findById(specialtyId)).thenReturn(Optional.empty());

        Optional<MedicalSpecialty> result = medicalSpecialtyService.findById(specialtyId);

        assertFalse(result.isPresent());
    }

    @Test
    void findByName_WhenExists_ShouldReturnSpecialty() {
        when(medicalSpecialtyRepository.findByName("Cardiology")).thenReturn(Optional.of(specialty));

        Optional<MedicalSpecialty> result = medicalSpecialtyService.findByName("Cardiology");

        assertTrue(result.isPresent());
        assertEquals("Cardiology", result.get().getName());
    }

    @Test
    void findByName_WhenNotExists_ShouldReturnEmpty() {
        when(medicalSpecialtyRepository.findByName("Cardiology")).thenReturn(Optional.empty());

        Optional<MedicalSpecialty> result = medicalSpecialtyService.findByName("Cardiology");

        assertFalse(result.isPresent());
    }

    @Test
    void findAll_ShouldReturnAllSpecialties() {
        List<MedicalSpecialty> specialties = List.of(specialty);
        when(medicalSpecialtyRepository.findAll()).thenReturn(specialties);

        List<MedicalSpecialty> result = medicalSpecialtyService.findAll();

        assertEquals(1, result.size());
    }

    @Test
    void update_WhenExists_ShouldReturnUpdatedSpecialty() {
        when(medicalSpecialtyRepository.existsById(specialtyId)).thenReturn(true);
        when(medicalSpecialtyRepository.save(any(MedicalSpecialty.class))).thenReturn(specialty);

        MedicalSpecialty result = medicalSpecialtyService.update(specialty);

        assertNotNull(result);
        verify(medicalSpecialtyRepository, times(1)).save(specialty);
    }

    @Test
    void update_WhenNotExists_ShouldThrowException() {
        when(medicalSpecialtyRepository.existsById(specialtyId)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () -> medicalSpecialtyService.update(specialty));
    }

    @Test
    void deleteById_WhenExists_ShouldDelete() {
        when(medicalSpecialtyRepository.existsById(specialtyId)).thenReturn(true);
        doNothing().when(medicalSpecialtyRepository).deleteById(specialtyId);

        medicalSpecialtyService.deleteById(specialtyId);

        verify(medicalSpecialtyRepository, times(1)).deleteById(specialtyId);
    }

    @Test
    void deleteById_WhenNotExists_ShouldThrowException() {
        when(medicalSpecialtyRepository.existsById(specialtyId)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () -> medicalSpecialtyService.deleteById(specialtyId));
    }

    @Test
    void existsByName_WhenExists_ShouldReturnTrue() {
        when(medicalSpecialtyRepository.existsByName("Cardiology")).thenReturn(true);

        boolean result = medicalSpecialtyService.existsByName("Cardiology");

        assertTrue(result);
    }

    @Test
    void existsByName_WhenNotExists_ShouldReturnFalse() {
        when(medicalSpecialtyRepository.existsByName("Cardiology")).thenReturn(false);

        boolean result = medicalSpecialtyService.existsByName("Cardiology");

        assertFalse(result);
    }
}
