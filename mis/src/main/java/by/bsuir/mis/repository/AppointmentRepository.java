package by.bsuir.mis.repository;

import by.bsuir.mis.entity.Appointment;
import by.bsuir.mis.entity.enums.AppointmentSource;
import by.bsuir.mis.entity.enums.AppointmentStatus;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {

    List<Appointment> findByPatient_Id(UUID patientId);

    List<Appointment> findByEmployee_Id(UUID employeeId);

    List<Appointment> findByAppointmentDate(LocalDate appointmentDate);

    List<Appointment> findByStatus(AppointmentStatus status);

    List<Appointment> findBySource(AppointmentSource source);

    List<Appointment> findByEmployee_IdAndAppointmentDate(UUID employeeId, LocalDate appointmentDate);

    List<Appointment> findByPatient_IdAndAppointmentDate(UUID patientId, LocalDate appointmentDate);

    List<Appointment> findByEmployee_IdAndStatus(UUID employeeId, AppointmentStatus status);

    List<Appointment> findByPatient_IdAndStatus(UUID patientId, AppointmentStatus status);

    @Query("SELECT a FROM Appointment a WHERE " + "a.employee.id = :employeeId AND "
            + "a.appointmentDate = :date AND "
            + "a.status NOT IN ('CANCELLED', 'RESCHEDULED') AND "
            + "((a.startTime < :endTime AND a.endTime > :startTime))")
    List<Appointment> findOverlappingAppointments(
            @Param("employeeId") UUID employeeId,
            @Param("date") LocalDate date,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime);

    @Query("SELECT a FROM Appointment a WHERE " + "a.patient.id = :patientId AND "
            + "a.status IN ('WAITING', 'IN_PROGRESS') AND "
            + "a.appointmentDate >= :fromDate "
            + "ORDER BY a.appointmentDate, a.startTime")
    List<Appointment> findUpcomingByPatient(@Param("patientId") UUID patientId, @Param("fromDate") LocalDate fromDate);

    @Query("SELECT a FROM Appointment a WHERE " + "a.employee.id = :employeeId AND "
            + "a.appointmentDate BETWEEN :startDate AND :endDate "
            + "ORDER BY a.appointmentDate, a.startTime")
    List<Appointment> findByEmployeeIdAndDateRange(
            @Param("employeeId") UUID employeeId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT a FROM Appointment a WHERE " + "a.patient.id = :patientId AND "
            + "a.appointmentDate BETWEEN :startDate AND :endDate "
            + "ORDER BY a.appointmentDate, a.startTime")
    List<Appointment> findByPatientIdAndDateRange(
            @Param("patientId") UUID patientId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);
}
