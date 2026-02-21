package by.bsuir.mis.controller;

import by.bsuir.mis.API.ApiResponse;
import by.bsuir.mis.dto.request.PdfExportRequest;
import by.bsuir.mis.dto.response.AppointmentShortResponse;
import by.bsuir.mis.entity.Appointment;
import by.bsuir.mis.entity.enums.AppointmentStatus;
import by.bsuir.mis.mapper.AppointmentMapper;
import by.bsuir.mis.repository.EmployeeRepository;
import by.bsuir.mis.repository.PatientRepository;
import by.bsuir.mis.service.AppointmentService;
import by.bsuir.mis.service.PdfExportService;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/statistics")
@RequiredArgsConstructor
public class StatisticsController {

    private final AppointmentService appointmentService;
    private final EmployeeRepository employeeRepository;
    private final PatientRepository patientRepository;
    private final AppointmentMapper appointmentMapper;
    private final PdfExportService pdfExportService;

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboard() {
        LocalDate today = LocalDate.now();

        Map<String, Object> dashboard = new HashMap<>();

        dashboard.put("totalPatients", patientRepository.count());
        dashboard.put("totalEmployees", employeeRepository.count());
        dashboard.put("activeEmployees", employeeRepository.findByIsActive(true).size());

        List<Appointment> todayAppointments = appointmentService.findByDate(today);
        dashboard.put("todayAppointmentsCount", todayAppointments.size());

        Map<String, Long> todayByStatus = todayAppointments.stream()
                .collect(Collectors.groupingBy(a -> a.getStatus().name(), Collectors.counting()));
        dashboard.put("todayByStatus", todayByStatus);

        return ResponseEntity.ok(ApiResponse.<Map<String, Object>>builder()
                .data(dashboard)
                .status(true)
                .message("Dashboard statistics retrieved successfully")
                .build());
    }

    @GetMapping("/appointments/date-range")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAppointmentsByDateRange(
            @RequestParam LocalDate dateFrom, @RequestParam LocalDate dateTo) {

        Map<String, Object> stats = new HashMap<>();
        Map<LocalDate, Long> appointmentsByDate = new LinkedHashMap<>();

        LocalDate current = dateFrom;
        long totalCount = 0;
        while (!current.isAfter(dateTo)) {
            long count = appointmentService.findByDate(current).size();
            appointmentsByDate.put(current, count);
            totalCount += count;
            current = current.plusDays(1);
        }

        stats.put("byDate", appointmentsByDate);
        stats.put("totalCount", totalCount);
        stats.put("averagePerDay", appointmentsByDate.isEmpty() ? 0 : totalCount / appointmentsByDate.size());

        return ResponseEntity.ok(ApiResponse.<Map<String, Object>>builder()
                .data(stats)
                .status(true)
                .message("Appointments statistics by date range retrieved successfully")
                .build());
    }

    @GetMapping("/appointments/by-status")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getAppointmentsByStatus(
            @RequestParam(required = false) LocalDate dateFrom, @RequestParam(required = false) LocalDate dateTo) {

        List<Appointment> appointments;
        if (dateFrom != null && dateTo != null) {
            appointments = new ArrayList<>();
            LocalDate current = dateFrom;
            while (!current.isAfter(dateTo)) {
                appointments.addAll(appointmentService.findByDate(current));
                current = current.plusDays(1);
            }
        } else {
            appointments = appointmentService.findAll();
        }

        Map<String, Long> byStatus = appointments.stream()
                .collect(Collectors.groupingBy(a -> a.getStatus().name(), Collectors.counting()));

        return ResponseEntity.ok(ApiResponse.<Map<String, Long>>builder()
                .data(byStatus)
                .status(true)
                .message("Appointments by status retrieved successfully")
                .build());
    }

    @GetMapping("/appointments/by-employee")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAppointmentsByEmployee(
            @RequestParam(required = false) LocalDate dateFrom, @RequestParam(required = false) LocalDate dateTo) {

        List<Appointment> appointments;
        if (dateFrom != null && dateTo != null) {
            appointments = new ArrayList<>();
            LocalDate current = dateFrom;
            while (!current.isAfter(dateTo)) {
                appointments.addAll(appointmentService.findByDate(current));
                current = current.plusDays(1);
            }
        } else {
            appointments = appointmentService.findAll();
        }

        Map<UUID, List<Appointment>> byEmployee = appointments.stream()
                .filter(a -> a.getEmployee() != null)
                .collect(Collectors.groupingBy(a -> a.getEmployee().getId()));

        List<Map<String, Object>> result = byEmployee.entrySet().stream()
                .map(entry -> {
                    Map<String, Object> employeeStats = new HashMap<>();
                    Appointment first = entry.getValue().getFirst();
                    employeeStats.put("employeeId", entry.getKey());
                    employeeStats.put("employeeName", getFullName(first.getEmployee()));
                    employeeStats.put(
                            "specialty",
                            first.getEmployee().getSpecialty() != null
                                    ? first.getEmployee().getSpecialty().getName()
                                    : null);
                    employeeStats.put(
                            "totalAppointments", (long) entry.getValue().size());

                    Map<String, Long> statusCounts = entry.getValue().stream()
                            .collect(Collectors.groupingBy(a -> a.getStatus().name(), Collectors.counting()));
                    employeeStats.put("byStatus", statusCounts);

                    return employeeStats;
                })
                .sorted((a, b) -> Long.compare(
                        ((Number) b.get("totalAppointments")).longValue(),
                        ((Number) a.get("totalAppointments")).longValue()))
                .toList();

        return ResponseEntity.ok(ApiResponse.<List<Map<String, Object>>>builder()
                .data(result)
                .status(true)
                .message("Appointments by employee retrieved successfully")
                .build());
    }

    @GetMapping("/appointments/by-service")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAppointmentsByService(
            @RequestParam(required = false) LocalDate dateFrom, @RequestParam(required = false) LocalDate dateTo) {

        List<Appointment> appointments;
        if (dateFrom != null && dateTo != null) {
            appointments = new ArrayList<>();
            LocalDate current = dateFrom;
            while (!current.isAfter(dateTo)) {
                appointments.addAll(appointmentService.findByDate(current));
                current = current.plusDays(1);
            }
        } else {
            appointments = appointmentService.findAll();
        }

        Map<UUID, List<Appointment>> byService = appointments.stream()
                .filter(a -> a.getService() != null)
                .collect(Collectors.groupingBy(a -> a.getService().getId()));

        List<Map<String, Object>> result = byService.entrySet().stream()
                .map(entry -> {
                    Map<String, Object> serviceStats = new HashMap<>();
                    Appointment first = entry.getValue().getFirst();
                    serviceStats.put("serviceId", entry.getKey());
                    serviceStats.put("serviceName", first.getService().getName());
                    serviceStats.put(
                            "totalAppointments", (long) entry.getValue().size());

                    long paidCount = entry.getValue().stream()
                            .filter(Appointment::getIsPaid)
                            .count();
                    serviceStats.put("paidCount", paidCount);
                    serviceStats.put("freeCount", (long) entry.getValue().size() - paidCount);

                    return serviceStats;
                })
                .sorted((a, b) -> Long.compare(
                        ((Number) b.get("totalAppointments")).longValue(),
                        ((Number) a.get("totalAppointments")).longValue()))
                .toList();

        return ResponseEntity.ok(ApiResponse.<List<Map<String, Object>>>builder()
                .data(result)
                .status(true)
                .message("Appointments by service retrieved successfully")
                .build());
    }

    @GetMapping("/workload/today")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getTodayWorkload() {
        LocalDate today = LocalDate.now();
        List<Appointment> todayAppointments = appointmentService.findByDate(today);

        Map<UUID, List<Appointment>> byEmployee = todayAppointments.stream()
                .filter(a -> a.getEmployee() != null)
                .collect(Collectors.groupingBy(a -> a.getEmployee().getId()));

        List<Map<String, Object>> workload = byEmployee.entrySet().stream()
                .map(entry -> {
                    Map<String, Object> employeeWorkload = new HashMap<>();
                    Appointment first = entry.getValue().getFirst();
                    employeeWorkload.put("employeeId", entry.getKey());
                    employeeWorkload.put("employeeName", getFullName(first.getEmployee()));
                    employeeWorkload.put("cabinet", first.getEmployee().getCabinet());
                    employeeWorkload.put(
                            "totalAppointments", (long) entry.getValue().size());

                    long waiting = entry.getValue().stream()
                            .filter(a -> a.getStatus() == AppointmentStatus.WAITING)
                            .count();
                    long inProgress = entry.getValue().stream()
                            .filter(a -> a.getStatus() == AppointmentStatus.IN_PROGRESS)
                            .count();
                    long completed = entry.getValue().stream()
                            .filter(a -> a.getStatus() == AppointmentStatus.COMPLETED)
                            .count();

                    employeeWorkload.put("waiting", waiting);
                    employeeWorkload.put("inProgress", inProgress);
                    employeeWorkload.put("completed", completed);

                    List<AppointmentShortResponse> appointmentsList = entry.getValue().stream()
                            .map(appointmentMapper::toShortResponse)
                            .sorted(Comparator.comparing(AppointmentShortResponse::startTime))
                            .toList();
                    employeeWorkload.put("appointments", appointmentsList);

                    return employeeWorkload;
                })
                .sorted((a, b) -> Long.compare(
                        ((Number) b.get("totalAppointments")).longValue(),
                        ((Number) a.get("totalAppointments")).longValue()))
                .toList();

        return ResponseEntity.ok(ApiResponse.<List<Map<String, Object>>>builder()
                .data(workload)
                .status(true)
                .message("Today workload retrieved successfully")
                .build());
    }

    @GetMapping("/no-show-rate")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getNoShowRate(
            @RequestParam LocalDate dateFrom, @RequestParam LocalDate dateTo) {

        List<Appointment> appointments = new ArrayList<>();
        LocalDate current = dateFrom;
        while (!current.isAfter(dateTo)) {
            appointments.addAll(appointmentService.findByDate(current));
            current = current.plusDays(1);
        }

        long total = appointments.size();
        long noShow = appointments.stream()
                .filter(a -> a.getStatus() == AppointmentStatus.NO_SHOW)
                .count();

        Map<String, Object> result = new HashMap<>();
        result.put("totalAppointments", total);
        result.put("noShowCount", noShow);
        result.put("noShowRate", total > 0 ? (double) noShow / total * 100 : 0);

        return ResponseEntity.ok(ApiResponse.<Map<String, Object>>builder()
                .data(result)
                .status(true)
                .message("No-show rate retrieved successfully")
                .build());
    }

    @PostMapping("/export/pdf")
    public ResponseEntity<?> exportPdf(@Valid @RequestBody PdfExportRequest request) {
        if (request.dateFrom().isAfter(request.dateTo())) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.<Void>builder()
                            .data(null)
                            .status(false)
                            .message("Date from must be before or equal to date to")
                            .build());
        }

        List<String> validSections =
                List.of("dashboard", "dynamics", "statuses", "services", "employees", "noshow", "workload");
        for (String section : request.sections()) {
            if (!validSections.contains(section.toLowerCase())) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.<Void>builder()
                                .data(null)
                                .status(false)
                                .message("Invalid section: " + section + ". Valid sections: " + validSections)
                                .build());
            }
        }

        byte[] pdfBytes =
                pdfExportService.generateAnalyticsReport(request.dateFrom(), request.dateTo(), request.sections());

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDisposition(ContentDisposition.attachment()
                .filename("analytics_" + request.dateFrom() + "_" + request.dateTo() + ".pdf")
                .build());
        headers.setContentLength(pdfBytes.length);

        return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
    }

    private String getFullName(by.bsuir.mis.entity.Employee employee) {
        if (employee == null) return null;
        StringBuilder sb = new StringBuilder();
        sb.append(employee.getLastName()).append(" ").append(employee.getFirstName());
        if (employee.getMiddleName() != null && !employee.getMiddleName().isBlank()) {
            sb.append(" ").append(employee.getMiddleName());
        }
        return sb.toString();
    }
}
