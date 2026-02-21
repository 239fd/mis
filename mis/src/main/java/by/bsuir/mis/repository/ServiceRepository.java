package by.bsuir.mis.repository;

import by.bsuir.mis.entity.Service;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ServiceRepository extends JpaRepository<Service, UUID> {

    Optional<Service> findByName(String name);

    boolean existsByName(String name);

    List<Service> findByIsActive(Boolean isActive);

    List<Service> findByNameContainingIgnoreCase(String name);
}
