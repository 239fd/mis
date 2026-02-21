package by.bsuir.mis.service;

import by.bsuir.mis.entity.User;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserService {

    User save(User user);

    Optional<User> findById(UUID id);

    Optional<User> findByLogin(String login);

    List<User> findAll();

    List<User> findAllActive();

    User update(User user);

    void deleteById(UUID id);

    void deactivate(UUID id);

    void activate(UUID id);

    boolean existsByLogin(String login);
}
