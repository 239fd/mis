package by.bsuir.mis.dto.request;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record DoctorServiceRequest(
        @NotNull(message = "Employee ID is required") UUID employeeId,

        @NotNull(message = "Service ID is required") UUID serviceId,

        Boolean isActive) {}
