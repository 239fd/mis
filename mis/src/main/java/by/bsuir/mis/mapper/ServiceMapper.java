package by.bsuir.mis.mapper;

import by.bsuir.mis.dto.response.ServiceResponse;
import by.bsuir.mis.entity.Service;
import by.bsuir.mis.entity.ServiceDuration;
import by.bsuir.mis.repository.ServiceDurationRepository;
import java.time.LocalDate;
import java.util.List;
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
        List<ServiceDuration> activeDurations =
                serviceDurationRepository.findActiveByServiceIdOnDate(service.getId(), today);

        Integer currentDuration = activeDurations.isEmpty()
                ? null
                : activeDurations.getFirst().getDurationMin();

        log.debug(
                "Service '{}' (id={}): date={}, duration found={}, value={}",
                service.getName(),
                service.getId(),
                today,
                !activeDurations.isEmpty(),
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
