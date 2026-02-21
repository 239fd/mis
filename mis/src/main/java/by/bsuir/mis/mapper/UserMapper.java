package by.bsuir.mis.mapper;

import by.bsuir.mis.dto.response.UserResponse;
import by.bsuir.mis.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class UserMapper {

    private final RoleMapper roleMapper;

    public UserResponse toResponse(User user) {
        if (user == null) return null;
        return new UserResponse(
                user.getId(),
                user.getLogin(),
                user.getEmail(),
                user.getPhone(),
                user.getIsActive(),
                roleMapper.toResponse(user.getRole()),
                user.getCreatedAt(),
                user.getUpdatedAt());
    }
}
