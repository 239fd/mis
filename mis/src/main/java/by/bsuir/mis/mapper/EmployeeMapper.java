package by.bsuir.mis.mapper;

import by.bsuir.mis.dto.response.EmployeeResponse;
import by.bsuir.mis.dto.response.EmployeeShortResponse;
import by.bsuir.mis.entity.Employee;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class EmployeeMapper {

    private final MedicalSpecialtyMapper specialtyMapper;

    public EmployeeResponse toResponse(Employee employee) {
        if (employee == null) return null;
        return new EmployeeResponse(
                employee.getId(),
                employee.getUser() != null ? employee.getUser().getId() : null,
                employee.getUser() != null ? employee.getUser().getLogin() : null,
                employee.getLastName(),
                employee.getFirstName(),
                employee.getMiddleName(),
                getFullName(employee),
                employee.getPosition(),
                employee.getCabinet(),
                specialtyMapper.toResponse(employee.getSpecialty()),
                employee.getHireDate(),
                employee.getDismissalDate(),
                employee.getIsActive(),
                employee.getCreatedAt(),
                employee.getUpdatedAt());
    }

    public EmployeeShortResponse toShortResponse(Employee employee) {
        if (employee == null) return null;
        return new EmployeeShortResponse(
                employee.getId(),
                getFullName(employee),
                employee.getPosition(),
                employee.getSpecialty() != null ? employee.getSpecialty().getName() : null);
    }

    private String getFullName(Employee employee) {
        StringBuilder sb = new StringBuilder();
        sb.append(employee.getLastName()).append(" ").append(employee.getFirstName());
        if (employee.getMiddleName() != null && !employee.getMiddleName().isBlank()) {
            sb.append(" ").append(employee.getMiddleName());
        }
        return sb.toString();
    }
}
