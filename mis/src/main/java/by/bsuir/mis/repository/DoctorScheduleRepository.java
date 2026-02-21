package by.bsuir.mis.repository;

import by.bsuir.mis.entity.DoctorSchedule;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface DoctorScheduleRepository extends JpaRepository<DoctorSchedule, UUID> {

    List<DoctorSchedule> findByEmployee_Id(UUID employeeId);

    List<DoctorSchedule> findByEmployee_IdAndDayOfWeek(UUID employeeId, Integer dayOfWeek);

    @Query("SELECT ds FROM DoctorSchedule ds WHERE " + "ds.employee.id = :employeeId AND "
            + "ds.dayOfWeek = :dayOfWeek AND "
            + "ds.effectiveFrom <= :date AND "
            + "(ds.effectiveTo IS NULL OR ds.effectiveTo >= :date)")
    List<DoctorSchedule> findActiveByEmployeeAndDayOnDate(
            @Param("employeeId") UUID employeeId, @Param("dayOfWeek") Integer dayOfWeek, @Param("date") LocalDate date);

    @Query("SELECT ds FROM DoctorSchedule ds WHERE " + "ds.employee.id = :employeeId AND "
            + "ds.effectiveFrom <= :date AND "
            + "(ds.effectiveTo IS NULL OR ds.effectiveTo >= :date)")
    List<DoctorSchedule> findActiveByEmployeeOnDate(
            @Param("employeeId") UUID employeeId, @Param("date") LocalDate date);
}
