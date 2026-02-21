package by.bsuir.mis.controller;

import by.bsuir.mis.API.ApiResponse;
import by.bsuir.mis.dto.request.DoctorServiceRequest;
import by.bsuir.mis.dto.response.DoctorServiceResponse;
import by.bsuir.mis.entity.DoctorService;
import by.bsuir.mis.entity.Employee;
import by.bsuir.mis.entity.Service;
import by.bsuir.mis.exception.ResourceAlreadyExistsException;
import by.bsuir.mis.exception.ResourceNotFoundException;
import by.bsuir.mis.mapper.DoctorServiceMapper;
import by.bsuir.mis.service.DoctorServiceService;
import by.bsuir.mis.service.EmployeeService;
import by.bsuir.mis.service.ServiceService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/doctor-services")
@RequiredArgsConstructor
public class DoctorServiceController {

    private final DoctorServiceService doctorServiceService;
    private final EmployeeService employeeService;
    private final ServiceService serviceService;
    private final DoctorServiceMapper doctorServiceMapper;

    @GetMapping
    public ResponseEntity<ApiResponse<List<DoctorServiceResponse>>> getAll() {
        List<DoctorServiceResponse> doctorServices = doctorServiceService.findAll().stream()
                .map(doctorServiceMapper::toResponse)
                .toList();
        return ResponseEntity.ok(ApiResponse.<List<DoctorServiceResponse>>builder()
                .data(doctorServices)
                .status(true)
                .message("Doctor services retrieved successfully")
                .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DoctorServiceResponse>> getById(@PathVariable UUID id) {
        DoctorService doctorService = doctorServiceService
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("DoctorService", "id", id));
        return ResponseEntity.ok(ApiResponse.<DoctorServiceResponse>builder()
                .data(doctorServiceMapper.toResponse(doctorService))
                .status(true)
                .message("Doctor service retrieved successfully")
                .build());
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<ApiResponse<List<DoctorServiceResponse>>> getByEmployee(@PathVariable UUID employeeId) {
        List<DoctorServiceResponse> doctorServices = doctorServiceService.findByEmployeeId(employeeId).stream()
                .map(doctorServiceMapper::toResponse)
                .toList();
        return ResponseEntity.ok(ApiResponse.<List<DoctorServiceResponse>>builder()
                .data(doctorServices)
                .status(true)
                .message("Employee services retrieved successfully")
                .build());
    }

    @GetMapping("/employee/{employeeId}/active")
    public ResponseEntity<ApiResponse<List<DoctorServiceResponse>>> getActiveByEmployee(@PathVariable UUID employeeId) {
        List<DoctorServiceResponse> doctorServices = doctorServiceService.findActiveByEmployeeId(employeeId).stream()
                .map(doctorServiceMapper::toResponse)
                .toList();
        return ResponseEntity.ok(ApiResponse.<List<DoctorServiceResponse>>builder()
                .data(doctorServices)
                .status(true)
                .message("Active employee services retrieved successfully")
                .build());
    }

    @GetMapping("/service/{serviceId}")
    public ResponseEntity<ApiResponse<List<DoctorServiceResponse>>> getByService(@PathVariable UUID serviceId) {
        List<DoctorServiceResponse> doctorServices = doctorServiceService.findByServiceId(serviceId).stream()
                .map(doctorServiceMapper::toResponse)
                .toList();
        return ResponseEntity.ok(ApiResponse.<List<DoctorServiceResponse>>builder()
                .data(doctorServices)
                .status(true)
                .message("Service doctors retrieved successfully")
                .build());
    }

    @PostMapping
    public ResponseEntity<ApiResponse<DoctorServiceResponse>> create(@Valid @RequestBody DoctorServiceRequest request) {
        Employee employee = employeeService
                .findById(request.employeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", request.employeeId()));
        Service service = serviceService
                .findById(request.serviceId())
                .orElseThrow(() -> new ResourceNotFoundException("Service", "id", request.serviceId()));

        if (doctorServiceService
                .findByEmployeeIdAndServiceId(request.employeeId(), request.serviceId())
                .isPresent()) {
            throw new ResourceAlreadyExistsException(
                    "DoctorService", "employeeId and serviceId", request.employeeId() + " - " + request.serviceId());
        }

        DoctorService doctorService = DoctorService.builder()
                .employee(employee)
                .service(service)
                .isActive(request.isActive() != null ? request.isActive() : true)
                .build();

        DoctorService saved = doctorServiceService.save(doctorService);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<DoctorServiceResponse>builder()
                        .data(doctorServiceMapper.toResponse(saved))
                        .status(true)
                        .message("Doctor service created successfully")
                        .build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<DoctorServiceResponse>> update(
            @PathVariable UUID id, @Valid @RequestBody DoctorServiceRequest request) {
        DoctorService doctorService = doctorServiceService
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("DoctorService", "id", id));

        if (request.isActive() != null) doctorService.setIsActive(request.isActive());

        DoctorService updated = doctorServiceService.update(doctorService);
        return ResponseEntity.ok(ApiResponse.<DoctorServiceResponse>builder()
                .data(doctorServiceMapper.toResponse(updated))
                .status(true)
                .message("Doctor service updated successfully")
                .build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        doctorServiceService.deleteById(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .data(null)
                .status(true)
                .message("Doctor service deleted successfully")
                .build());
    }

    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<ApiResponse<Void>> deactivate(@PathVariable UUID id) {
        doctorServiceService.deactivate(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .data(null)
                .status(true)
                .message("Doctor service deactivated successfully")
                .build());
    }
}
