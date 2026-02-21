package by.bsuir.mis.mapper;

import by.bsuir.mis.dto.response.AppointmentResponse;
import by.bsuir.mis.dto.response.AppointmentShortResponse;
import by.bsuir.mis.entity.Appointment;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AppointmentMapper {

    private final PatientMapper patientMapper;
    private final EmployeeMapper employeeMapper;
    private final ServiceMapper serviceMapper;

    public AppointmentResponse toResponse(Appointment appointment) {
        if (appointment == null) return null;
        return new AppointmentResponse(
                appointment.getId(),
                patientMapper.toShortResponse(appointment.getPatient()),
                employeeMapper.toShortResponse(appointment.getEmployee()),
                serviceMapper.toResponse(appointment.getService()),
                appointment.getSchedule() != null ? appointment.getSchedule().getId() : null,
                appointment.getAppointmentDate(),
                appointment.getStartTime(),
                appointment.getEndTime(),
                appointment.getIsPaid(),
                appointment.getStatus(),
                appointment.getSource(),
                appointment.getCancelReason(),
                appointment.getCreatedBy() != null ? appointment.getCreatedBy().getId() : null,
                appointment.getCreatedAt(),
                appointment.getUpdatedAt());
    }

    public AppointmentShortResponse toShortResponse(Appointment appointment) {
        if (appointment == null) return null;
        return new AppointmentShortResponse(
                appointment.getId(),
                getPatientFullName(appointment),
                getEmployeeFullName(appointment),
                appointment.getService() != null ? appointment.getService().getName() : null,
                appointment.getAppointmentDate(),
                appointment.getStartTime(),
                appointment.getEndTime(),
                appointment.getStatus());
    }

    private String getPatientFullName(Appointment appointment) {
        if (appointment.getPatient() == null) return null;
        var p = appointment.getPatient();
        StringBuilder sb = new StringBuilder();
        sb.append(p.getLastName()).append(" ").append(p.getFirstName());
        if (p.getMiddleName() != null && !p.getMiddleName().isBlank()) {
            sb.append(" ").append(p.getMiddleName());
        }
        return sb.toString();
    }

    private String getEmployeeFullName(Appointment appointment) {
        if (appointment.getEmployee() == null) return null;
        var e = appointment.getEmployee();
        StringBuilder sb = new StringBuilder();
        sb.append(e.getLastName()).append(" ").append(e.getFirstName());
        if (e.getMiddleName() != null && !e.getMiddleName().isBlank()) {
            sb.append(" ").append(e.getMiddleName());
        }
        return sb.toString();
    }
}
