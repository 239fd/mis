package by.bsuir.mis.repository;

import by.bsuir.mis.entity.Employee;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, UUID> {

    Optional<Employee> findByUser_Id(UUID userId);

    List<Employee> findBySpecialty_Id(UUID specialtyId);

    List<Employee> findByIsActive(Boolean isActive);

    List<Employee> findBySpecialty_IdAndIsActive(UUID specialtyId, Boolean isActive);

    @Query("SELECT e FROM Employee e WHERE " + "LOWER(e.lastName) LIKE LOWER(CONCAT('%', :term, '%')) OR "
            + "LOWER(e.firstName) LIKE LOWER(CONCAT('%', :term, '%')) OR "
            + "LOWER(e.middleName) LIKE LOWER(CONCAT('%', :term, '%'))")
    List<Employee> searchByName(@Param("term") String term);

    List<Employee> findByPosition(String position);

    boolean existsByUser_Id(UUID userId);
}
