package by.bsuir.mis.service;

import by.bsuir.mis.entity.AppointmentStatusHistory;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AppointmentStatusHistoryService {

    AppointmentStatusHistory save(AppointmentStatusHistory history);

    Optional<AppointmentStatusHistory> findById(UUID id);

    List<AppointmentStatusHistory> findAll();

    List<AppointmentStatusHistory> findByAppointmentId(UUID appointmentId);

    List<AppointmentStatusHistory> findByChangedByUserId(UUID userId);
}
