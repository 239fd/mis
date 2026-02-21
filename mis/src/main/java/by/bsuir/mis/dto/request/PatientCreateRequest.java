package by.bsuir.mis.dto.request;

import by.bsuir.mis.entity.enums.Gender;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record PatientCreateRequest(
        @NotBlank(message = "Last name is required")
        @Size(max = 100, message = "Last name must not exceed 100 characters")
        String lastName,

        @NotBlank(message = "First name is required")
        @Size(max = 100, message = "First name must not exceed 100 characters")
        String firstName,

        @Size(max = 100, message = "Middle name must not exceed 100 characters")
        String middleName,

        @NotNull(message = "Gender is required") Gender gender,

        @NotNull(message = "Birth date is required") LocalDate birthDate,

        @NotBlank(message = "Passport series is required")
        @Size(max = 10, message = "Passport series must not exceed 10 characters")
        String passportSeries,

        @NotBlank(message = "Passport number is required")
        @Size(max = 20, message = "Passport number must not exceed 20 characters")
        String passportNumber,

        @Size(max = 20, message = "Phone must not exceed 20 characters")
        String phone,

        @Email(message = "Invalid email format") @Size(max = 150, message = "Email must not exceed 150 characters")
        String email,

        @Size(max = 500, message = "Address must not exceed 500 characters")
        String address) {}
