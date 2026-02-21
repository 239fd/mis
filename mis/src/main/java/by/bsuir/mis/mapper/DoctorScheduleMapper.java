package by.bsuir.mis.mapper;

import by.bsuir.mis.dto.response.DoctorScheduleResponse;
import by.bsuir.mis.entity.DoctorSchedule;
import org.springframework.stereotype.Component;

@Component
public class DoctorScheduleMapper {

    private static final String[] DAY_NAMES = {
        "", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье"
    };

    public DoctorScheduleResponse toResponse(DoctorSchedule schedule) {
        if (schedule == null) return null;
        return new DoctorScheduleResponse(
                schedule.getId(),
                schedule.getEmployee() != null ? schedule.getEmployee().getId() : null,
                getEmployeeFullName(schedule),
                schedule.getDayOfWeek(),
                getDayOfWeekName(schedule.getDayOfWeek()),
                schedule.getStartTime(),
                schedule.getEndTime(),
                schedule.getPaidStartTime(),
                schedule.getPaidEndTime(),
                schedule.getCabinet(),
                schedule.getEffectiveFrom(),
                schedule.getEffectiveTo(),
                schedule.getCreatedAt(),
                schedule.getUpdatedAt());
    }

    private String getEmployeeFullName(DoctorSchedule schedule) {
        if (schedule.getEmployee() == null) return null;
        var e = schedule.getEmployee();
        StringBuilder sb = new StringBuilder();
        sb.append(e.getLastName()).append(" ").append(e.getFirstName());
        if (e.getMiddleName() != null && !e.getMiddleName().isBlank()) {
            sb.append(" ").append(e.getMiddleName());
        }
        return sb.toString();
    }

    private String getDayOfWeekName(Integer dayOfWeek) {
        if (dayOfWeek == null || dayOfWeek < 1 || dayOfWeek > 7) return null;
        return DAY_NAMES[dayOfWeek];
    }
}
