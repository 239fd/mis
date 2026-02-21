package by.bsuir.mis.service;

import by.bsuir.mis.entity.Service;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ServiceService {

    Service save(Service service);

    Optional<Service> findById(UUID id);

    Optional<Service> findByName(String name);

    List<Service> findAll();

    List<Service> findAllActive();

    Service update(Service service);

    void deleteById(UUID id);

    void deactivate(UUID id);

    boolean existsByName(String name);
}
