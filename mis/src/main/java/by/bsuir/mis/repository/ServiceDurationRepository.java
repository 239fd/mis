package by.bsuir.mis.repository;

import by.bsuir.mis.entity.ServiceDuration;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ServiceDurationRepository extends JpaRepository<ServiceDuration, UUID> {

    List<ServiceDuration> findByService_Id(UUID serviceId);

    @Query("SELECT sd FROM ServiceDuration sd WHERE " + "sd.service.id = :serviceId AND "
            + "sd.effectiveFrom <= :date AND "
            + "(sd.effectiveTo IS NULL OR sd.effectiveTo >= :date)")
    Optional<ServiceDuration> findActiveByServiceIdOnDate(
            @Param("serviceId") UUID serviceId, @Param("date") LocalDate date);
}
