package by.bsuir.mis.dto.request;

import by.bsuir.mis.entity.enums.ExceptionType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.UUID;

public record ScheduleExceptionRequest(
        @NotNull(message = "Employee ID is required") UUID employeeId,

        @NotNull(message = "Exception type is required") ExceptionType exceptionType,

        @NotNull(message = "Date from is required") LocalDate dateFrom,

        @NotNull(message = "Date to is required") LocalDate dateTo,

        @Size(max = 500, message = "Reason must not exceed 500 characters")
        String reason) {}
