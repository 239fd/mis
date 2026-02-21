package by.bsuir.mis.repository;

import by.bsuir.mis.entity.ScheduleException;
import by.bsuir.mis.entity.enums.ExceptionType;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ScheduleExceptionRepository extends JpaRepository<ScheduleException, UUID> {

    List<ScheduleException> findByEmployee_Id(UUID employeeId);

    List<ScheduleException> findByEmployee_IdAndExceptionType(UUID employeeId, ExceptionType exceptionType);

    @Query("SELECT se FROM ScheduleException se WHERE " + "se.employee.id = :employeeId AND "
            + "se.dateFrom <= :date AND "
            + "se.dateTo >= :date")
    List<ScheduleException> findByEmployeeIdOnDate(@Param("employeeId") UUID employeeId, @Param("date") LocalDate date);

    @Query("SELECT se FROM ScheduleException se WHERE " + "se.employee.id = :employeeId AND "
            + "((se.dateFrom BETWEEN :startDate AND :endDate) OR "
            + "(se.dateTo BETWEEN :startDate AND :endDate) OR "
            + "(se.dateFrom <= :startDate AND se.dateTo >= :endDate))")
    List<ScheduleException> findByEmployeeIdInDateRange(
            @Param("employeeId") UUID employeeId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);
}
