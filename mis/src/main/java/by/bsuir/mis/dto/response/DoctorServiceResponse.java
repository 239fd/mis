package by.bsuir.mis.dto.response;

import java.time.LocalDateTime;
import java.util.UUID;

public record DoctorServiceResponse(
        UUID id,
        UUID employeeId,
        String employeeFullName,
        UUID serviceId,
        String serviceName,
        Boolean isActive,
        LocalDateTime createdAt) {}
