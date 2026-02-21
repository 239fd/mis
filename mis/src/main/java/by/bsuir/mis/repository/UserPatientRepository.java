package by.bsuir.mis.repository;

import by.bsuir.mis.entity.UserPatient;
import by.bsuir.mis.entity.enums.Relationship;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserPatientRepository extends JpaRepository<UserPatient, UUID> {

    List<UserPatient> findByUser_Id(UUID userId);

    List<UserPatient> findByPatient_Id(UUID patientId);

    Optional<UserPatient> findByUser_IdAndPatient_Id(UUID userId, UUID patientId);

    List<UserPatient> findByUser_IdAndRelationship(UUID userId, Relationship relationship);

    boolean existsByUser_IdAndPatient_Id(UUID userId, UUID patientId);

    boolean existsByUser_IdAndRelationship(UUID userId, Relationship relationship);
}
