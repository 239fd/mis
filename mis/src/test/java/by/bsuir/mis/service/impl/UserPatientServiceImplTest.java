package by.bsuir.mis.service.impl;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import by.bsuir.mis.entity.Patient;
import by.bsuir.mis.entity.User;
import by.bsuir.mis.entity.UserPatient;
import by.bsuir.mis.entity.enums.Relationship;
import by.bsuir.mis.exception.BadRequestException;
import by.bsuir.mis.exception.ResourceAlreadyExistsException;
import by.bsuir.mis.exception.ResourceNotFoundException;
import by.bsuir.mis.repository.UserPatientRepository;
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
class UserPatientServiceImplTest {

    @Mock
    private UserPatientRepository userPatientRepository;

    @InjectMocks
    private UserPatientServiceImpl userPatientService;

    private UserPatient userPatient;
    private UUID userPatientId;
    private UUID userId;
    private UUID patientId;
    private User user;
    private Patient patient;

    @BeforeEach
    void setUp() {
        userPatientId = UUID.randomUUID();
        userId = UUID.randomUUID();
        patientId = UUID.randomUUID();

        user = User.builder().id(userId).build();
        patient = Patient.builder().id(patientId).build();

        userPatient = UserPatient.builder()
                .id(userPatientId)
                .user(user)
                .patient(patient)
                .relationship(Relationship.SELF)
                .build();
    }

    @Test
    void save_ShouldReturnSavedUserPatient() {
        when(userPatientRepository.save(any(UserPatient.class))).thenReturn(userPatient);

        UserPatient result = userPatientService.save(userPatient);

        assertNotNull(result);
        assertEquals(userPatientId, result.getId());
        verify(userPatientRepository, times(1)).save(userPatient);
    }

    @Test
    void linkPatientToUser_ShouldCreateLink() {
        when(userPatientRepository.existsByUser_IdAndRelationship(userId, Relationship.SELF))
                .thenReturn(false);
        when(userPatientRepository.existsByUser_IdAndPatient_Id(userId, patientId))
                .thenReturn(false);
        when(userPatientRepository.save(any(UserPatient.class))).thenReturn(userPatient);

        UserPatient result = userPatientService.linkPatientToUser(user, patient, Relationship.SELF);

        assertNotNull(result);
        verify(userPatientRepository, times(1)).save(any(UserPatient.class));
    }

    @Test
    void linkPatientToUser_WhenSelfExists_ShouldThrowException() {
        when(userPatientRepository.existsByUser_IdAndRelationship(userId, Relationship.SELF))
                .thenReturn(true);

        assertThrows(
                BadRequestException.class,
                () -> userPatientService.linkPatientToUser(user, patient, Relationship.SELF));
    }

    @Test
    void linkPatientToUser_WhenLinkExists_ShouldThrowException() {
        when(userPatientRepository.existsByUser_IdAndPatient_Id(userId, patientId))
                .thenReturn(true);

        assertThrows(
                ResourceAlreadyExistsException.class,
                () -> userPatientService.linkPatientToUser(user, patient, Relationship.CHILD));
    }

    @Test
    void findById_WhenExists_ShouldReturnUserPatient() {
        when(userPatientRepository.findById(userPatientId)).thenReturn(Optional.of(userPatient));

        Optional<UserPatient> result = userPatientService.findById(userPatientId);

        assertTrue(result.isPresent());
        assertEquals(userPatientId, result.get().getId());
    }

    @Test
    void findById_WhenNotExists_ShouldReturnEmpty() {
        when(userPatientRepository.findById(userPatientId)).thenReturn(Optional.empty());

        Optional<UserPatient> result = userPatientService.findById(userPatientId);

        assertFalse(result.isPresent());
    }

    @Test
    void findAll_ShouldReturnAllUserPatients() {
        List<UserPatient> userPatients = List.of(userPatient);
        when(userPatientRepository.findAll()).thenReturn(userPatients);

        List<UserPatient> result = userPatientService.findAll();

        assertEquals(1, result.size());
    }

    @Test
    void findByUserId_ShouldReturnUserPatients() {
        List<UserPatient> userPatients = List.of(userPatient);
        when(userPatientRepository.findByUser_Id(userId)).thenReturn(userPatients);

        List<UserPatient> result = userPatientService.findByUserId(userId);

        assertEquals(1, result.size());
    }

    @Test
    void findByPatientId_ShouldReturnUserPatients() {
        List<UserPatient> userPatients = List.of(userPatient);
        when(userPatientRepository.findByPatient_Id(patientId)).thenReturn(userPatients);

        List<UserPatient> result = userPatientService.findByPatientId(patientId);

        assertEquals(1, result.size());
    }

    @Test
    void findByUserIdAndPatientId_ShouldReturnUserPatient() {
        when(userPatientRepository.findByUser_IdAndPatient_Id(userId, patientId))
                .thenReturn(Optional.of(userPatient));

        Optional<UserPatient> result = userPatientService.findByUserIdAndPatientId(userId, patientId);

        assertTrue(result.isPresent());
    }

    @Test
    void findByUserIdAndRelationship_WhenExists_ShouldReturnUserPatient() {
        when(userPatientRepository.findByUser_IdAndRelationship(userId, Relationship.SELF))
                .thenReturn(List.of(userPatient));

        Optional<UserPatient> result = userPatientService.findByUserIdAndRelationship(userId, Relationship.SELF);

        assertTrue(result.isPresent());
    }

    @Test
    void findByUserIdAndRelationship_WhenNotExists_ShouldReturnEmpty() {
        when(userPatientRepository.findByUser_IdAndRelationship(userId, Relationship.SELF))
                .thenReturn(List.of());

        Optional<UserPatient> result = userPatientService.findByUserIdAndRelationship(userId, Relationship.SELF);

        assertFalse(result.isPresent());
    }

    @Test
    void update_WhenExists_ShouldReturnUpdatedUserPatient() {
        when(userPatientRepository.existsById(userPatientId)).thenReturn(true);
        when(userPatientRepository.save(any(UserPatient.class))).thenReturn(userPatient);

        UserPatient result = userPatientService.update(userPatient);

        assertNotNull(result);
        verify(userPatientRepository, times(1)).save(userPatient);
    }

    @Test
    void update_WhenNotExists_ShouldThrowException() {
        when(userPatientRepository.existsById(userPatientId)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () -> userPatientService.update(userPatient));
    }

    @Test
    void deleteById_WhenExists_ShouldDelete() {
        when(userPatientRepository.existsById(userPatientId)).thenReturn(true);
        doNothing().when(userPatientRepository).deleteById(userPatientId);

        userPatientService.deleteById(userPatientId);

        verify(userPatientRepository, times(1)).deleteById(userPatientId);
    }

    @Test
    void deleteById_WhenNotExists_ShouldThrowException() {
        when(userPatientRepository.existsById(userPatientId)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () -> userPatientService.deleteById(userPatientId));
    }

    @Test
    void existsByUserIdAndPatientId_WhenExists_ShouldReturnTrue() {
        when(userPatientRepository.existsByUser_IdAndPatient_Id(userId, patientId))
                .thenReturn(true);

        boolean result = userPatientService.existsByUserIdAndPatientId(userId, patientId);

        assertTrue(result);
    }

    @Test
    void existsByUserIdAndPatientId_WhenNotExists_ShouldReturnFalse() {
        when(userPatientRepository.existsByUser_IdAndPatient_Id(userId, patientId))
                .thenReturn(false);

        boolean result = userPatientService.existsByUserIdAndPatientId(userId, patientId);

        assertFalse(result);
    }

    @Test
    void existsByUserIdAndRelationship_WhenExists_ShouldReturnTrue() {
        when(userPatientRepository.existsByUser_IdAndRelationship(userId, Relationship.SELF))
                .thenReturn(true);

        boolean result = userPatientService.existsByUserIdAndRelationship(userId, Relationship.SELF);

        assertTrue(result);
    }

    @Test
    void existsByUserIdAndRelationship_WhenNotExists_ShouldReturnFalse() {
        when(userPatientRepository.existsByUser_IdAndRelationship(userId, Relationship.SELF))
                .thenReturn(false);

        boolean result = userPatientService.existsByUserIdAndRelationship(userId, Relationship.SELF);

        assertFalse(result);
    }
}
