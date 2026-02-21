package by.bsuir.mis.dto.response;

import by.bsuir.mis.entity.enums.ExceptionType;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record ScheduleExceptionResponse(
        UUID id,
        UUID employeeId,
        String employeeFullName,
        ExceptionType exceptionType,
        LocalDate dateFrom,
        LocalDate dateTo,
        String reason,
        UUID createdById,
        LocalDateTime createdAt) {}
