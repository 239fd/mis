package by.bsuir.mis.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.UUID;

public record ServiceDurationRequest(
        @NotNull(message = "Service ID is required") UUID serviceId,

        @NotNull(message = "Duration is required") @Min(value = 1, message = "Duration must be at least 1 minute")
        Integer durationMin,

        @NotNull(message = "Effective from date is required")
        LocalDate effectiveFrom,

        LocalDate effectiveTo) {}
