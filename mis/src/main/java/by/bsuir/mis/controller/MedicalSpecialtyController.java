package by.bsuir.mis.controller;

import by.bsuir.mis.API.ApiResponse;
import by.bsuir.mis.dto.request.MedicalSpecialtyRequest;
import by.bsuir.mis.dto.response.MedicalSpecialtyResponse;
import by.bsuir.mis.entity.MedicalSpecialty;
import by.bsuir.mis.exception.ResourceAlreadyExistsException;
import by.bsuir.mis.exception.ResourceNotFoundException;
import by.bsuir.mis.mapper.MedicalSpecialtyMapper;
import by.bsuir.mis.service.MedicalSpecialtyService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/specialties")
@RequiredArgsConstructor
public class MedicalSpecialtyController {

    private final MedicalSpecialtyService medicalSpecialtyService;
    private final MedicalSpecialtyMapper medicalSpecialtyMapper;

    @GetMapping
    public ResponseEntity<ApiResponse<List<MedicalSpecialtyResponse>>> getAll() {
        List<MedicalSpecialtyResponse> specialties = medicalSpecialtyService.findAll().stream()
                .map(medicalSpecialtyMapper::toResponse)
                .toList();
        return ResponseEntity.ok(ApiResponse.<List<MedicalSpecialtyResponse>>builder()
                .data(specialties)
                .status(true)
                .message("Medical specialties retrieved successfully")
                .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MedicalSpecialtyResponse>> getById(@PathVariable UUID id) {
        MedicalSpecialty specialty = medicalSpecialtyService
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MedicalSpecialty", "id", id));
        return ResponseEntity.ok(ApiResponse.<MedicalSpecialtyResponse>builder()
                .data(medicalSpecialtyMapper.toResponse(specialty))
                .status(true)
                .message("Medical specialty retrieved successfully")
                .build());
    }

    @PostMapping
    public ResponseEntity<ApiResponse<MedicalSpecialtyResponse>> create(
            @Valid @RequestBody MedicalSpecialtyRequest request) {
        if (medicalSpecialtyService.existsByName(request.name())) {
            throw new ResourceAlreadyExistsException("MedicalSpecialty", "name", request.name());
        }

        MedicalSpecialty specialty = MedicalSpecialty.builder()
                .name(request.name())
                .description(request.description())
                .build();

        MedicalSpecialty saved = medicalSpecialtyService.save(specialty);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<MedicalSpecialtyResponse>builder()
                        .data(medicalSpecialtyMapper.toResponse(saved))
                        .status(true)
                        .message("Medical specialty created successfully")
                        .build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<MedicalSpecialtyResponse>> update(
            @PathVariable UUID id, @Valid @RequestBody MedicalSpecialtyRequest request) {
        MedicalSpecialty specialty = medicalSpecialtyService
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MedicalSpecialty", "id", id));

        if (request.name() != null && !request.name().equals(specialty.getName())) {
            if (medicalSpecialtyService.existsByName(request.name())) {
                throw new ResourceAlreadyExistsException("MedicalSpecialty", "name", request.name());
            }
            specialty.setName(request.name());
        }
        if (request.description() != null) specialty.setDescription(request.description());

        MedicalSpecialty updated = medicalSpecialtyService.update(specialty);
        return ResponseEntity.ok(ApiResponse.<MedicalSpecialtyResponse>builder()
                .data(medicalSpecialtyMapper.toResponse(updated))
                .status(true)
                .message("Medical specialty updated successfully")
                .build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        medicalSpecialtyService.deleteById(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .data(null)
                .status(true)
                .message("Medical specialty deleted successfully")
                .build());
    }
}
