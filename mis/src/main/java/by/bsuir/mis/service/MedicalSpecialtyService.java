package by.bsuir.mis.service;

import by.bsuir.mis.entity.MedicalSpecialty;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MedicalSpecialtyService {

    MedicalSpecialty save(MedicalSpecialty specialty);

    Optional<MedicalSpecialty> findById(UUID id);

    Optional<MedicalSpecialty> findByName(String name);

    List<MedicalSpecialty> findAll();

    MedicalSpecialty update(MedicalSpecialty specialty);

    void deleteById(UUID id);

    boolean existsByName(String name);
}
