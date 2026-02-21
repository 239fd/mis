package by.bsuir.mis.dto.response;

import by.bsuir.mis.entity.enums.AppointmentStatus;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record AppointmentShortResponse(
        UUID id,
        String patientFullName,
        String employeeFullName,
        String serviceName,
        LocalDate appointmentDate,
        LocalDateTime startTime,
        LocalDateTime endTime,
        AppointmentStatus status) {}
