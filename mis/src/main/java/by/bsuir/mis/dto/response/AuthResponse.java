package by.bsuir.mis.dto.response;

import java.util.UUID;

public record AuthResponse(
        String accessToken,
        String refreshToken,
        String tokenType,
        UUID userId,
        String login,
        String role,
        Long expiresIn) {
    public AuthResponse(
            String accessToken, String refreshToken, UUID userId, String login, String role, Long expiresIn) {
        this(accessToken, refreshToken, "Bearer", userId, login, role, expiresIn);
    }
}
