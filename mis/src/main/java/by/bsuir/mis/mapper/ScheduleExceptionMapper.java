package by.bsuir.mis.mapper;

import by.bsuir.mis.dto.response.ScheduleExceptionResponse;
import by.bsuir.mis.entity.ScheduleException;
import org.springframework.stereotype.Component;

@Component
public class ScheduleExceptionMapper {

    public ScheduleExceptionResponse toResponse(ScheduleException exception) {
        if (exception == null) return null;
        return new ScheduleExceptionResponse(
                exception.getId(),
                exception.getEmployee() != null ? exception.getEmployee().getId() : null,
                getEmployeeFullName(exception),
                exception.getExceptionType(),
                exception.getDateFrom(),
                exception.getDateTo(),
                exception.getReason(),
                exception.getCreatedBy() != null ? exception.getCreatedBy().getId() : null,
                exception.getCreatedAt());
    }

    private String getEmployeeFullName(ScheduleException se) {
        if (se.getEmployee() == null) return null;
        var e = se.getEmployee();
        StringBuilder sb = new StringBuilder();
        sb.append(e.getLastName()).append(" ").append(e.getFirstName());
        if (e.getMiddleName() != null && !e.getMiddleName().isBlank()) {
            sb.append(" ").append(e.getMiddleName());
        }
        return sb.toString();
    }
}
