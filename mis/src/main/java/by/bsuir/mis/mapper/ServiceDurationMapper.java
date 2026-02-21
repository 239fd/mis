package by.bsuir.mis.mapper;

import by.bsuir.mis.dto.response.ServiceDurationResponse;
import by.bsuir.mis.entity.ServiceDuration;
import org.springframework.stereotype.Component;

@Component
public class ServiceDurationMapper {

    public ServiceDurationResponse toResponse(ServiceDuration duration) {
        if (duration == null) return null;
        return new ServiceDurationResponse(
                duration.getId(),
                duration.getService() != null ? duration.getService().getId() : null,
                duration.getService() != null ? duration.getService().getName() : null,
                duration.getDurationMin(),
                duration.getEffectiveFrom(),
                duration.getEffectiveTo(),
                duration.getCreatedAt());
    }
}
