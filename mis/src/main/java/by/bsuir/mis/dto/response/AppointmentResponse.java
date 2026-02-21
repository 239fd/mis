package by.bsuir.mis.dto.response;

import by.bsuir.mis.entity.enums.AppointmentSource;
import by.bsuir.mis.entity.enums.AppointmentStatus;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record AppointmentResponse(
        UUID id,
        PatientShortResponse patient,
        EmployeeShortResponse employee,
        ServiceResponse service,
        UUID scheduleId,
        LocalDate appointmentDate,
        LocalDateTime startTime,
        LocalDateTime endTime,
        Boolean isPaid,
        AppointmentStatus status,
        AppointmentSource source,
        String cancelReason,
        UUID createdById,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {}
