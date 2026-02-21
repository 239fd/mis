package by.bsuir.mis.mapper;

import by.bsuir.mis.dto.response.DoctorServiceResponse;
import by.bsuir.mis.entity.DoctorService;
import org.springframework.stereotype.Component;

@Component
public class DoctorServiceMapper {

    public DoctorServiceResponse toResponse(DoctorService doctorService) {
        if (doctorService == null) return null;
        return new DoctorServiceResponse(
                doctorService.getId(),
                doctorService.getEmployee() != null
                        ? doctorService.getEmployee().getId()
                        : null,
                getEmployeeFullName(doctorService),
                doctorService.getService() != null ? doctorService.getService().getId() : null,
                doctorService.getService() != null ? doctorService.getService().getName() : null,
                doctorService.getIsActive(),
                doctorService.getCreatedAt());
    }

    private String getEmployeeFullName(DoctorService ds) {
        if (ds.getEmployee() == null) return null;
        var e = ds.getEmployee();
        StringBuilder sb = new StringBuilder();
        sb.append(e.getLastName()).append(" ").append(e.getFirstName());
        if (e.getMiddleName() != null && !e.getMiddleName().isBlank()) {
            sb.append(" ").append(e.getMiddleName());
        }
        return sb.toString();
    }
}
