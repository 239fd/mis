package by.bsuir.mis.dto.response;

import java.util.UUID;

public record EmployeeShortResponse(UUID id, String fullName, String position, String specialtyName) {}
