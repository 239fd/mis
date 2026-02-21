package by.bsuir.mis.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ServiceRequest(
        @NotBlank(message = "Name is required") @Size(max = 250, message = "Name must not exceed 250 characters")
        String name,

        @Size(max = 500, message = "Description must not exceed 500 characters")
        String description,

        Boolean isActive) {}
