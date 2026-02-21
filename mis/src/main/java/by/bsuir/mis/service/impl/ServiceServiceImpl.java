package by.bsuir.mis.service.impl;

import by.bsuir.mis.exception.ResourceNotFoundException;
import by.bsuir.mis.repository.ServiceRepository;
import by.bsuir.mis.service.ServiceService;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ServiceServiceImpl implements ServiceService {

    private final ServiceRepository serviceRepository;

    @Override
    @Transactional
    public by.bsuir.mis.entity.Service save(by.bsuir.mis.entity.Service service) {
        return serviceRepository.save(service);
    }

    @Override
    public Optional<by.bsuir.mis.entity.Service> findById(UUID id) {
        return serviceRepository.findById(id);
    }

    @Override
    public Optional<by.bsuir.mis.entity.Service> findByName(String name) {
        return serviceRepository.findByName(name);
    }

    @Override
    public List<by.bsuir.mis.entity.Service> findAll() {
        return serviceRepository.findAll();
    }

    @Override
    public List<by.bsuir.mis.entity.Service> findAllActive() {
        return serviceRepository.findByIsActive(true);
    }

    @Override
    @Transactional
    public by.bsuir.mis.entity.Service update(by.bsuir.mis.entity.Service service) {
        if (!serviceRepository.existsById(service.getId())) {
            throw new ResourceNotFoundException("Service", "id", service.getId());
        }
        return serviceRepository.save(service);
    }

    @Override
    @Transactional
    public void deleteById(UUID id) {
        if (!serviceRepository.existsById(id)) {
            throw new ResourceNotFoundException("Service", "id", id);
        }
        serviceRepository.deleteById(id);
    }

    @Override
    @Transactional
    public void deactivate(UUID id) {
        by.bsuir.mis.entity.Service service =
                serviceRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Service", "id", id));
        service.setIsActive(false);
        serviceRepository.save(service);
    }

    @Override
    public boolean existsByName(String name) {
        return serviceRepository.existsByName(name);
    }
}
