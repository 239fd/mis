package by.bsuir.mis.service;

import by.bsuir.mis.entity.Employee;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EmployeeService {

    Employee save(Employee employee);

    Optional<Employee> findById(UUID id);

    Optional<Employee> findByUserId(UUID userId);

    List<Employee> findAll();

    List<Employee> findAllActive();

    List<Employee> findBySpecialtyId(UUID specialtyId);

    Employee update(Employee employee);

    void deleteById(UUID id);

    void deactivate(UUID id);

    void activate(UUID id);
}
