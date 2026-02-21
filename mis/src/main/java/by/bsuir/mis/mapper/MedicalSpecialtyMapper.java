package by.bsuir.mis.mapper;

import by.bsuir.mis.dto.response.MedicalSpecialtyResponse;
import by.bsuir.mis.entity.MedicalSpecialty;
import org.springframework.stereotype.Component;

@Component
public class MedicalSpecialtyMapper {

    public MedicalSpecialtyResponse toResponse(MedicalSpecialty specialty) {
        if (specialty == null) return null;
        return new MedicalSpecialtyResponse(
                specialty.getId(), specialty.getName(), specialty.getDescription(), specialty.getCreatedAt());
    }
}
