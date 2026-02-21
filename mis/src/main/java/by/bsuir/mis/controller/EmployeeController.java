package by.bsuir.mis.controller;

import by.bsuir.mis.API.ApiResponse;
import by.bsuir.mis.dto.request.EmployeeCreateRequest;
import by.bsuir.mis.dto.request.EmployeeUpdateRequest;
import by.bsuir.mis.dto.response.EmployeeResponse;
import by.bsuir.mis.entity.Employee;
import by.bsuir.mis.entity.MedicalSpecialty;
import by.bsuir.mis.entity.User;
import by.bsuir.mis.exception.ResourceAlreadyExistsException;
import by.bsuir.mis.exception.ResourceNotFoundException;
import by.bsuir.mis.mapper.EmployeeMapper;
import by.bsuir.mis.service.EmployeeService;
import by.bsuir.mis.service.MedicalSpecialtyService;
import by.bsuir.mis.service.UserService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/employees")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeService employeeService;
    private final UserService userService;
    private final MedicalSpecialtyService medicalSpecialtyService;
    private final EmployeeMapper employeeMapper;

    @GetMapping
    public ResponseEntity<ApiResponse<List<EmployeeResponse>>> getAll() {
        List<EmployeeResponse> employees = employeeService.findAll().stream()
                .map(employeeMapper::toResponse)
                .toList();
        return ResponseEntity.ok(ApiResponse.<List<EmployeeResponse>>builder()
                .data(employees)
                .status(true)
                .message("Employees retrieved successfully")
                .build());
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<EmployeeResponse>>> getAllActive() {
        List<EmployeeResponse> employees = employeeService.findAllActive().stream()
                .map(employeeMapper::toResponse)
                .toList();
        return ResponseEntity.ok(ApiResponse.<List<EmployeeResponse>>builder()
                .data(employees)
                .status(true)
                .message("Active employees retrieved successfully")
                .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EmployeeResponse>> getById(@PathVariable UUID id) {
        Employee employee =
                employeeService.findById(id).orElseThrow(() -> new ResourceNotFoundException("Employee", "id", id));
        return ResponseEntity.ok(ApiResponse.<EmployeeResponse>builder()
                .data(employeeMapper.toResponse(employee))
                .status(true)
                .message("Employee retrieved successfully")
                .build());
    }

    @GetMapping("/specialty/{specialtyId}")
    public ResponseEntity<ApiResponse<List<EmployeeResponse>>> getBySpecialty(@PathVariable UUID specialtyId) {
        List<EmployeeResponse> employees = employeeService.findBySpecialtyId(specialtyId).stream()
                .map(employeeMapper::toResponse)
                .toList();
        return ResponseEntity.ok(ApiResponse.<List<EmployeeResponse>>builder()
                .data(employees)
                .status(true)
                .message("Employees by specialty retrieved successfully")
                .build());
    }

    @PostMapping
    public ResponseEntity<ApiResponse<EmployeeResponse>> create(@Valid @RequestBody EmployeeCreateRequest request) {
        User user = userService
                .findById(request.userId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.userId()));

        if (employeeService.findByUserId(request.userId()).isPresent()) {
            throw new ResourceAlreadyExistsException("Employee", "userId", request.userId());
        }

        MedicalSpecialty specialty = null;
        if (request.specialtyId() != null) {
            specialty = medicalSpecialtyService
                    .findById(request.specialtyId())
                    .orElseThrow(() -> new ResourceNotFoundException("MedicalSpecialty", "id", request.specialtyId()));
        }

        Employee employee = Employee.builder()
                .user(user)
                .specialty(specialty)
                .lastName(request.lastName())
                .firstName(request.firstName())
                .middleName(request.middleName())
                .position(request.position())
                .cabinet(request.cabinet())
                .hireDate(request.hireDate())
                .build();

        Employee saved = employeeService.save(employee);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<EmployeeResponse>builder()
                        .data(employeeMapper.toResponse(saved))
                        .status(true)
                        .message("Employee created successfully")
                        .build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<EmployeeResponse>> update(
            @PathVariable UUID id, @Valid @RequestBody EmployeeUpdateRequest request) {
        Employee employee =
                employeeService.findById(id).orElseThrow(() -> new ResourceNotFoundException("Employee", "id", id));

        if (request.specialtyId() != null) {
            MedicalSpecialty specialty = medicalSpecialtyService
                    .findById(request.specialtyId())
                    .orElseThrow(() -> new ResourceNotFoundException("MedicalSpecialty", "id", request.specialtyId()));
            employee.setSpecialty(specialty);
        }

        if (request.lastName() != null) employee.setLastName(request.lastName());
        if (request.firstName() != null) employee.setFirstName(request.firstName());
        if (request.middleName() != null) employee.setMiddleName(request.middleName());
        if (request.position() != null) employee.setPosition(request.position());
        if (request.cabinet() != null) employee.setCabinet(request.cabinet());
        if (request.dismissalDate() != null) employee.setDismissalDate(request.dismissalDate());
        if (request.isActive() != null) employee.setIsActive(request.isActive());

        Employee updated = employeeService.update(employee);
        return ResponseEntity.ok(ApiResponse.<EmployeeResponse>builder()
                .data(employeeMapper.toResponse(updated))
                .status(true)
                .message("Employee updated successfully")
                .build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        employeeService.deleteById(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .data(null)
                .status(true)
                .message("Employee deleted successfully")
                .build());
    }

    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<ApiResponse<Void>> deactivate(@PathVariable UUID id) {
        employeeService.deactivate(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .data(null)
                .status(true)
                .message("Employee deactivated successfully")
                .build());
    }

    @PatchMapping("/{id}/activate")
    public ResponseEntity<ApiResponse<Void>> activate(@PathVariable UUID id) {
        employeeService.activate(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .data(null)
                .status(true)
                .message("Employee activated successfully")
                .build());
    }
}
