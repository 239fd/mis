package by.bsuir.mis.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record LoginRequest(
        @NotBlank(message = "Login is required")
        @Size(min = 3, max = 100, message = "Login must be between 3 and 100 characters")
        String login,

        @NotBlank(message = "Password is required")
        @Size(min = 6, max = 256, message = "Password must be between 6 and 256 characters")
        String password) {}
