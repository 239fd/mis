package by.bsuir.mis.service.impl;

import by.bsuir.mis.entity.Patient;
import by.bsuir.mis.entity.User;
import by.bsuir.mis.entity.UserPatient;
import by.bsuir.mis.entity.enums.Relationship;
import by.bsuir.mis.exception.BadRequestException;
import by.bsuir.mis.exception.ResourceAlreadyExistsException;
import by.bsuir.mis.exception.ResourceNotFoundException;
import by.bsuir.mis.repository.PatientRepository;
import by.bsuir.mis.repository.UserPatientRepository;
import by.bsuir.mis.service.PatientService;
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
public class PatientServiceImpl implements PatientService {

    private final PatientRepository patientRepository;
    private final UserPatientRepository userPatientRepository;

    @Override
    @Transactional
    public Patient save(Patient patient) {
        return patientRepository.save(patient);
    }

    @Override
    @Transactional
    public Patient createPatientWithLink(Patient patient, User user, Relationship relationship) {
        log.info("createPatientWithLink called: userId={}, relationship={}", user.getId(), relationship);

        if (relationship == Relationship.SELF) {
            boolean existsSelf = userPatientRepository.existsByUser_IdAndRelationship(user.getId(), Relationship.SELF);
            log.info("Checking SELF relationship exists: {}", existsSelf);
            if (existsSelf) {
                log.warn("User already has SELF relationship, throwing exception");
                throw new BadRequestException(
                        "User already has a patient with SELF relationship. Only one SELF is allowed per user.");
            }
        }

        if (patientRepository.existsByPassportSeriesAndPassportNumber(
                patient.getPassportSeries(), patient.getPassportNumber())) {
            throw new ResourceAlreadyExistsException(
                    "Patient", "passport", patient.getPassportSeries() + patient.getPassportNumber());
        }

        Patient savedPatient = patientRepository.save(patient);

        UserPatient userPatient = UserPatient.builder()
                .user(user)
                .patient(savedPatient)
                .relationship(relationship)
                .build();

        userPatientRepository.save(userPatient);
        log.info("Patient created and linked successfully");

        return savedPatient;
    }

    @Override
    public Optional<Patient> findById(UUID id) {
        return patientRepository.findById(id);
    }

    @Override
    public Optional<Patient> findByPassport(String passportSeries, String passportNumber) {
        return patientRepository.findByPassportSeriesAndPassportNumber(passportSeries, passportNumber);
    }

    @Override
    public List<Patient> findAll() {
        return patientRepository.findAll();
    }

    @Override
    public List<Patient> findByLastName(String lastName) {
        return patientRepository.searchByName(lastName);
    }

    @Override
    @Transactional
    public Patient update(Patient patient) {
        if (!patientRepository.existsById(patient.getId())) {
            throw new ResourceNotFoundException("Patient", "id", patient.getId());
        }
        return patientRepository.save(patient);
    }

    @Override
    @Transactional
    public void deleteById(UUID id) {
        if (!patientRepository.existsById(id)) {
            throw new ResourceNotFoundException("Patient", "id", id);
        }
        patientRepository.deleteById(id);
    }

    @Override
    public boolean existsByPassport(String passportSeries, String passportNumber) {
        return patientRepository.existsByPassportSeriesAndPassportNumber(passportSeries, passportNumber);
    }
}
