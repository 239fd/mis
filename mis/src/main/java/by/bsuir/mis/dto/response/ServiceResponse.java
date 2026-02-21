package by.bsuir.mis.dto.response;

import java.time.LocalDateTime;
import java.util.UUID;

public record ServiceResponse(
        UUID id,
        String name,
        String description,
        Boolean isActive,
        Integer currentDurationMin,
        LocalDateTime createdAt) {}
