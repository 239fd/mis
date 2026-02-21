package by.bsuir.mis.service.impl;

import by.bsuir.mis.entity.Patient;
import by.bsuir.mis.entity.User;
import by.bsuir.mis.entity.UserPatient;
import by.bsuir.mis.entity.enums.Relationship;
import by.bsuir.mis.exception.BadRequestException;
import by.bsuir.mis.exception.ResourceAlreadyExistsException;
import by.bsuir.mis.exception.ResourceNotFoundException;
import by.bsuir.mis.repository.UserPatientRepository;
import by.bsuir.mis.service.UserPatientService;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserPatientServiceImpl implements UserPatientService {

    private final UserPatientRepository userPatientRepository;

    @Override
    @Transactional
    public UserPatient save(UserPatient userPatient) {
        log.info(
                "Saving UserPatient: userId={}, patientId={}, relationship={}",
                userPatient.getUser().getId(),
                userPatient.getPatient().getId(),
                userPatient.getRelationship());
        return userPatientRepository.save(userPatient);
    }

    @Override
    @Transactional
    public UserPatient linkPatientToUser(User user, Patient patient, Relationship relationship) {
        log.info(
                "linkPatientToUser called: userId={}, patientId={}, relationship={}",
                user.getId(),
                patient.getId(),
                relationship);

        if (relationship == Relationship.SELF) {
            boolean existsSelf = userPatientRepository.existsByUser_IdAndRelationship(user.getId(), Relationship.SELF);
            log.info("Checking SELF relationship exists: {}", existsSelf);
            if (existsSelf) {
                log.warn("User already has SELF relationship, throwing exception");
                throw new BadRequestException(
                        "User already has a patient with SELF relationship. Only one SELF is allowed per user.");
            }
        }

        boolean existsLink = userPatientRepository.existsByUser_IdAndPatient_Id(user.getId(), patient.getId());
        log.info("Checking user-patient link exists: {}", existsLink);
        if (existsLink) {
            log.warn("User-patient link already exists, throwing exception");
            throw new ResourceAlreadyExistsException(
                    "UserPatient", "userId and patientId", user.getId() + " - " + patient.getId());
        }

        UserPatient userPatient = UserPatient.builder()
                .user(user)
                .patient(patient)
                .relationship(relationship)
                .build();

        log.info("Saving new UserPatient link");
        return userPatientRepository.save(userPatient);
    }

    @Override
    public Optional<UserPatient> findById(UUID id) {
        return userPatientRepository.findById(id);
    }

    @Override
    public List<UserPatient> findAll() {
        return userPatientRepository.findAll();
    }

    @Override
    public List<UserPatient> findByUserId(UUID userId) {
        return userPatientRepository.findByUser_Id(userId);
    }

    @Override
    public List<UserPatient> findByPatientId(UUID patientId) {
        return userPatientRepository.findByPatient_Id(patientId);
    }

    @Override
    public Optional<UserPatient> findByUserIdAndPatientId(UUID userId, UUID patientId) {
        return userPatientRepository.findByUser_IdAndPatient_Id(userId, patientId);
    }

    @Override
    public Optional<UserPatient> findByUserIdAndRelationship(UUID userId, Relationship relationship) {
        List<UserPatient> list = userPatientRepository.findByUser_IdAndRelationship(userId, relationship);
        return list.isEmpty() ? Optional.empty() : Optional.of(list.get(0));
    }

    @Override
    @Transactional
    public UserPatient update(UserPatient userPatient) {
        if (!userPatientRepository.existsById(userPatient.getId())) {
            throw new ResourceNotFoundException("UserPatient", "id", userPatient.getId());
        }
        return userPatientRepository.save(userPatient);
    }

    @Override
    @Transactional
    public void deleteById(UUID id) {
        if (!userPatientRepository.existsById(id)) {
            throw new ResourceNotFoundException("UserPatient", "id", id);
        }
        userPatientRepository.deleteById(id);
    }

    @Override
    public boolean existsByUserIdAndPatientId(UUID userId, UUID patientId) {
        return userPatientRepository.existsByUser_IdAndPatient_Id(userId, patientId);
    }

    @Override
    public boolean existsByUserIdAndRelationship(UUID userId, Relationship relationship) {
        return userPatientRepository.existsByUser_IdAndRelationship(userId, relationship);
    }
}
