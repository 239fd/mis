package by.bsuir.mis.service;

import by.bsuir.mis.entity.DoctorService;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DoctorServiceService {

    DoctorService save(DoctorService doctorService);

    Optional<DoctorService> findById(UUID id);

    List<DoctorService> findAll();

    List<DoctorService> findByEmployeeId(UUID employeeId);

    List<DoctorService> findByServiceId(UUID serviceId);

    List<DoctorService> findActiveByEmployeeId(UUID employeeId);

    Optional<DoctorService> findByEmployeeIdAndServiceId(UUID employeeId, UUID serviceId);

    DoctorService update(DoctorService doctorService);

    void deleteById(UUID id);

    void deactivate(UUID id);
}
