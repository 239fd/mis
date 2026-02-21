package by.bsuir.mis.repository;

import by.bsuir.mis.entity.DoctorService;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DoctorServiceRepository extends JpaRepository<DoctorService, UUID> {

    List<DoctorService> findByEmployee_Id(UUID employeeId);

    List<DoctorService> findByService_Id(UUID serviceId);

    List<DoctorService> findByEmployee_IdAndIsActive(UUID employeeId, Boolean isActive);

    Optional<DoctorService> findByEmployee_IdAndService_Id(UUID employeeId, UUID serviceId);

    boolean existsByEmployee_IdAndService_Id(UUID employeeId, UUID serviceId);
}
