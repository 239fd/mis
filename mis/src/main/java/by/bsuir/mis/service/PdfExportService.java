package by.bsuir.mis.service;

import by.bsuir.mis.entity.Appointment;
import by.bsuir.mis.entity.DoctorSchedule;
import by.bsuir.mis.entity.Employee;
import by.bsuir.mis.entity.enums.AppointmentStatus;
import by.bsuir.mis.repository.EmployeeRepository;
import by.bsuir.mis.repository.PatientRepository;
import com.itextpdf.io.font.PdfEncodings;
import com.itextpdf.io.image.ImageDataFactory;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.font.PdfFontFactory.EmbeddingStrategy;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.*;
import com.itextpdf.layout.properties.HorizontalAlignment;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import java.awt.Color;
import java.awt.Font;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.jfree.chart.ChartFactory;
import org.jfree.chart.ChartUtils;
import org.jfree.chart.JFreeChart;
import org.jfree.chart.plot.CategoryPlot;
import org.jfree.chart.plot.PiePlot;
import org.jfree.chart.plot.PlotOrientation;
import org.jfree.chart.renderer.category.BarRenderer;
import org.jfree.data.category.DefaultCategoryDataset;
import org.jfree.data.general.DefaultPieDataset;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PdfExportService {

    private final AppointmentService appointmentService;
    private final EmployeeRepository employeeRepository;
    private final PatientRepository patientRepository;
    private final DoctorScheduleService doctorScheduleService;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd.MM.yyyy");
    private static final DateTimeFormatter DATETIME_FORMATTER = DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm");

    private PdfFont font;
    private PdfFont fontBold;

    public byte[] generateAnalyticsReport(LocalDate dateFrom, LocalDate dateTo, List<String> sections) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdfDoc = new PdfDocument(writer);
            Document document = new Document(pdfDoc, PageSize.A4);
            document.setMargins(40, 40, 40, 40);

            initFonts();
            document.setFont(font);

            addHeader(document, dateFrom, dateTo);

            for (String section : sections) {
                switch (section.toLowerCase()) {
                    case "dashboard" -> addDashboardSection(document);
                    case "dynamics" -> addDynamicsSection(document, dateFrom, dateTo);
                    case "statuses" -> addStatusesSection(document, dateFrom, dateTo);
                    case "services" -> addServicesSection(document, dateFrom, dateTo);
                    case "employees" -> addEmployeesSection(document, dateFrom, dateTo);
                    case "noshow" -> addNoShowSection(document, dateFrom, dateTo);
                    case "workload" -> addWorkloadSection(document);
                }
            }

            addFooter(document);

            document.close();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate PDF report", e);
        }
    }

    private void initFonts() throws IOException {
        String fontPath = "C:/Windows/Fonts/arial.ttf";
        String fontBoldPath = "C:/Windows/Fonts/arialbd.ttf";

        try {
            font = PdfFontFactory.createFont(fontPath, PdfEncodings.IDENTITY_H, EmbeddingStrategy.PREFER_EMBEDDED);
            fontBold =
                    PdfFontFactory.createFont(fontBoldPath, PdfEncodings.IDENTITY_H, EmbeddingStrategy.PREFER_EMBEDDED);
        } catch (Exception e) {
            try {
                font = PdfFontFactory.createFont(
                        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
                        PdfEncodings.IDENTITY_H,
                        EmbeddingStrategy.PREFER_EMBEDDED);
                fontBold = PdfFontFactory.createFont(
                        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
                        PdfEncodings.IDENTITY_H,
                        EmbeddingStrategy.PREFER_EMBEDDED);
            } catch (Exception e2) {
                font = PdfFontFactory.createFont();
                fontBold = PdfFontFactory.createFont();
            }
        }
    }

    private void addHeader(Document document, LocalDate dateFrom, LocalDate dateTo) {
        Paragraph title = new Paragraph("Аналитический отчёт МИС")
                .setFont(fontBold)
                .setFontSize(24)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(10);
        document.add(title);

        Paragraph period = new Paragraph(
                        "Период: " + dateFrom.format(DATE_FORMATTER) + " - " + dateTo.format(DATE_FORMATTER))
                .setFont(font)
                .setFontSize(12)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(5);
        document.add(period);

        Paragraph generated = new Paragraph(
                        "Дата формирования: " + LocalDateTime.now().format(DATETIME_FORMATTER))
                .setFont(font)
                .setFontSize(10)
                .setTextAlignment(TextAlignment.CENTER)
                .setFontColor(ColorConstants.GRAY)
                .setMarginBottom(30);
        document.add(generated);

        document.add(new LineSeparator(new com.itextpdf.kernel.pdf.canvas.draw.SolidLine(1)).setMarginBottom(20));
    }

    private void addDashboardSection(Document document) {
        addSectionTitle(document, "1. Общая статистика");

        long totalPatients = patientRepository.count();
        long totalEmployees = employeeRepository.count();
        long activeEmployees = employeeRepository.findByIsActive(true).size();
        List<Appointment> todayAppointments = appointmentService.findByDate(LocalDate.now());

        Table table = new Table(UnitValue.createPercentArray(new float[] {60, 40}))
                .setWidth(UnitValue.createPercentValue(80))
                .setHorizontalAlignment(HorizontalAlignment.CENTER);

        addTableRow(table, "Всего пациентов в системе", String.valueOf(totalPatients));
        addTableRow(table, "Записей сегодня", String.valueOf(todayAppointments.size()));
        addTableRow(table, "Активных врачей", String.valueOf(activeEmployees));
        addTableRow(table, "Всего врачей", String.valueOf(totalEmployees));

        document.add(table);
        document.add(new Paragraph().setMarginBottom(20));
    }

    private void addDynamicsSection(Document document, LocalDate dateFrom, LocalDate dateTo) {
        addSectionTitle(document, "2. Динамика записей за период");

        Map<LocalDate, Long> appointmentsByDate = new LinkedHashMap<>();
        LocalDate current = dateFrom;
        long total = 0;

        while (!current.isAfter(dateTo)) {
            long count = appointmentService.findByDate(current).size();
            appointmentsByDate.put(current, count);
            total += count;
            current = current.plusDays(1);
        }

        long days = appointmentsByDate.size();
        double average = days > 0 ? (double) total / days : 0;

        Table statsTable = new Table(UnitValue.createPercentArray(new float[] {60, 40}))
                .setWidth(UnitValue.createPercentValue(60))
                .setHorizontalAlignment(HorizontalAlignment.CENTER);

        addTableRow(statsTable, "Общее количество записей", String.valueOf(total));
        addTableRow(statsTable, "Среднее записей в день", String.format("%.1f", average));

        document.add(statsTable);
        document.add(new Paragraph().setMarginBottom(10));

        try {
            byte[] chartImage = createLineChart(appointmentsByDate, "Записи по дням", "Дата", "Количество");
            Image image = new Image(ImageDataFactory.create(chartImage))
                    .setWidth(UnitValue.createPercentValue(90))
                    .setHorizontalAlignment(HorizontalAlignment.CENTER);
            document.add(image);
        } catch (IOException e) {
            document.add(
                    new Paragraph("Не удалось создать график").setFont(font).setFontColor(ColorConstants.RED));
        }

        document.add(new Paragraph().setMarginBottom(20));
    }

    private void addStatusesSection(Document document, LocalDate dateFrom, LocalDate dateTo) {
        addSectionTitle(document, "3. Распределение по статусам");

        List<Appointment> appointments = getAppointmentsForPeriod(dateFrom, dateTo);

        Map<AppointmentStatus, Long> statusCounts =
                appointments.stream().collect(Collectors.groupingBy(Appointment::getStatus, Collectors.counting()));

        Table table = new Table(UnitValue.createPercentArray(new float[] {50, 30, 20}))
                .setWidth(UnitValue.createPercentValue(80))
                .setHorizontalAlignment(HorizontalAlignment.CENTER);

        addTableHeader(table, "Статус", "Количество", "%");

        long total = appointments.size();
        Map<String, String> statusNames = Map.of(
                "WAITING", "Ожидание",
                "IN_PROGRESS", "На приёме",
                "COMPLETED", "Завершено",
                "NO_SHOW", "Неявка",
                "CANCELLED", "Отменено",
                "RESCHEDULED", "Перенесено");

        for (AppointmentStatus status : AppointmentStatus.values()) {
            long count = statusCounts.getOrDefault(status, 0L);
            double percent = total > 0 ? (double) count / total * 100 : 0;
            table.addCell(createCell(statusNames.getOrDefault(status.name(), status.name())));
            table.addCell(createCell(String.valueOf(count)));
            table.addCell(createCell(String.format("%.1f%%", percent)));
        }

        document.add(table);
        document.add(new Paragraph().setMarginBottom(10));

        try {
            Map<String, Long> chartData = new LinkedHashMap<>();
            for (AppointmentStatus status : AppointmentStatus.values()) {
                long count = statusCounts.getOrDefault(status, 0L);
                if (count > 0) {
                    chartData.put(statusNames.getOrDefault(status.name(), status.name()), count);
                }
            }
            byte[] chartImage = createPieChart(chartData, "Распределение по статусам");
            Image image = new Image(ImageDataFactory.create(chartImage))
                    .setWidth(UnitValue.createPercentValue(60))
                    .setHorizontalAlignment(HorizontalAlignment.CENTER);
            document.add(image);
        } catch (IOException e) {
            document.add(
                    new Paragraph("Не удалось создать диаграмму").setFont(font).setFontColor(ColorConstants.RED));
        }

        document.add(new Paragraph().setMarginBottom(20));
    }

    private void addServicesSection(Document document, LocalDate dateFrom, LocalDate dateTo) {
        addSectionTitle(document, "4. Популярность услуг");

        List<Appointment> appointments = getAppointmentsForPeriod(dateFrom, dateTo);

        Map<String, Long> serviceCounts = appointments.stream()
                .filter(a -> a.getService() != null)
                .collect(Collectors.groupingBy(a -> a.getService().getName(), Collectors.counting()));

        Table table = new Table(UnitValue.createPercentArray(new float[] {60, 20, 20}))
                .setWidth(UnitValue.createPercentValue(90))
                .setHorizontalAlignment(HorizontalAlignment.CENTER);

        addTableHeader(table, "Услуга", "Записей", "%");

        long total = appointments.stream().filter(a -> a.getService() != null).count();

        serviceCounts.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .forEach(entry -> {
                    double percent = total > 0 ? (double) entry.getValue() / total * 100 : 0;
                    table.addCell(createCell(entry.getKey()));
                    table.addCell(createCell(String.valueOf(entry.getValue())));
                    table.addCell(createCell(String.format("%.1f%%", percent)));
                });

        document.add(table);
        document.add(new Paragraph().setMarginBottom(10));

        try {
            byte[] chartImage = createPieChart(serviceCounts, "Распределение по услугам");
            Image image = new Image(ImageDataFactory.create(chartImage))
                    .setWidth(UnitValue.createPercentValue(60))
                    .setHorizontalAlignment(HorizontalAlignment.CENTER);
            document.add(image);
        } catch (IOException e) {
            document.add(
                    new Paragraph("Не удалось создать диаграмму").setFont(font).setFontColor(ColorConstants.RED));
        }

        document.add(new Paragraph().setMarginBottom(20));
    }

    private void addEmployeesSection(Document document, LocalDate dateFrom, LocalDate dateTo) {
        addSectionTitle(document, "5. Нагрузка по врачам");

        List<Appointment> appointments = getAppointmentsForPeriod(dateFrom, dateTo);

        Map<UUID, List<Appointment>> byEmployee = appointments.stream()
                .filter(a -> a.getEmployee() != null)
                .collect(Collectors.groupingBy(a -> a.getEmployee().getId()));

        Table table = new Table(UnitValue.createPercentArray(new float[] {40, 35, 25}))
                .setWidth(UnitValue.createPercentValue(95))
                .setHorizontalAlignment(HorizontalAlignment.CENTER);

        addTableHeader(table, "Врач", "Специальность", "Приёмов");

        Map<String, Long> employeeCounts = new LinkedHashMap<>();

        byEmployee.entrySet().stream()
                .sorted((a, b) ->
                        Integer.compare(b.getValue().size(), a.getValue().size()))
                .forEach(entry -> {
                    Employee emp = entry.getValue().getFirst().getEmployee();
                    String fullName = getFullName(emp);
                    String specialty =
                            emp.getSpecialty() != null ? emp.getSpecialty().getName() : "-";

                    table.addCell(createCell(fullName));
                    table.addCell(createCell(specialty));
                    table.addCell(createCell(String.valueOf(entry.getValue().size())));

                    employeeCounts.put(fullName, (long) entry.getValue().size());
                });

        document.add(table);
        document.add(new Paragraph().setMarginBottom(10));

        try {
            byte[] chartImage = createHorizontalBarChart(employeeCounts, "Нагрузка по врачам", "Приёмов");
            Image image = new Image(ImageDataFactory.create(chartImage))
                    .setWidth(UnitValue.createPercentValue(90))
                    .setHorizontalAlignment(HorizontalAlignment.CENTER);
            document.add(image);
        } catch (IOException e) {
            document.add(
                    new Paragraph("Не удалось создать диаграмму").setFont(font).setFontColor(ColorConstants.RED));
        }

        document.add(new Paragraph().setMarginBottom(20));
    }

    private void addNoShowSection(Document document, LocalDate dateFrom, LocalDate dateTo) {
        addSectionTitle(document, "6. Показатель неявок");

        List<Appointment> appointments = getAppointmentsForPeriod(dateFrom, dateTo);

        long total = appointments.size();
        long noShow = appointments.stream()
                .filter(a -> a.getStatus() == AppointmentStatus.NO_SHOW)
                .count();

        double noShowRate = total > 0 ? (double) noShow / total * 100 : 0;

        DeviceRgb rateColor;
        if (noShowRate <= 5) {
            rateColor = new DeviceRgb(40, 167, 69);
        } else if (noShowRate <= 10) {
            rateColor = new DeviceRgb(255, 193, 7);
        } else {
            rateColor = new DeviceRgb(220, 53, 69);
        }

        Paragraph rateParagraph = new Paragraph(String.format("%.1f%%", noShowRate))
                .setFont(fontBold)
                .setFontSize(48)
                .setFontColor(rateColor)
                .setTextAlignment(TextAlignment.CENTER);
        document.add(rateParagraph);

        Paragraph rateLabel = new Paragraph("процент неявок")
                .setFont(font)
                .setFontSize(14)
                .setFontColor(ColorConstants.GRAY)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(20);
        document.add(rateLabel);

        Table table = new Table(UnitValue.createPercentArray(new float[] {60, 40}))
                .setWidth(UnitValue.createPercentValue(50))
                .setHorizontalAlignment(HorizontalAlignment.CENTER);

        addTableRow(table, "Всего записей за период", String.valueOf(total));
        addTableRow(table, "Количество неявок", String.valueOf(noShow));

        document.add(table);
        document.add(new Paragraph().setMarginBottom(20));
    }

    private void addWorkloadSection(Document document) {
        addSectionTitle(document, "7. Загрузка сегодня");

        LocalDate today = LocalDate.now();
        List<Appointment> todayAppointments = appointmentService.findByDate(today);

        Map<UUID, List<Appointment>> byEmployee = todayAppointments.stream()
                .filter(a -> a.getEmployee() != null)
                .collect(Collectors.groupingBy(a -> a.getEmployee().getId()));

        int totalSlots = 0;
        int totalOccupied = 0;

        List<Map<String, Object>> employeeWorkloads = new ArrayList<>();

        for (var entry : byEmployee.entrySet()) {
            Employee emp = entry.getValue().getFirst().getEmployee();
            List<DoctorSchedule> schedules = doctorScheduleService.findByEmployeeIdAndDayOfWeek(
                    emp.getId(), today.getDayOfWeek().getValue());

            int slots = 0;
            for (DoctorSchedule schedule : schedules) {
                long minutes = ChronoUnit.MINUTES.between(schedule.getStartTime(), schedule.getEndTime());
                slots += (int) (minutes / 30);
            }

            int occupied = entry.getValue().size();
            int free = Math.max(0, slots - occupied);
            double loadPercent = slots > 0 ? (double) occupied / slots * 100 : 0;

            totalSlots += slots;
            totalOccupied += occupied;

            Map<String, Object> workload = new HashMap<>();
            workload.put("name", getFullName(emp));
            workload.put("slots", slots);
            workload.put("occupied", occupied);
            workload.put("free", free);
            workload.put("loadPercent", loadPercent);
            employeeWorkloads.add(workload);
        }

        int totalFree = Math.max(0, totalSlots - totalOccupied);
        double avgLoad = totalSlots > 0 ? (double) totalOccupied / totalSlots * 100 : 0;

        Table summaryTable = new Table(UnitValue.createPercentArray(new float[] {25, 25, 25, 25}))
                .setWidth(UnitValue.createPercentValue(90))
                .setHorizontalAlignment(HorizontalAlignment.CENTER);

        summaryTable.addHeaderCell(createHeaderCell("Всего слотов"));
        summaryTable.addHeaderCell(createHeaderCell("Занято"));
        summaryTable.addHeaderCell(createHeaderCell("Свободно"));
        summaryTable.addHeaderCell(createHeaderCell("Средняя загрузка"));

        summaryTable.addCell(createCell(String.valueOf(totalSlots)));
        summaryTable.addCell(createCell(String.valueOf(totalOccupied)));
        summaryTable.addCell(createCell(String.valueOf(totalFree)));
        summaryTable.addCell(createCell(String.format("%.1f%%", avgLoad)));

        document.add(summaryTable);
        document.add(new Paragraph().setMarginBottom(15));

        if (!employeeWorkloads.isEmpty()) {
            Table detailTable = new Table(UnitValue.createPercentArray(new float[] {35, 15, 15, 15, 20}))
                    .setWidth(UnitValue.createPercentValue(95))
                    .setHorizontalAlignment(HorizontalAlignment.CENTER);

            addTableHeader(detailTable, "Врач", "Слоты", "Занято", "Свободно", "Загрузка");

            for (Map<String, Object> workload : employeeWorkloads) {
                detailTable.addCell(createCell((String) workload.get("name")));
                detailTable.addCell(createCell(String.valueOf(workload.get("slots"))));
                detailTable.addCell(createCell(String.valueOf(workload.get("occupied"))));
                detailTable.addCell(createCell(String.valueOf(workload.get("free"))));
                detailTable.addCell(createCell(String.format("%.1f%%", (Double) workload.get("loadPercent"))));
            }

            document.add(detailTable);
        }

        document.add(new Paragraph().setMarginBottom(20));
    }

    private void addFooter(Document document) {
        document.add(new LineSeparator(new com.itextpdf.kernel.pdf.canvas.draw.SolidLine(1)).setMarginTop(20));

        Paragraph footer = new Paragraph("Сформировано системой МИС")
                .setFont(font)
                .setFontSize(9)
                .setFontColor(ColorConstants.GRAY)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginTop(10);
        document.add(footer);
    }

    private void addSectionTitle(Document document, String title) {
        Paragraph sectionTitle = new Paragraph(title)
                .setFont(fontBold)
                .setFontSize(16)
                .setMarginTop(15)
                .setMarginBottom(10);
        document.add(sectionTitle);
    }

    private void addTableRow(Table table, String label, String value) {
        table.addCell(createCell(label));
        table.addCell(createCell(value).setTextAlignment(TextAlignment.RIGHT));
    }

    private void addTableHeader(Table table, String... headers) {
        for (String header : headers) {
            table.addHeaderCell(createHeaderCell(header));
        }
    }

    private Cell createCell(String content) {
        return new Cell()
                .add(new Paragraph(content).setFont(font))
                .setPadding(5)
                .setBorder(new com.itextpdf.layout.borders.SolidBorder(ColorConstants.LIGHT_GRAY, 0.5f));
    }

    private Cell createHeaderCell(String content) {
        return new Cell()
                .add(new Paragraph(content).setFont(fontBold))
                .setBackgroundColor(new DeviceRgb(52, 58, 64))
                .setFontColor(ColorConstants.WHITE)
                .setPadding(8)
                .setTextAlignment(TextAlignment.CENTER);
    }

    private List<Appointment> getAppointmentsForPeriod(LocalDate dateFrom, LocalDate dateTo) {
        List<Appointment> appointments = new ArrayList<>();
        LocalDate current = dateFrom;
        while (!current.isAfter(dateTo)) {
            appointments.addAll(appointmentService.findByDate(current));
            current = current.plusDays(1);
        }
        return appointments;
    }

    private String getFullName(Employee employee) {
        if (employee == null) return "-";
        StringBuilder sb = new StringBuilder();
        sb.append(employee.getLastName()).append(" ").append(employee.getFirstName());
        if (employee.getMiddleName() != null && !employee.getMiddleName().isBlank()) {
            sb.append(" ").append(employee.getMiddleName());
        }
        return sb.toString();
    }

    private Font getChartFont() {
        return new Font("Arial", Font.PLAIN, 12);
    }

    private Font getChartTitleFont() {
        return new Font("Arial", Font.BOLD, 14);
    }

    private byte[] createLineChart(Map<LocalDate, Long> data, String title, String xLabel, String yLabel)
            throws IOException {
        DefaultCategoryDataset dataset = new DefaultCategoryDataset();

        for (Map.Entry<LocalDate, Long> entry : data.entrySet()) {
            dataset.addValue(entry.getValue(), "Записи", entry.getKey().format(DateTimeFormatter.ofPattern("dd.MM")));
        }

        JFreeChart chart = ChartFactory.createLineChart(
                title, xLabel, yLabel, dataset, PlotOrientation.VERTICAL, false, true, false);

        chart.setBackgroundPaint(Color.WHITE);
        chart.getTitle().setFont(getChartTitleFont());

        CategoryPlot plot = chart.getCategoryPlot();
        plot.setBackgroundPaint(Color.WHITE);
        plot.setRangeGridlinePaint(Color.LIGHT_GRAY);
        plot.getDomainAxis().setTickLabelFont(getChartFont());
        plot.getDomainAxis().setLabelFont(getChartFont());
        plot.getRangeAxis().setTickLabelFont(getChartFont());
        plot.getRangeAxis().setLabelFont(getChartFont());

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ChartUtils.writeChartAsPNG(baos, chart, 600, 300);
        return baos.toByteArray();
    }

    private byte[] createPieChart(Map<String, Long> data, String title) throws IOException {
        DefaultPieDataset<String> dataset = new DefaultPieDataset<>();

        for (Map.Entry<String, Long> entry : data.entrySet()) {
            dataset.setValue(entry.getKey(), entry.getValue());
        }

        JFreeChart chart = ChartFactory.createPieChart(title, dataset, true, true, false);
        chart.setBackgroundPaint(Color.WHITE);
        chart.getTitle().setFont(getChartTitleFont());
        chart.getLegend().setItemFont(getChartFont());

        PiePlot<?> plot = (PiePlot<?>) chart.getPlot();
        plot.setBackgroundPaint(Color.WHITE);
        plot.setOutlinePaint(null);
        plot.setShadowPaint(null);
        plot.setLabelFont(getChartFont());

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ChartUtils.writeChartAsPNG(baos, chart, 400, 300);
        return baos.toByteArray();
    }

    private byte[] createHorizontalBarChart(Map<String, Long> data, String title, String valueLabel)
            throws IOException {
        DefaultCategoryDataset dataset = new DefaultCategoryDataset();

        for (Map.Entry<String, Long> entry : data.entrySet()) {
            dataset.addValue(entry.getValue(), valueLabel, entry.getKey());
        }

        JFreeChart chart = ChartFactory.createBarChart(
                title, "", valueLabel, dataset, PlotOrientation.HORIZONTAL, false, true, false);

        chart.setBackgroundPaint(Color.WHITE);
        chart.getTitle().setFont(getChartTitleFont());

        CategoryPlot plot = chart.getCategoryPlot();
        plot.setBackgroundPaint(Color.WHITE);
        plot.setRangeGridlinePaint(Color.LIGHT_GRAY);
        plot.getDomainAxis().setTickLabelFont(getChartFont());
        plot.getDomainAxis().setLabelFont(getChartFont());
        plot.getRangeAxis().setTickLabelFont(getChartFont());
        plot.getRangeAxis().setLabelFont(getChartFont());

        BarRenderer renderer = (BarRenderer) plot.getRenderer();
        renderer.setSeriesPaint(0, new Color(0, 123, 255));

        int height = Math.max(300, data.size() * 40);
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ChartUtils.writeChartAsPNG(baos, chart, 600, height);
        return baos.toByteArray();
    }
}
