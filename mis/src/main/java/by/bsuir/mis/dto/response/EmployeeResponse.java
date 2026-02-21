package by.bsuir.mis.dto.response;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record EmployeeResponse(
        UUID id,
        UUID userId,
        String login,
        String lastName,
        String firstName,
        String middleName,
        String fullName,
        String position,
        String cabinet,
        MedicalSpecialtyResponse specialty,
        LocalDate hireDate,
        LocalDate dismissalDate,
        Boolean isActive,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {}
