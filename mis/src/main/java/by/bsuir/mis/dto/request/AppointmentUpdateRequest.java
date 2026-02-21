package by.bsuir.mis.dto.request;

import by.bsuir.mis.entity.enums.AppointmentStatus;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record AppointmentUpdateRequest(
        UUID patientId,
        UUID employeeId,
        UUID serviceId,
        UUID scheduleId,
        LocalDate appointmentDate,
        LocalDateTime startTime,
        LocalDateTime endTime,
        Boolean isPaid,
        AppointmentStatus status,

        @Size(max = 500, message = "Cancel reason must not exceed 500 characters")
        String cancelReason) {}
