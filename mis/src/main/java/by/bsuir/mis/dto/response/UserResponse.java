package by.bsuir.mis.dto.response;

import java.time.LocalDateTime;
import java.util.UUID;

public record UserResponse(
        UUID id,
        String login,
        String email,
        String phone,
        Boolean isActive,
        RoleResponse role,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {}
