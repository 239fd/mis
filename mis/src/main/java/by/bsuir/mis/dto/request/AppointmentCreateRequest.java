package by.bsuir.mis.dto.request;

import by.bsuir.mis.entity.enums.AppointmentSource;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record AppointmentCreateRequest(
        @NotNull(message = "Patient ID is required") UUID patientId,

        @NotNull(message = "Employee ID is required") UUID employeeId,

        @NotNull(message = "Service ID is required") UUID serviceId,

        UUID scheduleId,

        @NotNull(message = "Appointment date is required") LocalDate appointmentDate,

        @NotNull(message = "Start time is required") LocalDateTime startTime,

        @NotNull(message = "End time is required") LocalDateTime endTime,

        AppointmentSource source) {}
