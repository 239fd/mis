package by.bsuir.mis.mapper;

import by.bsuir.mis.dto.response.UserPatientResponse;
import by.bsuir.mis.entity.UserPatient;
import org.springframework.stereotype.Component;

@Component
public class UserPatientMapper {

    public UserPatientResponse toResponse(UserPatient userPatient) {
        if (userPatient == null) return null;
        return new UserPatientResponse(
                userPatient.getId(),
                userPatient.getUser() != null ? userPatient.getUser().getId() : null,
                userPatient.getUser() != null ? userPatient.getUser().getLogin() : null,
                userPatient.getPatient() != null ? userPatient.getPatient().getId() : null,
                getPatientFullName(userPatient),
                userPatient.getRelationship(),
                userPatient.getCreatedAt());
    }

    private String getPatientFullName(UserPatient up) {
        if (up.getPatient() == null) return null;
        var p = up.getPatient();
        StringBuilder sb = new StringBuilder();
        sb.append(p.getLastName()).append(" ").append(p.getFirstName());
        if (p.getMiddleName() != null && !p.getMiddleName().isBlank()) {
            sb.append(" ").append(p.getMiddleName());
        }
        return sb.toString();
    }
}
