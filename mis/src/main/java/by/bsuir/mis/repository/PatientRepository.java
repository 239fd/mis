package by.bsuir.mis.repository;

import by.bsuir.mis.entity.Patient;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface PatientRepository extends JpaRepository<Patient, UUID> {

    Optional<Patient> findByPassportSeriesAndPassportNumber(String passportSeries, String passportNumber);

    boolean existsByPassportSeriesAndPassportNumber(String passportSeries, String passportNumber);

    @Query("SELECT p FROM Patient p WHERE " + "LOWER(p.lastName) LIKE LOWER(CONCAT('%', :term, '%')) OR "
            + "LOWER(p.firstName) LIKE LOWER(CONCAT('%', :term, '%')) OR "
            + "LOWER(p.middleName) LIKE LOWER(CONCAT('%', :term, '%'))")
    List<Patient> searchByName(@Param("term") String term);

    Optional<Patient> findByPhone(String phone);

    Optional<Patient> findByEmail(String email);
}
