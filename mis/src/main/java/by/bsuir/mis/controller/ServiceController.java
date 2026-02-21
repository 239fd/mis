package by.bsuir.mis.controller;

import by.bsuir.mis.API.ApiResponse;
import by.bsuir.mis.dto.request.ServiceDurationRequest;
import by.bsuir.mis.dto.request.ServiceRequest;
import by.bsuir.mis.dto.response.ServiceDurationResponse;
import by.bsuir.mis.dto.response.ServiceResponse;
import by.bsuir.mis.entity.Service;
import by.bsuir.mis.entity.ServiceDuration;
import by.bsuir.mis.exception.ResourceAlreadyExistsException;
import by.bsuir.mis.exception.ResourceNotFoundException;
import by.bsuir.mis.mapper.ServiceDurationMapper;
import by.bsuir.mis.mapper.ServiceMapper;
import by.bsuir.mis.service.ServiceDurationService;
import by.bsuir.mis.service.ServiceService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/services")
@RequiredArgsConstructor
public class ServiceController {

    private final ServiceService serviceService;
    private final ServiceDurationService serviceDurationService;
    private final ServiceMapper serviceMapper;
    private final ServiceDurationMapper serviceDurationMapper;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ServiceResponse>>> getAll() {
        List<ServiceResponse> services =
                serviceService.findAll().stream().map(serviceMapper::toResponse).toList();
        return ResponseEntity.ok(ApiResponse.<List<ServiceResponse>>builder()
                .data(services)
                .status(true)
                .message("Services retrieved successfully")
                .build());
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<ServiceResponse>>> getAllActive() {
        List<ServiceResponse> services = serviceService.findAllActive().stream()
                .map(serviceMapper::toResponse)
                .toList();
        return ResponseEntity.ok(ApiResponse.<List<ServiceResponse>>builder()
                .data(services)
                .status(true)
                .message("Active services retrieved successfully")
                .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ServiceResponse>> getById(@PathVariable UUID id) {
        Service service =
                serviceService.findById(id).orElseThrow(() -> new ResourceNotFoundException("Service", "id", id));
        return ResponseEntity.ok(ApiResponse.<ServiceResponse>builder()
                .data(serviceMapper.toResponse(service))
                .status(true)
                .message("Service retrieved successfully")
                .build());
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ServiceResponse>> create(@Valid @RequestBody ServiceRequest request) {
        if (serviceService.existsByName(request.name())) {
            throw new ResourceAlreadyExistsException("Service", "name", request.name());
        }

        Service service = Service.builder()
                .name(request.name())
                .description(request.description())
                .isActive(request.isActive() != null ? request.isActive() : true)
                .build();

        Service saved = serviceService.save(service);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<ServiceResponse>builder()
                        .data(serviceMapper.toResponse(saved))
                        .status(true)
                        .message("Service created successfully")
                        .build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ServiceResponse>> update(
            @PathVariable UUID id, @Valid @RequestBody ServiceRequest request) {
        Service service =
                serviceService.findById(id).orElseThrow(() -> new ResourceNotFoundException("Service", "id", id));

        if (request.name() != null && !request.name().equals(service.getName())) {
            if (serviceService.existsByName(request.name())) {
                throw new ResourceAlreadyExistsException("Service", "name", request.name());
            }
            service.setName(request.name());
        }
        if (request.description() != null) service.setDescription(request.description());
        if (request.isActive() != null) service.setIsActive(request.isActive());

        Service updated = serviceService.update(service);
        return ResponseEntity.ok(ApiResponse.<ServiceResponse>builder()
                .data(serviceMapper.toResponse(updated))
                .status(true)
                .message("Service updated successfully")
                .build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        serviceService.deleteById(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .data(null)
                .status(true)
                .message("Service deleted successfully")
                .build());
    }

    @GetMapping("/{id}/durations")
    public ResponseEntity<ApiResponse<List<ServiceDurationResponse>>> getDurations(@PathVariable UUID id) {
        if (serviceService.findById(id).isEmpty()) {
            throw new ResourceNotFoundException("Service", "id", id);
        }
        List<ServiceDurationResponse> durations = serviceDurationService.findByServiceId(id).stream()
                .map(serviceDurationMapper::toResponse)
                .toList();
        return ResponseEntity.ok(ApiResponse.<List<ServiceDurationResponse>>builder()
                .data(durations)
                .status(true)
                .message("Service durations retrieved successfully")
                .build());
    }

    @PostMapping("/{id}/durations")
    public ResponseEntity<ApiResponse<ServiceDurationResponse>> createDuration(
            @PathVariable UUID id, @Valid @RequestBody ServiceDurationRequest request) {
        Service service =
                serviceService.findById(id).orElseThrow(() -> new ResourceNotFoundException("Service", "id", id));

        ServiceDuration duration = ServiceDuration.builder()
                .service(service)
                .durationMin(request.durationMin())
                .effectiveFrom(request.effectiveFrom())
                .effectiveTo(request.effectiveTo())
                .build();

        ServiceDuration saved = serviceDurationService.save(duration);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<ServiceDurationResponse>builder()
                        .data(serviceDurationMapper.toResponse(saved))
                        .status(true)
                        .message("Service duration created successfully")
                        .build());
    }
}
