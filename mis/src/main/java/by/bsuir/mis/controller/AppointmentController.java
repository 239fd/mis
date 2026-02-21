package by.bsuir.mis.controller;

import by.bsuir.mis.API.ApiResponse;
import by.bsuir.mis.dto.request.AppointmentCreateRequest;
import by.bsuir.mis.dto.request.AppointmentStatusUpdateRequest;
import by.bsuir.mis.dto.request.AppointmentUpdateRequest;
import by.bsuir.mis.dto.response.AppointmentResponse;
import by.bsuir.mis.dto.response.AppointmentShortResponse;
import by.bsuir.mis.dto.response.AppointmentStatusHistoryResponse;
import by.bsuir.mis.entity.*;
import by.bsuir.mis.entity.enums.AppointmentSource;
import by.bsuir.mis.entity.enums.AppointmentStatus;
import by.bsuir.mis.exception.BadRequestException;
import by.bsuir.mis.exception.ResourceNotFoundException;
import by.bsuir.mis.mapper.AppointmentMapper;
import by.bsuir.mis.mapper.AppointmentStatusHistoryMapper;
import by.bsuir.mis.service.*;
import jakarta.validation.Valid;
import java.time.LocalDate;
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
@RequestMapping("/api/v1/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;
    private final AppointmentStatusHistoryService statusHistoryService;
    private final PatientService patientService;
    private final EmployeeService employeeService;
    private final ServiceService serviceService;
    private final DoctorScheduleService doctorScheduleService;
    private final UserService userService;
    private final UserPatientService userPatientService;
    private final AppointmentMapper appointmentMapper;
    private final AppointmentStatusHistoryMapper statusHistoryMapper;

    private void checkDoctorAccess(UUID employeeId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isDoctor =
                auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_DOCTOR"));

        if (isDoctor) {
            User currentUser = userService
                    .findByLogin(auth.getName())
                    .orElseThrow(() -> new ResourceNotFoundException("User", "login", auth.getName()));

            Employee currentEmployee = employeeService
                    .findByUserId(currentUser.getId())
                    .orElseThrow(() -> new AccessDeniedException("Doctor profile not found"));

            if (!currentEmployee.getId().equals(employeeId)) {
                throw new AccessDeniedException("You can only view your own appointments");
            }
        }
    }

    private void checkDoctorAccessToAppointment(Appointment appointment) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isDoctor =
                auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_DOCTOR"));

        if (isDoctor) {
            User currentUser = userService
                    .findByLogin(auth.getName())
                    .orElseThrow(() -> new ResourceNotFoundException("User", "login", auth.getName()));

            Employee currentEmployee = employeeService
                    .findByUserId(currentUser.getId())
                    .orElseThrow(() -> new AccessDeniedException("Doctor profile not found"));

            if (!appointment.getEmployee().getId().equals(currentEmployee.getId())) {
                throw new AccessDeniedException("You can only manage your own appointments");
            }
        }
    }

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
                throw new AccessDeniedException("You can only view appointments for patients linked to your account");
            }
        }
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<AppointmentResponse>>> getAll() {
        List<AppointmentResponse> appointments = appointmentService.findAll().stream()
                .map(appointmentMapper::toResponse)
                .toList();
        return ResponseEntity.ok(ApiResponse.<List<AppointmentResponse>>builder()
                .data(appointments)
                .status(true)
                .message("Appointments retrieved successfully")
                .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AppointmentResponse>> getById(@PathVariable UUID id) {
        Appointment appointment = appointmentService
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", id));
        return ResponseEntity.ok(ApiResponse.<AppointmentResponse>builder()
                .data(appointmentMapper.toResponse(appointment))
                .status(true)
                .message("Appointment retrieved successfully")
                .build());
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<ApiResponse<List<AppointmentResponse>>> getByPatient(@PathVariable UUID patientId) {
        checkPatientAccess(patientId);
        List<AppointmentResponse> appointments = appointmentService.findByPatientId(patientId).stream()
                .map(appointmentMapper::toResponse)
                .toList();
        return ResponseEntity.ok(ApiResponse.<List<AppointmentResponse>>builder()
                .data(appointments)
                .status(true)
                .message("Patient appointments retrieved successfully")
                .build());
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<ApiResponse<List<AppointmentResponse>>> getByEmployee(@PathVariable UUID employeeId) {
        checkDoctorAccess(employeeId);
        List<AppointmentResponse> appointments = appointmentService.findByEmployeeId(employeeId).stream()
                .map(appointmentMapper::toResponse)
                .toList();
        return ResponseEntity.ok(ApiResponse.<List<AppointmentResponse>>builder()
                .data(appointments)
                .status(true)
                .message("Employee appointments retrieved successfully")
                .build());
    }

    @GetMapping("/employee/{employeeId}/date/{date}")
    public ResponseEntity<ApiResponse<List<AppointmentShortResponse>>> getByEmployeeAndDate(
            @PathVariable UUID employeeId, @PathVariable LocalDate date) {
        checkDoctorAccess(employeeId);
        List<AppointmentShortResponse> appointments =
                appointmentService.findByEmployeeIdAndDate(employeeId, date).stream()
                        .map(appointmentMapper::toShortResponse)
                        .toList();
        return ResponseEntity.ok(ApiResponse.<List<AppointmentShortResponse>>builder()
                .data(appointments)
                .status(true)
                .message("Employee appointments for date retrieved successfully")
                .build());
    }

    @GetMapping("/date/{date}")
    public ResponseEntity<ApiResponse<List<AppointmentShortResponse>>> getByDate(@PathVariable LocalDate date) {
        List<AppointmentShortResponse> appointments = appointmentService.findByDate(date).stream()
                .map(appointmentMapper::toShortResponse)
                .toList();
        return ResponseEntity.ok(ApiResponse.<List<AppointmentShortResponse>>builder()
                .data(appointments)
                .status(true)
                .message("Appointments for date retrieved successfully")
                .build());
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponse<List<AppointmentResponse>>> getByStatus(@PathVariable AppointmentStatus status) {
        List<AppointmentResponse> appointments = appointmentService.findByStatus(status).stream()
                .map(appointmentMapper::toResponse)
                .toList();
        return ResponseEntity.ok(ApiResponse.<List<AppointmentResponse>>builder()
                .data(appointments)
                .status(true)
                .message("Appointments by status retrieved successfully")
                .build());
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AppointmentResponse>> create(
            @Valid @RequestBody AppointmentCreateRequest request, @RequestHeader(value = "X-User-Id") UUID userId) {
        Patient patient = patientService
                .findById(request.patientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "id", request.patientId()));
        Employee employee = employeeService
                .findById(request.employeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", request.employeeId()));
        Service service = serviceService
                .findById(request.serviceId())
                .orElseThrow(() -> new ResourceNotFoundException("Service", "id", request.serviceId()));

        DoctorSchedule schedule = null;
        if (request.scheduleId() != null) {
            schedule = doctorScheduleService
                    .findById(request.scheduleId())
                    .orElseThrow(() -> new ResourceNotFoundException("DoctorSchedule", "id", request.scheduleId()));
        }

        User createdBy =
                userService.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (request.startTime().isAfter(request.endTime())
                || request.startTime().equals(request.endTime())) {
            throw new BadRequestException("Start time must be before end time");
        }

        Appointment appointment = Appointment.builder()
                .patient(patient)
                .employee(employee)
                .service(service)
                .schedule(schedule)
                .appointmentDate(request.appointmentDate())
                .startTime(request.startTime())
                .endTime(request.endTime())
                .source(request.source() != null ? request.source() : AppointmentSource.ONLINE)
                .createdBy(createdBy)
                .build();

        Appointment saved = appointmentService.save(appointment);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<AppointmentResponse>builder()
                        .data(appointmentMapper.toResponse(saved))
                        .status(true)
                        .message("Appointment created successfully")
                        .build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AppointmentResponse>> update(
            @PathVariable UUID id, @Valid @RequestBody AppointmentUpdateRequest request) {
        Appointment appointment = appointmentService
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", id));

        if (request.patientId() != null) {
            Patient patient = patientService
                    .findById(request.patientId())
                    .orElseThrow(() -> new ResourceNotFoundException("Patient", "id", request.patientId()));
            appointment.setPatient(patient);
        }
        if (request.employeeId() != null) {
            Employee employee = employeeService
                    .findById(request.employeeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", request.employeeId()));
            appointment.setEmployee(employee);
        }
        if (request.serviceId() != null) {
            Service service = serviceService
                    .findById(request.serviceId())
                    .orElseThrow(() -> new ResourceNotFoundException("Service", "id", request.serviceId()));
            appointment.setService(service);
        }
        if (request.scheduleId() != null) {
            DoctorSchedule schedule = doctorScheduleService
                    .findById(request.scheduleId())
                    .orElseThrow(() -> new ResourceNotFoundException("DoctorSchedule", "id", request.scheduleId()));
            appointment.setSchedule(schedule);
        }
        if (request.appointmentDate() != null) appointment.setAppointmentDate(request.appointmentDate());
        if (request.startTime() != null) appointment.setStartTime(request.startTime());
        if (request.endTime() != null) appointment.setEndTime(request.endTime());
        if (request.isPaid() != null) appointment.setIsPaid(request.isPaid());
        if (request.status() != null) appointment.setStatus(request.status());
        if (request.cancelReason() != null) appointment.setCancelReason(request.cancelReason());

        Appointment updated = appointmentService.update(appointment);
        return ResponseEntity.ok(ApiResponse.<AppointmentResponse>builder()
                .data(appointmentMapper.toResponse(updated))
                .status(true)
                .message("Appointment updated successfully")
                .build());
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<AppointmentResponse>> updateStatus(
            @PathVariable UUID id,
            @Valid @RequestBody AppointmentStatusUpdateRequest request,
            @RequestHeader(value = "X-User-Id") UUID userId) {
        Appointment appointment = appointmentService
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", id));

        checkDoctorAccessToAppointment(appointment);

        User changedBy =
                userService.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        AppointmentStatus oldStatus = appointment.getStatus();
        Appointment updated = appointmentService.updateStatus(id, request.status(), request.reason());

        AppointmentStatusHistory history = AppointmentStatusHistory.builder()
                .appointment(updated)
                .oldStatus(oldStatus)
                .newStatus(request.status())
                .changedBy(changedBy)
                .changeReason(request.reason())
                .build();
        statusHistoryService.save(history);

        return ResponseEntity.ok(ApiResponse.<AppointmentResponse>builder()
                .data(appointmentMapper.toResponse(updated))
                .status(true)
                .message("Appointment status updated successfully")
                .build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        appointmentService.deleteById(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .data(null)
                .status(true)
                .message("Appointment deleted successfully")
                .build());
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<ApiResponse<List<AppointmentStatusHistoryResponse>>> getStatusHistory(@PathVariable UUID id) {
        if (appointmentService.findById(id).isEmpty()) {
            throw new ResourceNotFoundException("Appointment", "id", id);
        }
        List<AppointmentStatusHistoryResponse> history = statusHistoryService.findByAppointmentId(id).stream()
                .map(statusHistoryMapper::toResponse)
                .toList();
        return ResponseEntity.ok(ApiResponse.<List<AppointmentStatusHistoryResponse>>builder()
                .data(history)
                .status(true)
                .message("Appointment status history retrieved successfully")
                .build());
    }
}
