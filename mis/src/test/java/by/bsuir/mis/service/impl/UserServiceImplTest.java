package by.bsuir.mis.service.impl;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import by.bsuir.mis.entity.Employee;
import by.bsuir.mis.entity.User;
import by.bsuir.mis.entity.UserPatient;
import by.bsuir.mis.exception.ResourceNotFoundException;
import by.bsuir.mis.repository.*;
import by.bsuir.mis.service.EmployeeService;
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
class UserServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private EmployeeService employeeService;

    @Mock
    private UserPatientRepository userPatientRepository;

    @InjectMocks
    private UserServiceImpl userService;

    private User user;
    private UUID userId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        user = User.builder()
                .id(userId)
                .login("testuser")
                .passwordHash("hash")
                .isActive(true)
                .build();
    }

    @Test
    void save_ShouldReturnSavedUser() {
        when(userRepository.save(any(User.class))).thenReturn(user);

        User result = userService.save(user);

        assertNotNull(result);
        assertEquals(userId, result.getId());
        verify(userRepository, times(1)).save(user);
    }

    @Test
    void findById_WhenExists_ShouldReturnUser() {
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        Optional<User> result = userService.findById(userId);

        assertTrue(result.isPresent());
        assertEquals(userId, result.get().getId());
    }

    @Test
    void findById_WhenNotExists_ShouldReturnEmpty() {
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        Optional<User> result = userService.findById(userId);

        assertFalse(result.isPresent());
    }

    @Test
    void findByLogin_WhenExists_ShouldReturnUser() {
        when(userRepository.findByLogin("testuser")).thenReturn(Optional.of(user));

        Optional<User> result = userService.findByLogin("testuser");

        assertTrue(result.isPresent());
        assertEquals("testuser", result.get().getLogin());
    }

    @Test
    void findAll_ShouldReturnAllUsers() {
        List<User> users = List.of(user);
        when(userRepository.findAll()).thenReturn(users);

        List<User> result = userService.findAll();

        assertEquals(1, result.size());
    }

    @Test
    void findAllActive_ShouldReturnActiveUsers() {
        List<User> users = List.of(user);
        when(userRepository.findByIsActive(true)).thenReturn(users);

        List<User> result = userService.findAllActive();

        assertEquals(1, result.size());
    }

    @Test
    void update_WhenExists_ShouldReturnUpdatedUser() {
        when(userRepository.existsById(userId)).thenReturn(true);
        when(userRepository.save(any(User.class))).thenReturn(user);

        User result = userService.update(user);

        assertNotNull(result);
        verify(userRepository, times(1)).save(user);
    }

    @Test
    void update_WhenNotExists_ShouldThrowException() {
        when(userRepository.existsById(userId)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () -> userService.update(user));
    }

    @Test
    void deleteById_WhenExists_ShouldDelete() {
        when(userRepository.existsById(userId)).thenReturn(true);
        when(employeeRepository.findByUser_Id(userId)).thenReturn(Optional.empty());
        when(userPatientRepository.findByUser_Id(userId)).thenReturn(List.of());
        doNothing().when(userRepository).deleteById(userId);

        userService.deleteById(userId);

        verify(userRepository, times(1)).deleteById(userId);
    }

    @Test
    void deleteById_WhenNotExists_ShouldThrowException() {
        when(userRepository.existsById(userId)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () -> userService.deleteById(userId));
    }

    @Test
    void deleteById_WithEmployee_ShouldDeleteEmployee() {
        UUID employeeId = UUID.randomUUID();
        Employee employee = Employee.builder().id(employeeId).build();
        when(userRepository.existsById(userId)).thenReturn(true);
        when(employeeRepository.findByUser_Id(userId)).thenReturn(Optional.of(employee));
        when(userPatientRepository.findByUser_Id(userId)).thenReturn(List.of());
        doNothing().when(employeeService).deleteById(employeeId);
        doNothing().when(userRepository).deleteById(userId);

        userService.deleteById(userId);

        verify(employeeService, times(1)).deleteById(employeeId);
        verify(userRepository, times(1)).deleteById(userId);
    }

    @Test
    void deleteById_WithUserPatients_ShouldDeleteLinks() {
        UUID userPatientId = UUID.randomUUID();
        UserPatient userPatient = UserPatient.builder().id(userPatientId).build();
        when(userRepository.existsById(userId)).thenReturn(true);
        when(employeeRepository.findByUser_Id(userId)).thenReturn(Optional.empty());
        when(userPatientRepository.findByUser_Id(userId)).thenReturn(List.of(userPatient));
        doNothing().when(userPatientRepository).deleteById(userPatientId);
        doNothing().when(userRepository).deleteById(userId);

        userService.deleteById(userId);

        verify(userPatientRepository, times(1)).deleteById(userPatientId);
    }

    @Test
    void deactivate_WhenExists_ShouldDeactivate() {
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenReturn(user);

        userService.deactivate(userId);

        assertFalse(user.getIsActive());
        verify(userRepository, times(1)).save(user);
    }

    @Test
    void deactivate_WhenNotExists_ShouldThrowException() {
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> userService.deactivate(userId));
    }

    @Test
    void activate_WhenExists_ShouldActivate() {
        user.setIsActive(false);
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenReturn(user);

        userService.activate(userId);

        assertTrue(user.getIsActive());
        verify(userRepository, times(1)).save(user);
    }

    @Test
    void activate_WhenNotExists_ShouldThrowException() {
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> userService.activate(userId));
    }

    @Test
    void existsByLogin_WhenExists_ShouldReturnTrue() {
        when(userRepository.existsByLogin("testuser")).thenReturn(true);

        boolean result = userService.existsByLogin("testuser");

        assertTrue(result);
    }

    @Test
    void existsByLogin_WhenNotExists_ShouldReturnFalse() {
        when(userRepository.existsByLogin("testuser")).thenReturn(false);

        boolean result = userService.existsByLogin("testuser");

        assertFalse(result);
    }
}
