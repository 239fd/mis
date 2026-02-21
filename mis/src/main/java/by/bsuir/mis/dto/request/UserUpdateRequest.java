package by.bsuir.mis.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import java.util.UUID;

public record UserUpdateRequest(
        @Size(min = 6, max = 256, message = "Password must be between 6 and 256 characters")
        String password,

        @Email(message = "Invalid email format") @Size(max = 150, message = "Email must not exceed 150 characters")
        String email,

        @Size(max = 20, message = "Phone must not exceed 20 characters")
        String phone,

        UUID roleId,

        Boolean isActive) {}
