package by.bsuir.mis.repository;

import by.bsuir.mis.entity.User;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    @Query("SELECT u FROM User u JOIN FETCH u.role WHERE u.login = :login")
    Optional<User> findByLogin(@Param("login") String login);

    Optional<User> findByEmail(String email);

    boolean existsByLogin(String login);

    boolean existsByEmail(String email);

    List<User> findByRole_Id(UUID roleId);

    List<User> findByRole_Name(String roleName);

    List<User> findByIsActive(Boolean isActive);
}
