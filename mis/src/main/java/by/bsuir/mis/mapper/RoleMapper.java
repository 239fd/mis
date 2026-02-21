package by.bsuir.mis.mapper;

import by.bsuir.mis.dto.response.RoleResponse;
import by.bsuir.mis.entity.Role;
import org.springframework.stereotype.Component;

@Component
public class RoleMapper {

    public RoleResponse toResponse(Role role) {
        if (role == null) return null;
        return new RoleResponse(role.getId(), role.getName(), role.getDescription(), role.getCreatedAt());
    }
}
