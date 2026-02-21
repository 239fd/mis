package by.bsuir.mis.service.impl;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import by.bsuir.mis.entity.Role;
import by.bsuir.mis.exception.ResourceNotFoundException;
import by.bsuir.mis.repository.RoleRepository;
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
class RoleServiceImplTest {

    @Mock
    private RoleRepository roleRepository;

    @InjectMocks
    private RoleServiceImpl roleService;

    private Role role;
    private UUID roleId;

    @BeforeEach
    void setUp() {
        roleId = UUID.randomUUID();
        role = Role.builder()
                .id(roleId)
                .name("ADMIN")
                .description("Administrator role")
                .build();
    }

    @Test
    void save_ShouldReturnSavedRole() {
        when(roleRepository.save(any(Role.class))).thenReturn(role);

        Role result = roleService.save(role);

        assertNotNull(result);
        assertEquals(roleId, result.getId());
        verify(roleRepository, times(1)).save(role);
    }

    @Test
    void findById_WhenExists_ShouldReturnRole() {
        when(roleRepository.findById(roleId)).thenReturn(Optional.of(role));

        Optional<Role> result = roleService.findById(roleId);

        assertTrue(result.isPresent());
        assertEquals(roleId, result.get().getId());
    }

    @Test
    void findById_WhenNotExists_ShouldReturnEmpty() {
        when(roleRepository.findById(roleId)).thenReturn(Optional.empty());

        Optional<Role> result = roleService.findById(roleId);

        assertFalse(result.isPresent());
    }

    @Test
    void findByName_WhenExists_ShouldReturnRole() {
        when(roleRepository.findByName("ADMIN")).thenReturn(Optional.of(role));

        Optional<Role> result = roleService.findByName("ADMIN");

        assertTrue(result.isPresent());
        assertEquals("ADMIN", result.get().getName());
    }

    @Test
    void findByName_WhenNotExists_ShouldReturnEmpty() {
        when(roleRepository.findByName("ADMIN")).thenReturn(Optional.empty());

        Optional<Role> result = roleService.findByName("ADMIN");

        assertFalse(result.isPresent());
    }

    @Test
    void findAll_ShouldReturnAllRoles() {
        List<Role> roles = List.of(role);
        when(roleRepository.findAll()).thenReturn(roles);

        List<Role> result = roleService.findAll();

        assertEquals(1, result.size());
    }

    @Test
    void update_WhenExists_ShouldReturnUpdatedRole() {
        when(roleRepository.existsById(roleId)).thenReturn(true);
        when(roleRepository.save(any(Role.class))).thenReturn(role);

        Role result = roleService.update(role);

        assertNotNull(result);
        verify(roleRepository, times(1)).save(role);
    }

    @Test
    void update_WhenNotExists_ShouldThrowException() {
        when(roleRepository.existsById(roleId)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () -> roleService.update(role));
    }

    @Test
    void deleteById_WhenExists_ShouldDelete() {
        when(roleRepository.existsById(roleId)).thenReturn(true);
        doNothing().when(roleRepository).deleteById(roleId);

        roleService.deleteById(roleId);

        verify(roleRepository, times(1)).deleteById(roleId);
    }

    @Test
    void deleteById_WhenNotExists_ShouldThrowException() {
        when(roleRepository.existsById(roleId)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () -> roleService.deleteById(roleId));
    }

    @Test
    void existsByName_WhenExists_ShouldReturnTrue() {
        when(roleRepository.existsByName("ADMIN")).thenReturn(true);

        boolean result = roleService.existsByName("ADMIN");

        assertTrue(result);
    }

    @Test
    void existsByName_WhenNotExists_ShouldReturnFalse() {
        when(roleRepository.existsByName("ADMIN")).thenReturn(false);

        boolean result = roleService.existsByName("ADMIN");

        assertFalse(result);
    }
}
