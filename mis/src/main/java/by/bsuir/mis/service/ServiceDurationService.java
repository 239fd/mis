package by.bsuir.mis.service;

import by.bsuir.mis.entity.ServiceDuration;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ServiceDurationService {

    ServiceDuration save(ServiceDuration serviceDuration);

    Optional<ServiceDuration> findById(UUID id);

    List<ServiceDuration> findAll();

    List<ServiceDuration> findByServiceId(UUID serviceId);

    Optional<ServiceDuration> findActiveByServiceId(UUID serviceId, LocalDate date);

    ServiceDuration update(ServiceDuration serviceDuration);

    void deleteById(UUID id);
}
