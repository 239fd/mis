package by.bsuir.mis.controller;

import by.bsuir.mis.API.ApiResponse;
import by.bsuir.mis.dto.request.DoctorScheduleRequest;
import by.bsuir.mis.dto.request.ScheduleExceptionRequest;
import by.bsuir.mis.dto.response.AppointmentShortResponse;
import by.bsuir.mis.dto.response.DoctorScheduleResponse;
import by.bsuir.mis.dto.response.ScheduleExceptionResponse;
import by.bsuir.mis.entity.DoctorSchedule;
import by.bsuir.mis.entity.Employee;
import by.bsuir.mis.entity.ScheduleException;
import by.bsuir.mis.entity.User;
import by.bsuir.mis.exception.BadRequestException;
import by.bsuir.mis.exception.ResourceNotFoundException;
import by.bsuir.mis.mapper.AppointmentMapper;
import by.bsuir.mis.mapper.DoctorScheduleMapper;
import by.bsuir.mis.mapper.ScheduleExceptionMapper;
import by.bsuir.mis.service.*;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/schedules")
@RequiredArgsConstructor
public class ScheduleController {

    private final DoctorScheduleService doctorScheduleService;
    private final ScheduleExceptionService scheduleExceptionService;
    private final EmployeeService employeeService;
    private final UserService userService;
    private final AppointmentService appointmentService;
    private final DoctorScheduleMapper doctorScheduleMapper;
    private final ScheduleExceptionMapper scheduleExceptionMapper;
    private final AppointmentMapper appointmentMapper;

    @GetMapping
    public ResponseEntity<ApiResponse<List<DoctorScheduleResponse>>> getAll() {
        List<DoctorScheduleResponse> schedules = doctorScheduleService.findAll().stream()
                .map(doctorScheduleMapper::toResponse)
                .toList();
        return ResponseEntity.ok(ApiResponse.<List<DoctorScheduleResponse>>builder()
                .data(schedules)
                .status(true)
                .message("Schedules retrieved successfully")
                .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DoctorScheduleResponse>> getById(@PathVariable UUID id) {
        DoctorSchedule schedule = doctorScheduleService
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("DoctorSchedule", "id", id));
        return ResponseEntity.ok(ApiResponse.<DoctorScheduleResponse>builder()
                .data(doctorScheduleMapper.toResponse(schedule))
                .status(true)
                .message("Schedule retrieved successfully")
                .build());
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<ApiResponse<List<DoctorScheduleResponse>>> getByEmployee(@PathVariable UUID employeeId) {
        List<DoctorScheduleResponse> schedules = doctorScheduleService.findByEmployeeId(employeeId).stream()
                .map(doctorScheduleMapper::toResponse)
                .toList();
        return ResponseEntity.ok(ApiResponse.<List<DoctorScheduleResponse>>builder()
                .data(schedules)
                .status(true)
                .message("Employee schedules retrieved successfully")
                .build());
    }

    @GetMapping("/employee/{employeeId}/active")
    public ResponseEntity<ApiResponse<List<DoctorScheduleResponse>>> getActiveByEmployee(
            @PathVariable UUID employeeId, @RequestParam(required = false) LocalDate date) {
        LocalDate effectiveDate = date != null ? date : LocalDate.now();
        List<DoctorScheduleResponse> schedules =
                doctorScheduleService.findActiveByEmployeeId(employeeId, effectiveDate).stream()
                        .map(doctorScheduleMapper::toResponse)
                        .toList();
        return ResponseEntity.ok(ApiResponse.<List<DoctorScheduleResponse>>builder()
                .data(schedules)
                .status(true)
                .message("Active employee schedules retrieved successfully")
                .build());
    }

    @PostMapping
    public ResponseEntity<ApiResponse<DoctorScheduleResponse>> create(
            @Valid @RequestBody DoctorScheduleRequest request) {
        Employee employee = employeeService
                .findById(request.employeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", request.employeeId()));

        if (request.startTime().isAfter(request.endTime())
                || request.startTime().equals(request.endTime())) {
            throw new BadRequestException("Start time must be before end time");
        }

        DoctorSchedule schedule = DoctorSchedule.builder()
                .employee(employee)
                .dayOfWeek(request.dayOfWeek())
                .startTime(request.startTime())
                .endTime(request.endTime())
                .paidStartTime(request.paidStartTime())
                .paidEndTime(request.paidEndTime())
                .cabinet(request.cabinet())
                .effectiveFrom(request.effectiveFrom())
                .effectiveTo(request.effectiveTo())
                .build();

        DoctorSchedule saved = doctorScheduleService.save(schedule);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<DoctorScheduleResponse>builder()
                        .data(doctorScheduleMapper.toResponse(saved))
                        .status(true)
                        .message("Schedule created successfully")
                        .build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<DoctorScheduleResponse>> update(
            @PathVariable UUID id, @Valid @RequestBody DoctorScheduleRequest request) {
        DoctorSchedule schedule = doctorScheduleService
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("DoctorSchedule", "id", id));

        if (request.employeeId() != null) {
            Employee employee = employeeService
                    .findById(request.employeeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", request.employeeId()));
            schedule.setEmployee(employee);
        }

        if (request.dayOfWeek() != null) schedule.setDayOfWeek(request.dayOfWeek());
        if (request.startTime() != null) schedule.setStartTime(request.startTime());
        if (request.endTime() != null) schedule.setEndTime(request.endTime());
        if (request.paidStartTime() != null) schedule.setPaidStartTime(request.paidStartTime());
        if (request.paidEndTime() != null) schedule.setPaidEndTime(request.paidEndTime());
        if (request.cabinet() != null) schedule.setCabinet(request.cabinet());
        if (request.effectiveFrom() != null) schedule.setEffectiveFrom(request.effectiveFrom());
        schedule.setEffectiveTo(request.effectiveTo());

        DoctorSchedule updated = doctorScheduleService.update(schedule);
        return ResponseEntity.ok(ApiResponse.<DoctorScheduleResponse>builder()
                .data(doctorScheduleMapper.toResponse(updated))
                .status(true)
                .message("Schedule updated successfully")
                .build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        doctorScheduleService.deleteById(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .data(null)
                .status(true)
                .message("Schedule deleted successfully")
                .build());
    }

    @GetMapping("/exceptions")
    public ResponseEntity<ApiResponse<List<ScheduleExceptionResponse>>> getAllExceptions() {
        List<ScheduleExceptionResponse> exceptions = scheduleExceptionService.findAll().stream()
                .map(scheduleExceptionMapper::toResponse)
                .toList();
        return ResponseEntity.ok(ApiResponse.<List<ScheduleExceptionResponse>>builder()
                .data(exceptions)
                .status(true)
                .message("Schedule exceptions retrieved successfully")
                .build());
    }

    @GetMapping("/exceptions/employee/{employeeId}")
    public ResponseEntity<ApiResponse<List<ScheduleExceptionResponse>>> getExceptionsByEmployee(
            @PathVariable UUID employeeId) {
        List<ScheduleExceptionResponse> exceptions = scheduleExceptionService.findByEmployeeId(employeeId).stream()
                .map(scheduleExceptionMapper::toResponse)
                .toList();
        return ResponseEntity.ok(ApiResponse.<List<ScheduleExceptionResponse>>builder()
                .data(exceptions)
                .status(true)
                .message("Employee schedule exceptions retrieved successfully")
                .build());
    }

    @GetMapping("/exceptions/employee/{employeeId}/range")
    public ResponseEntity<ApiResponse<List<ScheduleExceptionResponse>>> getExceptionsByEmployeeAndDateRange(
            @PathVariable UUID employeeId, @RequestParam LocalDate dateFrom, @RequestParam LocalDate dateTo) {
        List<ScheduleExceptionResponse> exceptions =
                scheduleExceptionService.findByEmployeeIdAndDateRange(employeeId, dateFrom, dateTo).stream()
                        .map(scheduleExceptionMapper::toResponse)
                        .toList();
        return ResponseEntity.ok(ApiResponse.<List<ScheduleExceptionResponse>>builder()
                .data(exceptions)
                .status(true)
                .message("Employee schedule exceptions for date range retrieved successfully")
                .build());
    }

    @PostMapping("/exceptions")
    public ResponseEntity<ApiResponse<ScheduleExceptionResponse>> createException(
            @Valid @RequestBody ScheduleExceptionRequest request, @RequestHeader(value = "X-User-Id") UUID userId) {
        Employee employee = employeeService
                .findById(request.employeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", request.employeeId()));

        if (request.dateFrom().isAfter(request.dateTo())) {
            throw new BadRequestException("Date from must be before or equal to date to");
        }

        User createdBy =
                userService.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        ScheduleException exception = ScheduleException.builder()
                .employee(employee)
                .exceptionType(request.exceptionType())
                .dateFrom(request.dateFrom())
                .dateTo(request.dateTo())
                .reason(request.reason())
                .createdBy(createdBy)
                .build();

        ScheduleException saved = scheduleExceptionService.save(exception);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<ScheduleExceptionResponse>builder()
                        .data(scheduleExceptionMapper.toResponse(saved))
                        .status(true)
                        .message("Schedule exception created successfully")
                        .build());
    }

    @DeleteMapping("/exceptions/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteException(@PathVariable UUID id) {
        scheduleExceptionService.deleteById(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .data(null)
                .status(true)
                .message("Schedule exception deleted successfully")
                .build());
    }

    @GetMapping("/exceptions/employee/{employeeId}/affected-appointments")
    public ResponseEntity<ApiResponse<List<AppointmentShortResponse>>> getAffectedAppointments(
            @PathVariable UUID employeeId, @RequestParam LocalDate dateFrom, @RequestParam LocalDate dateTo) {
        List<AppointmentShortResponse> affected = new java.util.ArrayList<>();
        LocalDate current = dateFrom;
        while (!current.isAfter(dateTo)) {
            final LocalDate date = current;
            appointmentService.findByEmployeeIdAndDate(employeeId, date).stream()
                    .map(appointmentMapper::toShortResponse)
                    .forEach(affected::add);
            current = current.plusDays(1);
        }
        return ResponseEntity.ok(ApiResponse.<List<AppointmentShortResponse>>builder()
                .data(affected)
                .status(true)
                .message("Affected appointments retrieved successfully")
                .build());
    }
}
