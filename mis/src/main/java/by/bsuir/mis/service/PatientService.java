package by.bsuir.mis.service;

import by.bsuir.mis.entity.Patient;
import by.bsuir.mis.entity.User;
import by.bsuir.mis.entity.enums.Relationship;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PatientService {

    Patient save(Patient patient);

    Patient createPatientWithLink(Patient patient, User user, Relationship relationship);

    Optional<Patient> findById(UUID id);

    Optional<Patient> findByPassport(String passportSeries, String passportNumber);

    List<Patient> findAll();

    List<Patient> findByLastName(String lastName);

    Patient update(Patient patient);

    void deleteById(UUID id);

    boolean existsByPassport(String passportSeries, String passportNumber);
}
