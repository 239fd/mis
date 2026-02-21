package by.bsuir.mis.service.impl;

import by.bsuir.mis.entity.Role;
import by.bsuir.mis.exception.ResourceNotFoundException;
import by.bsuir.mis.repository.RoleRepository;
import by.bsuir.mis.service.RoleService;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RoleServiceImpl implements RoleService {

    private final RoleRepository roleRepository;

    @Override
    @Transactional
    public Role save(Role role) {
        return roleRepository.save(role);
    }

    @Override
    public Optional<Role> findById(UUID id) {
        return roleRepository.findById(id);
    }

    @Override
    public Optional<Role> findByName(String name) {
        return roleRepository.findByName(name);
    }

    @Override
    public List<Role> findAll() {
        return roleRepository.findAll();
    }

    @Override
    @Transactional
    public Role update(Role role) {
        if (!roleRepository.existsById(role.getId())) {
            throw new ResourceNotFoundException("Role", "id", role.getId());
        }
        return roleRepository.save(role);
    }

    @Override
    @Transactional
    public void deleteById(UUID id) {
        if (!roleRepository.existsById(id)) {
            throw new ResourceNotFoundException("Role", "id", id);
        }
        roleRepository.deleteById(id);
    }

    @Override
    public boolean existsByName(String name) {
        return roleRepository.existsByName(name);
    }
}
