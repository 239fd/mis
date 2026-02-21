package by.bsuir.mis.service.impl;

import by.bsuir.mis.entity.ServiceDuration;
import by.bsuir.mis.exception.ResourceNotFoundException;
import by.bsuir.mis.repository.ServiceDurationRepository;
import by.bsuir.mis.service.ServiceDurationService;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ServiceDurationServiceImpl implements ServiceDurationService {

    private final ServiceDurationRepository serviceDurationRepository;

    @Override
    @Transactional
    public ServiceDuration save(ServiceDuration serviceDuration) {
        return serviceDurationRepository.save(serviceDuration);
    }

    @Override
    public Optional<ServiceDuration> findById(UUID id) {
        return serviceDurationRepository.findById(id);
    }

    @Override
    public List<ServiceDuration> findAll() {
        return serviceDurationRepository.findAll();
    }

    @Override
    public List<ServiceDuration> findByServiceId(UUID serviceId) {
        return serviceDurationRepository.findByService_Id(serviceId);
    }

    @Override
    public Optional<ServiceDuration> findActiveByServiceId(UUID serviceId, LocalDate date) {
        return serviceDurationRepository.findActiveByServiceIdOnDate(serviceId, date);
    }

    @Override
    @Transactional
    public ServiceDuration update(ServiceDuration serviceDuration) {
        if (!serviceDurationRepository.existsById(serviceDuration.getId())) {
            throw new ResourceNotFoundException("ServiceDuration", "id", serviceDuration.getId());
        }
        return serviceDurationRepository.save(serviceDuration);
    }

    @Override
    @Transactional
    public void deleteById(UUID id) {
        if (!serviceDurationRepository.existsById(id)) {
            throw new ResourceNotFoundException("ServiceDuration", "id", id);
        }
        serviceDurationRepository.deleteById(id);
    }
}
