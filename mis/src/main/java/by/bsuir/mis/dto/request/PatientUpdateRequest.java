package by.bsuir.mis.dto.request;

import by.bsuir.mis.entity.enums.Gender;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record PatientUpdateRequest(
        @Size(max = 100, message = "Last name must not exceed 100 characters")
        String lastName,

        @Size(max = 100, message = "First name must not exceed 100 characters")
        String firstName,

        @Size(max = 100, message = "Middle name must not exceed 100 characters")
        String middleName,

        Gender gender,

        LocalDate birthDate,

        @Size(max = 10, message = "Passport series must not exceed 10 characters")
        String passportSeries,

        @Size(max = 20, message = "Passport number must not exceed 20 characters")
        String passportNumber,

        @Size(max = 20, message = "Phone must not exceed 20 characters")
        String phone,

        @Email(message = "Invalid email format") @Size(max = 150, message = "Email must not exceed 150 characters")
        String email,

        @Size(max = 500, message = "Address must not exceed 500 characters")
        String address) {}
