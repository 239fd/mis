package by.bsuir.mis.dto.response;

import java.time.LocalDate;
import java.util.UUID;

public record PatientShortResponse(UUID id, String fullName, LocalDate birthDate, String phone) {}
