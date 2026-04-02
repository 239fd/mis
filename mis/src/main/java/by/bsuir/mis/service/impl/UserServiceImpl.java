package by.bsuir.mis.service.impl;

import by.bsuir.mis.entity.User;
import by.bsuir.mis.exception.BadRequestException;
import by.bsuir.mis.exception.ResourceNotFoundException;
import by.bsuir.mis.repository.AppointmentRepository;
import by.bsuir.mis.repository.EmployeeRepository;
import by.bsuir.mis.repository.UserPatientRepository;
import by.bsuir.mis.repository.UserRepository;
import by.bsuir.mis.service.EmployeeService;
import by.bsuir.mis.service.UserService;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final EmployeeService employeeService;
    private final UserPatientRepository userPatientRepository;
    private final AppointmentRepository appointmentRepository;

    @Override
    @Transactional
    public User save(User user) {
        return userRepository.save(user);
    }

    @Override
    public Optional<User> findById(UUID id) {
        return userRepository.findById(id);
    }

    @Override
    public Optional<User> findByLogin(String login) {
        return userRepository.findByLogin(login);
    }

    @Override
    public List<User> findAll() {
        return userRepository.findAll();
    }

    @Override
    public List<User> findAllActive() {
        return userRepository.findByIsActive(true);
    }

    @Override
    @Transactional
    public User update(User user) {
        if (!userRepository.existsById(user.getId())) {
            throw new ResourceNotFoundException("User", "id", user.getId());
        }
        return userRepository.save(user);
    }

    @Override
    @Transactional
    public void deleteById(UUID id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("User", "id", id);
        }

        // Проверяем, есть ли у связанного сотрудника записи на приём
        employeeRepository.findByUser_Id(id).ifPresent(employee -> {
            if (appointmentRepository.existsByEmployee_Id(employee.getId())) {
                throw new BadRequestException(
                        "Cannot delete user: the associated employee has appointments. Deactivate user instead.");
            }
            employeeService.deleteById(employee.getId());
        });

        // Проверяем, есть ли у связанных пациентов записи на приём
        var userPatients = userPatientRepository.findByUser_Id(id);
        for (var up : userPatients) {
            if (appointmentRepository.existsByPatient_Id(up.getPatient().getId())) {
                throw new BadRequestException(
                        "Cannot delete user: linked patients have appointments. Deactivate user instead.");
            }
        }

        userPatients.forEach(userPatient -> userPatientRepository.deleteById(userPatient.getId()));

        userRepository.deleteById(id);
    }

    @Override
    @Transactional
    public void deactivate(UUID id) {
        User user = userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        user.setIsActive(false);
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void activate(UUID id) {
        User user = userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        user.setIsActive(true);
        userRepository.save(user);
    }

    @Override
    public boolean existsByLogin(String login) {
        return userRepository.existsByLogin(login);
    }
}
