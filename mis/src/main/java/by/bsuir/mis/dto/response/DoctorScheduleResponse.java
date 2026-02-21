package by.bsuir.mis.dto.response;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

public record DoctorScheduleResponse(
        UUID id,
        UUID employeeId,
        String employeeFullName,
        Integer dayOfWeek,
        String dayOfWeekName,
        LocalTime startTime,
        LocalTime endTime,
        LocalTime paidStartTime,
        LocalTime paidEndTime,
        String cabinet,
        LocalDate effectiveFrom,
        LocalDate effectiveTo,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {}
