package by.bsuir.mis.dto.response;

import by.bsuir.mis.entity.enums.AppointmentStatus;
import java.time.LocalDateTime;
import java.util.UUID;

public record AppointmentStatusHistoryResponse(
        UUID id,
        UUID appointmentId,
        AppointmentStatus oldStatus,
        AppointmentStatus newStatus,
        UUID changedById,
        String changedByLogin,
        String changeReason,
        LocalDateTime createdAt) {}
