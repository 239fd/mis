package by.bsuir.mis.repository;

import by.bsuir.mis.entity.AppointmentStatusHistory;
import by.bsuir.mis.entity.enums.AppointmentStatus;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AppointmentStatusHistoryRepository extends JpaRepository<AppointmentStatusHistory, UUID> {

    List<AppointmentStatusHistory> findByAppointment_Id(UUID appointmentId);

    List<AppointmentStatusHistory> findByAppointment_IdOrderByCreatedAtDesc(UUID appointmentId);

    List<AppointmentStatusHistory> findByChangedBy_Id(UUID changedById);

    List<AppointmentStatusHistory> findByNewStatus(AppointmentStatus newStatus);
}
