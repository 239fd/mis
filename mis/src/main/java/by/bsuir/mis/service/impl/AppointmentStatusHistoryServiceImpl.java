package by.bsuir.mis.service.impl;

import by.bsuir.mis.entity.AppointmentStatusHistory;
import by.bsuir.mis.repository.AppointmentStatusHistoryRepository;
import by.bsuir.mis.service.AppointmentStatusHistoryService;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AppointmentStatusHistoryServiceImpl implements AppointmentStatusHistoryService {

    private final AppointmentStatusHistoryRepository appointmentStatusHistoryRepository;

    @Override
    @Transactional
    public AppointmentStatusHistory save(AppointmentStatusHistory history) {
        return appointmentStatusHistoryRepository.save(history);
    }

    @Override
    public Optional<AppointmentStatusHistory> findById(UUID id) {
        return appointmentStatusHistoryRepository.findById(id);
    }

    @Override
    public List<AppointmentStatusHistory> findAll() {
        return appointmentStatusHistoryRepository.findAll();
    }

    @Override
    public List<AppointmentStatusHistory> findByAppointmentId(UUID appointmentId) {
        return appointmentStatusHistoryRepository.findByAppointment_IdOrderByCreatedAtDesc(appointmentId);
    }

    @Override
    public List<AppointmentStatusHistory> findByChangedByUserId(UUID userId) {
        return appointmentStatusHistoryRepository.findByChangedBy_Id(userId);
    }
}
