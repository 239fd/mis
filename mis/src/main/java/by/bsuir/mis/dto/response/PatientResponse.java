package by.bsuir.mis.dto.response;

import by.bsuir.mis.entity.enums.Gender;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record PatientResponse(
        UUID id,
        String lastName,
        String firstName,
        String middleName,
        String fullName,
        Gender gender,
        LocalDate birthDate,
        Integer age,
        String passportSeries,
        String passportNumber,
        String phone,
        String email,
        String address,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {}
