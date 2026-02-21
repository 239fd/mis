package by.bsuir.mis.mapper;

import by.bsuir.mis.dto.response.ServiceResponse;
import by.bsuir.mis.entity.Service;
import by.bsuir.mis.entity.ServiceDuration;
import by.bsuir.mis.repository.ServiceDurationRepository;
import java.time.LocalDate;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class ServiceMapper {

    private final ServiceDurationRepository serviceDurationRepository;

    public ServiceResponse toResponse(Service service) {
        if (service == null) return null;

        LocalDate today = LocalDate.now();
        Optional<ServiceDuration> durationOpt =
                serviceDurationRepository.findActiveByServiceIdOnDate(service.getId(), today);

        Integer currentDuration =
                durationOpt.map(ServiceDuration::getDurationMin).orElse(null);

        log.debug(
                "Service '{}' (id={}): date={}, duration found={}, value={}",
                service.getName(),
                service.getId(),
                today,
                durationOpt.isPresent(),
                currentDuration);

        return new ServiceResponse(
                service.getId(),
                service.getName(),
                service.getDescription(),
                service.getIsActive(),
                currentDuration,
                service.getCreatedAt());
    }
}
