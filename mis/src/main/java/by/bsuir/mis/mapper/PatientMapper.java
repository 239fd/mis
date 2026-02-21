package by.bsuir.mis.mapper;

import by.bsuir.mis.dto.response.PatientResponse;
import by.bsuir.mis.dto.response.PatientShortResponse;
import by.bsuir.mis.entity.Patient;
import java.time.LocalDate;
import java.time.Period;
import org.springframework.stereotype.Component;

@Component
public class PatientMapper {

    public PatientResponse toResponse(Patient patient) {
        if (patient == null) return null;
        return new PatientResponse(
                patient.getId(),
                patient.getLastName(),
                patient.getFirstName(),
                patient.getMiddleName(),
                getFullName(patient),
                patient.getGender(),
                patient.getBirthDate(),
                calculateAge(patient.getBirthDate()),
                patient.getPassportSeries(),
                patient.getPassportNumber(),
                patient.getPhone(),
                patient.getEmail(),
                patient.getAddress(),
                patient.getCreatedAt(),
                patient.getUpdatedAt());
    }

    public PatientShortResponse toShortResponse(Patient patient) {
        if (patient == null) return null;
        return new PatientShortResponse(
                patient.getId(), getFullName(patient), patient.getBirthDate(), patient.getPhone());
    }

    private String getFullName(Patient patient) {
        StringBuilder sb = new StringBuilder();
        sb.append(patient.getLastName()).append(" ").append(patient.getFirstName());
        if (patient.getMiddleName() != null && !patient.getMiddleName().isBlank()) {
            sb.append(" ").append(patient.getMiddleName());
        }
        return sb.toString();
    }

    private Integer calculateAge(LocalDate birthDate) {
        if (birthDate == null) return null;
        return Period.between(birthDate, LocalDate.now()).getYears();
    }
}
