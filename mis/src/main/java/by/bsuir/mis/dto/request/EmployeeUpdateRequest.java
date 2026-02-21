package by.bsuir.mis.dto.request;

import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.UUID;

public record EmployeeUpdateRequest(
        UUID specialtyId,

        @Size(max = 100, message = "Last name must not exceed 100 characters")
        String lastName,

        @Size(max = 100, message = "First name must not exceed 100 characters")
        String firstName,

        @Size(max = 100, message = "Middle name must not exceed 100 characters")
        String middleName,

        @Size(max = 150, message = "Position must not exceed 150 characters")
        String position,

        @Size(max = 20, message = "Cabinet must not exceed 20 characters")
        String cabinet,

        LocalDate dismissalDate,

        Boolean isActive) {}
