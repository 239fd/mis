package by.bsuir.mis.service.impl;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import by.bsuir.mis.entity.Patient;
import by.bsuir.mis.entity.User;
import by.bsuir.mis.entity.UserPatient;
import by.bsuir.mis.entity.enums.Gender;
import by.bsuir.mis.entity.enums.Relationship;
import by.bsuir.mis.exception.BadRequestException;
import by.bsuir.mis.exception.ResourceAlreadyExistsException;
import by.bsuir.mis.exception.ResourceNotFoundException;
import by.bsuir.mis.repository.PatientRepository;
import by.bsuir.mis.repository.UserPatientRepository;
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
class PatientServiceImplTest {

    @Mock
    private PatientRepository patientRepository;

    @Mock
    private UserPatientRepository userPatientRepository;

    @InjectMocks
    private PatientServiceImpl patientService;

    private Patient patient;
    private UUID patientId;
    private User user;
    private UUID userId;

    @BeforeEach
    void setUp() {
        patientId = UUID.randomUUID();
        userId = UUID.randomUUID();

        patient = Patient.builder()
                .id(patientId)
                .firstName("John")
                .lastName("Doe")
                .gender(Gender.MALE)
                .birthDate(LocalDate.of(1990, 1, 1))
                .passportSeries("AB")
                .passportNumber("1234567")
                .build();

        user = User.builder().id(userId).login("testuser").build();
    }

    @Test
    void save_ShouldReturnSavedPatient() {
        when(patientRepository.save(any(Patient.class))).thenReturn(patient);

        Patient result = patientService.save(patient);

        assertNotNull(result);
        assertEquals(patientId, result.getId());
        verify(patientRepository, times(1)).save(patient);
    }

    @Test
    void createPatientWithLink_ShouldCreatePatientAndLink() {
        when(userPatientRepository.existsByUser_IdAndRelationship(userId, Relationship.SELF))
                .thenReturn(false);
        when(patientRepository.existsByPassportSeriesAndPassportNumber("AB", "1234567"))
                .thenReturn(false);
        when(patientRepository.save(any(Patient.class))).thenReturn(patient);
        when(userPatientRepository.save(any(UserPatient.class)))
                .thenReturn(UserPatient.builder().build());

        Patient result = patientService.createPatientWithLink(patient, user, Relationship.SELF);

        assertNotNull(result);
        verify(patientRepository, times(1)).save(patient);
        verify(userPatientRepository, times(1)).save(any(UserPatient.class));
    }

    @Test
    void createPatientWithLink_WhenSelfExists_ShouldThrowException() {
        when(userPatientRepository.existsByUser_IdAndRelationship(userId, Relationship.SELF))
                .thenReturn(true);

        assertThrows(
                BadRequestException.class,
                () -> patientService.createPatientWithLink(patient, user, Relationship.SELF));
    }

    @Test
    void createPatientWithLink_WhenPassportExists_ShouldThrowException() {
        when(userPatientRepository.existsByUser_IdAndRelationship(userId, Relationship.SELF))
                .thenReturn(false);
        when(patientRepository.existsByPassportSeriesAndPassportNumber("AB", "1234567"))
                .thenReturn(true);

        assertThrows(
                ResourceAlreadyExistsException.class,
                () -> patientService.createPatientWithLink(patient, user, Relationship.SELF));
    }

    @Test
    void findById_WhenExists_ShouldReturnPatient() {
        when(patientRepository.findById(patientId)).thenReturn(Optional.of(patient));

        Optional<Patient> result = patientService.findById(patientId);

        assertTrue(result.isPresent());
        assertEquals(patientId, result.get().getId());
    }

    @Test
    void findById_WhenNotExists_ShouldReturnEmpty() {
        when(patientRepository.findById(patientId)).thenReturn(Optional.empty());

        Optional<Patient> result = patientService.findById(patientId);

        assertFalse(result.isPresent());
    }

    @Test
    void findByPassport_ShouldReturnPatient() {
        when(patientRepository.findByPassportSeriesAndPassportNumber("AB", "1234567"))
                .thenReturn(Optional.of(patient));

        Optional<Patient> result = patientService.findByPassport("AB", "1234567");

        assertTrue(result.isPresent());
    }

    @Test
    void findAll_ShouldReturnAllPatients() {
        List<Patient> patients = List.of(patient);
        when(patientRepository.findAll()).thenReturn(patients);

        List<Patient> result = patientService.findAll();

        assertEquals(1, result.size());
    }

    @Test
    void findByLastName_ShouldReturnPatients() {
        List<Patient> patients = List.of(patient);
        when(patientRepository.searchByName("Doe")).thenReturn(patients);

        List<Patient> result = patientService.findByLastName("Doe");

        assertEquals(1, result.size());
    }

    @Test
    void update_WhenExists_ShouldReturnUpdatedPatient() {
        when(patientRepository.existsById(patientId)).thenReturn(true);
        when(patientRepository.save(any(Patient.class))).thenReturn(patient);

        Patient result = patientService.update(patient);

        assertNotNull(result);
        verify(patientRepository, times(1)).save(patient);
    }

    @Test
    void update_WhenNotExists_ShouldThrowException() {
        when(patientRepository.existsById(patientId)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () -> patientService.update(patient));
    }

    @Test
    void deleteById_WhenExists_ShouldDelete() {
        when(patientRepository.existsById(patientId)).thenReturn(true);
        doNothing().when(patientRepository).deleteById(patientId);

        patientService.deleteById(patientId);

        verify(patientRepository, times(1)).deleteById(patientId);
    }

    @Test
    void deleteById_WhenNotExists_ShouldThrowException() {
        when(patientRepository.existsById(patientId)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () -> patientService.deleteById(patientId));
    }

    @Test
    void existsByPassport_WhenExists_ShouldReturnTrue() {
        when(patientRepository.existsByPassportSeriesAndPassportNumber("AB", "1234567"))
                .thenReturn(true);

        boolean result = patientService.existsByPassport("AB", "1234567");

        assertTrue(result);
    }

    @Test
    void existsByPassport_WhenNotExists_ShouldReturnFalse() {
        when(patientRepository.existsByPassportSeriesAndPassportNumber("AB", "1234567"))
                .thenReturn(false);

        boolean result = patientService.existsByPassport("AB", "1234567");

        assertFalse(result);
    }
}
