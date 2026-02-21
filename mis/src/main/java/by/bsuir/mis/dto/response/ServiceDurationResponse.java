package by.bsuir.mis.dto.response;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record ServiceDurationResponse(
        UUID id,
        UUID serviceId,
        String serviceName,
        Integer durationMin,
        LocalDate effectiveFrom,
        LocalDate effectiveTo,
        LocalDateTime createdAt) {}
