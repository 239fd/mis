package by.bsuir.mis.repository;

import by.bsuir.mis.entity.MedicalSpecialty;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MedicalSpecialtyRepository extends JpaRepository<MedicalSpecialty, UUID> {

    Optional<MedicalSpecialty> findByName(String name);

    boolean existsByName(String name);
}
