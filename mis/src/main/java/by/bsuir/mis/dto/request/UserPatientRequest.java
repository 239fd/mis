package by.bsuir.mis.dto.request;

import by.bsuir.mis.entity.enums.Relationship;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record UserPatientRequest(
        @NotNull(message = "User ID is required") UUID userId,

        @NotNull(message = "Patient ID is required") UUID patientId,

        Relationship relationship) {}
