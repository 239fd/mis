package by.bsuir.mis.service.impl;

import by.bsuir.mis.entity.MedicalSpecialty;
import by.bsuir.mis.exception.ResourceNotFoundException;
import by.bsuir.mis.repository.MedicalSpecialtyRepository;
import by.bsuir.mis.service.MedicalSpecialtyService;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MedicalSpecialtyServiceImpl implements MedicalSpecialtyService {

    private final MedicalSpecialtyRepository medicalSpecialtyRepository;

    @Override
    @Transactional
    public MedicalSpecialty save(MedicalSpecialty specialty) {
        return medicalSpecialtyRepository.save(specialty);
    }

    @Override
    public Optional<MedicalSpecialty> findById(UUID id) {
        return medicalSpecialtyRepository.findById(id);
    }

    @Override
    public Optional<MedicalSpecialty> findByName(String name) {
        return medicalSpecialtyRepository.findByName(name);
    }

    @Override
    public List<MedicalSpecialty> findAll() {
        return medicalSpecialtyRepository.findAll();
    }

    @Override
    @Transactional
    public MedicalSpecialty update(MedicalSpecialty specialty) {
        if (!medicalSpecialtyRepository.existsById(specialty.getId())) {
            throw new ResourceNotFoundException("MedicalSpecialty", "id", specialty.getId());
        }
        return medicalSpecialtyRepository.save(specialty);
    }

    @Override
    @Transactional
    public void deleteById(UUID id) {
        if (!medicalSpecialtyRepository.existsById(id)) {
            throw new ResourceNotFoundException("MedicalSpecialty", "id", id);
        }
        medicalSpecialtyRepository.deleteById(id);
    }

    @Override
    public boolean existsByName(String name) {
        return medicalSpecialtyRepository.existsByName(name);
    }
}
