package by.bsuir.mis.service;

import by.bsuir.mis.entity.Role;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RoleService {

    Role save(Role role);

    Optional<Role> findById(UUID id);

    Optional<Role> findByName(String name);

    List<Role> findAll();

    Role update(Role role);

    void deleteById(UUID id);

    boolean existsByName(String name);
}
