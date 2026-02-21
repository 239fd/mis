package by.bsuir.mis.service;

import by.bsuir.mis.entity.Patient;
import by.bsuir.mis.entity.User;
import by.bsuir.mis.entity.UserPatient;
import by.bsuir.mis.entity.enums.Relationship;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserPatientService {

    UserPatient save(UserPatient userPatient);

    UserPatient linkPatientToUser(User user, Patient patient, Relationship relationship);

    Optional<UserPatient> findById(UUID id);

    List<UserPatient> findAll();

    List<UserPatient> findByUserId(UUID userId);

    List<UserPatient> findByPatientId(UUID patientId);

    Optional<UserPatient> findByUserIdAndPatientId(UUID userId, UUID patientId);

    Optional<UserPatient> findByUserIdAndRelationship(UUID userId, Relationship relationship);

    UserPatient update(UserPatient userPatient);

    void deleteById(UUID id);

    boolean existsByUserIdAndPatientId(UUID userId, UUID patientId);

    boolean existsByUserIdAndRelationship(UUID userId, Relationship relationship);
}
