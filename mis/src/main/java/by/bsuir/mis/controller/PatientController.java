package by.bsuir.mis.controller;

import by.bsuir.mis.API.ApiResponse;
import by.bsuir.mis.dto.request.PatientCreateRequest;
import by.bsuir.mis.dto.request.PatientCreateWithLinkRequest;
import by.bsuir.mis.dto.request.PatientUpdateRequest;
import by.bsuir.mis.dto.request.UserPatientRequest;
import by.bsuir.mis.dto.response.PatientResponse;
import by.bsuir.mis.dto.response.UserPatientResponse;
import by.bsuir.mis.entity.Patient;
import by.bsuir.mis.entity.User;
import by.bsuir.mis.entity.UserPatient;
import by.bsuir.mis.entity.enums.Relationship;
import by.bsuir.mis.exception.ResourceAlreadyExistsException;
import by.bsuir.mis.exception.ResourceNotFoundException;
import by.bsuir.mis.mapper.PatientMapper;
import by.bsuir.mis.mapper.UserPatientMapper;
import by.bsuir.mis.service.PatientService;
import by.bsuir.mis.service.UserPatientService;
import by.bsuir.mis.service.UserService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/patients")
@RequiredArgsConstructor
public class PatientController {

    private final PatientService patientService;
    private final UserPatientService userPatientService;
    private final UserService userService;
    private final PatientMapper patientMapper;
    private final UserPatientMapper userPatientMapper;

    private void checkPatientAccess(UUID patientId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isPatient =
                auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_PATIENT"));

        if (isPatient) {
            User currentUser = userService
                    .findByLogin(auth.getName())
                    .orElseThrow(() -> new ResourceNotFoundException("User", "login", auth.getName()));

            boolean hasAccess = userPatientService.existsByUserIdAndPatientId(currentUser.getId(), patientId);

            if (!hasAccess) {
                throw new AccessDeniedException("You can only access patients linked to your account");
            }
        }
    }

    private void checkUserAccess(UUID userId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isPatient =
                auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_PATIENT"));

        if (isPatient) {
            User currentUser = userService
                    .findByLogin(auth.getName())
                    .orElseThrow(() -> new ResourceNotFoundException("User", "login", auth.getName()));

            if (!currentUser.getId().equals(userId)) {
                throw new AccessDeniedException("You can only view your own linked patients");
            }
        }
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<PatientResponse>>> getAll() {
        List<PatientResponse> patients =
                patientService.findAll().stream().map(patientMapper::toResponse).toList();
        return ResponseEntity.ok(ApiResponse.<List<PatientResponse>>builder()
                .data(patients)
                .status(true)
                .message("Patients retrieved successfully")
                .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PatientResponse>> getById(@PathVariable UUID id) {
        Patient patient =
                patientService.findById(id).orElseThrow(() -> new ResourceNotFoundException("Patient", "id", id));
        return ResponseEntity.ok(ApiResponse.<PatientResponse>builder()
                .data(patientMapper.toResponse(patient))
                .status(true)
                .message("Patient retrieved successfully")
                .build());
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<PatientResponse>>> searchByName(@RequestParam String name) {
        List<PatientResponse> patients = patientService.findByLastName(name).stream()
                .map(patientMapper::toResponse)
                .toList();
        return ResponseEntity.ok(ApiResponse.<List<PatientResponse>>builder()
                .data(patients)
                .status(true)
                .message("Patients found successfully")
                .build());
    }

    @GetMapping("/passport")
    public ResponseEntity<ApiResponse<PatientResponse>> getByPassport(
            @RequestParam String series, @RequestParam String number) {
        Patient patient = patientService
                .findByPassport(series, number)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "passport", series + number));
        return ResponseEntity.ok(ApiResponse.<PatientResponse>builder()
                .data(patientMapper.toResponse(patient))
                .status(true)
                .message("Patient retrieved successfully")
                .build());
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PatientResponse>> create(@Valid @RequestBody PatientCreateRequest request) {
        if (patientService.existsByPassport(request.passportSeries(), request.passportNumber())) {
            throw new ResourceAlreadyExistsException(
                    "Patient", "passport", request.passportSeries() + request.passportNumber());
        }

        Patient patient = Patient.builder()
                .lastName(request.lastName())
                .firstName(request.firstName())
                .middleName(request.middleName())
                .gender(request.gender())
                .birthDate(request.birthDate())
                .passportSeries(request.passportSeries())
                .passportNumber(request.passportNumber())
                .phone(request.phone())
                .email(request.email())
                .address(request.address())
                .build();

        Patient saved = patientService.save(patient);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<PatientResponse>builder()
                        .data(patientMapper.toResponse(saved))
                        .status(true)
                        .message("Patient created successfully")
                        .build());
    }

    @PostMapping("/with-link")
    public ResponseEntity<ApiResponse<PatientResponse>> createWithLink(
            @Valid @RequestBody PatientCreateWithLinkRequest request) {
        checkUserAccess(request.userId());

        User user = userService
                .findById(request.userId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.userId()));

        Relationship relationship = request.relationship() != null ? request.relationship() : Relationship.SELF;

        Patient patient = Patient.builder()
                .lastName(request.lastName())
                .firstName(request.firstName())
                .middleName(request.middleName())
                .gender(request.gender())
                .birthDate(request.birthDate())
                .passportSeries(request.passportSeries())
                .passportNumber(request.passportNumber())
                .phone(request.phone())
                .email(request.email())
                .address(request.address())
                .build();

        Patient savedPatient = patientService.createPatientWithLink(patient, user, relationship);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<PatientResponse>builder()
                        .data(patientMapper.toResponse(savedPatient))
                        .status(true)
                        .message("Patient created and linked successfully")
                        .build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PatientResponse>> update(
            @PathVariable UUID id, @Valid @RequestBody PatientUpdateRequest request) {
        checkPatientAccess(id);

        Patient patient =
                patientService.findById(id).orElseThrow(() -> new ResourceNotFoundException("Patient", "id", id));

        if (request.lastName() != null) patient.setLastName(request.lastName());
        if (request.firstName() != null) patient.setFirstName(request.firstName());
        if (request.middleName() != null) patient.setMiddleName(request.middleName());
        if (request.gender() != null) patient.setGender(request.gender());
        if (request.birthDate() != null) patient.setBirthDate(request.birthDate());
        if (request.passportSeries() != null) patient.setPassportSeries(request.passportSeries());
        if (request.passportNumber() != null) patient.setPassportNumber(request.passportNumber());
        if (request.phone() != null) patient.setPhone(request.phone());
        if (request.email() != null) patient.setEmail(request.email());
        if (request.address() != null) patient.setAddress(request.address());

        Patient updated = patientService.update(patient);
        return ResponseEntity.ok(ApiResponse.<PatientResponse>builder()
                .data(patientMapper.toResponse(updated))
                .status(true)
                .message("Patient updated successfully")
                .build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        patientService.deleteById(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .data(null)
                .status(true)
                .message("Patient deleted successfully")
                .build());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<PatientResponse>>> getPatientsByUser(@PathVariable UUID userId) {
        checkUserAccess(userId);

        List<PatientResponse> patients = userPatientService.findByUserId(userId).stream()
                .map(up -> patientMapper.toResponse(up.getPatient()))
                .toList();
        return ResponseEntity.ok(ApiResponse.<List<PatientResponse>>builder()
                .data(patients)
                .status(true)
                .message("User patients retrieved successfully")
                .build());
    }

    @PostMapping("/link")
    public ResponseEntity<ApiResponse<UserPatientResponse>> linkPatientToUser(
            @Valid @RequestBody UserPatientRequest request) {
        checkUserAccess(request.userId());

        User user = userService
                .findById(request.userId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.userId()));
        Patient patient = patientService
                .findById(request.patientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "id", request.patientId()));

        Relationship relationship = request.relationship() != null ? request.relationship() : Relationship.SELF;

        UserPatient saved = userPatientService.linkPatientToUser(user, patient, relationship);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<UserPatientResponse>builder()
                        .data(userPatientMapper.toResponse(saved))
                        .status(true)
                        .message("Patient linked to user successfully")
                        .build());
    }

    @DeleteMapping("/unlink/{patientId}")
    public ResponseEntity<ApiResponse<Void>> unlinkPatientFromUser(@PathVariable UUID patientId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userService
                .findByLogin(auth.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User", "login", auth.getName()));

        UserPatient userPatient = userPatientService
                .findByUserIdAndPatientId(currentUser.getId(), patientId)
                .orElseThrow(() -> new ResourceNotFoundException("UserPatient", "patientId", patientId));

        userPatientService.deleteById(userPatient.getId());
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .data(null)
                .status(true)
                .message("Patient unlinked from user successfully")
                .build());
    }
}
