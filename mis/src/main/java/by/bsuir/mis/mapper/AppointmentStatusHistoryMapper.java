package by.bsuir.mis.mapper;

import by.bsuir.mis.dto.response.AppointmentStatusHistoryResponse;
import by.bsuir.mis.entity.AppointmentStatusHistory;
import org.springframework.stereotype.Component;

@Component
public class AppointmentStatusHistoryMapper {

    public AppointmentStatusHistoryResponse toResponse(AppointmentStatusHistory history) {
        if (history == null) return null;
        return new AppointmentStatusHistoryResponse(
                history.getId(),
                history.getAppointment() != null ? history.getAppointment().getId() : null,
                history.getOldStatus(),
                history.getNewStatus(),
                history.getChangedBy() != null ? history.getChangedBy().getId() : null,
                history.getChangedBy() != null ? history.getChangedBy().getLogin() : null,
                history.getChangeReason(),
                history.getCreatedAt());
    }
}
