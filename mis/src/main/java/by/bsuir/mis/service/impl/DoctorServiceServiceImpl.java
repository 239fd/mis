package by.bsuir.mis.service.impl;

import by.bsuir.mis.entity.DoctorService;
import by.bsuir.mis.exception.ResourceNotFoundException;
import by.bsuir.mis.repository.DoctorServiceRepository;
import by.bsuir.mis.service.DoctorServiceService;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DoctorServiceServiceImpl implements DoctorServiceService {

    private final DoctorServiceRepository doctorServiceRepository;

    @Override
    @Transactional
    public DoctorService save(DoctorService doctorService) {
        return doctorServiceRepository.save(doctorService);
    }

    @Override
    public Optional<DoctorService> findById(UUID id) {
        return doctorServiceRepository.findById(id);
    }

    @Override
    public List<DoctorService> findAll() {
        return doctorServiceRepository.findAll();
    }

    @Override
    public List<DoctorService> findByEmployeeId(UUID employeeId) {
        return doctorServiceRepository.findByEmployee_Id(employeeId);
    }

    @Override
    public List<DoctorService> findByServiceId(UUID serviceId) {
        return doctorServiceRepository.findByService_Id(serviceId);
    }

    @Override
    public List<DoctorService> findActiveByEmployeeId(UUID employeeId) {
        return doctorServiceRepository.findByEmployee_IdAndIsActive(employeeId, true);
    }

    @Override
    public Optional<DoctorService> findByEmployeeIdAndServiceId(UUID employeeId, UUID serviceId) {
        return doctorServiceRepository.findByEmployee_IdAndService_Id(employeeId, serviceId);
    }

    @Override
    @Transactional
    public DoctorService update(DoctorService doctorService) {
        if (!doctorServiceRepository.existsById(doctorService.getId())) {
            throw new ResourceNotFoundException("DoctorService", "id", doctorService.getId());
        }
        return doctorServiceRepository.save(doctorService);
    }

    @Override
    @Transactional
    public void deleteById(UUID id) {
        if (!doctorServiceRepository.existsById(id)) {
            throw new ResourceNotFoundException("DoctorService", "id", id);
        }
        doctorServiceRepository.deleteById(id);
    }

    @Override
    @Transactional
    public void deactivate(UUID id) {
        DoctorService doctorService = doctorServiceRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("DoctorService", "id", id));
        doctorService.setIsActive(false);
        doctorServiceRepository.save(doctorService);
    }
}
