package by.bsuir.mis.dto.response;

import java.time.LocalDateTime;
import java.util.UUID;

public record MedicalSpecialtyResponse(UUID id, String name, String description, LocalDateTime createdAt) {}
