package by.bsuir.mis.dto.response;

import by.bsuir.mis.entity.enums.Relationship;
import java.time.LocalDateTime;
import java.util.UUID;

public record UserPatientResponse(
        UUID id,
        UUID userId,
        String userLogin,
        UUID patientId,
        String patientFullName,
        Relationship relationship,
        LocalDateTime createdAt) {}
