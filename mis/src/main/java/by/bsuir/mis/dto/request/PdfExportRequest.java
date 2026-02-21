package by.bsuir.mis.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;

public record PdfExportRequest(
        @NotNull(message = "Date from is required") LocalDate dateFrom,

        @NotNull(message = "Date to is required") LocalDate dateTo,

        @NotEmpty(message = "At least one section is required")
        List<String> sections) {}
