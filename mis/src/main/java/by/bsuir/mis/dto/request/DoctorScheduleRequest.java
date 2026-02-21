package by.bsuir.mis.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public record DoctorScheduleRequest(
        @NotNull(message = "Employee ID is required") UUID employeeId,

        @NotNull(message = "Day of week is required")
        @Min(value = 1, message = "Day of week must be between 1 and 7")
        @Max(value = 7, message = "Day of week must be between 1 and 7")
        Integer dayOfWeek,

        @NotNull(message = "Start time is required") LocalTime startTime,

        @NotNull(message = "End time is required") LocalTime endTime,

        LocalTime paidStartTime,

        LocalTime paidEndTime,

        @Size(max = 20, message = "Cabinet must not exceed 20 characters")
        String cabinet,

        @NotNull(message = "Effective from date is required")
        LocalDate effectiveFrom,

        LocalDate effectiveTo) {}
