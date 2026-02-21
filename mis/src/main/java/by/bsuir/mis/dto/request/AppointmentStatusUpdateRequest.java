package by.bsuir.mis.dto.request;

import by.bsuir.mis.entity.enums.AppointmentStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record AppointmentStatusUpdateRequest(
        @NotNull(message = "Status is required") AppointmentStatus status,

        @Size(max = 500, message = "Reason must not exceed 500 characters")
        String reason) {}
