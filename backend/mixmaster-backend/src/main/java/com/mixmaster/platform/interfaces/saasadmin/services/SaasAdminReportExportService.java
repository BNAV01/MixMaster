package com.mixmaster.platform.interfaces.saasadmin.services;

import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

@Service
public class SaasAdminReportExportService {

    private static final DateTimeFormatter FILE_TS = DateTimeFormatter.ofPattern("yyyyMMdd-HHmm");

    private final SaasAdminWorkspaceService saasAdminWorkspaceService;

    public SaasAdminReportExportService(SaasAdminWorkspaceService saasAdminWorkspaceService) {
        this.saasAdminWorkspaceService = saasAdminWorkspaceService;
    }

    public byte[] exportTenantRegistryWorkbook() {
        SaasAdminWorkspaceService.WorkspaceSnapshot workspace = saasAdminWorkspaceService.captureWorkspace();
        try (XSSFWorkbook workbook = new XSSFWorkbook(); ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            CellStyle headerStyle = headerStyle(workbook);
            XSSFSheet sheet = workbook.createSheet("Tenants");
            String[] headers = {
                "Tenant ID",
                "Codigo",
                "Nombre",
                "Razon Social",
                "Estado",
                "Plan",
                "Suscripcion",
                "Onboarding",
                "Owner",
                "Legal Ready",
                "Score",
                "Inicio Act. Verificado",
                "Creado"
            };
            writeHeader(sheet.createRow(0), headers, headerStyle);

            int rowIndex = 1;
            for (SaasAdminWorkspaceService.TenantSnapshot tenant : saasAdminWorkspaceService.listTenants()) {
                Row row = sheet.createRow(rowIndex++);
                row.createCell(0).setCellValue(tenant.tenantId());
                row.createCell(1).setCellValue(tenant.code());
                row.createCell(2).setCellValue(tenant.name());
                row.createCell(3).setCellValue(tenant.legalName());
                row.createCell(4).setCellValue(tenant.status().name());
                row.createCell(5).setCellValue(tenant.subscriptionPlanCode());
                row.createCell(6).setCellValue(tenant.subscriptionStatus().name());
                row.createCell(7).setCellValue(tenant.onboardingStage().name());
                row.createCell(8).setCellValue(nullSafe(tenant.ownerEmail()));
                row.createCell(9).setCellValue(tenant.legalReady() ? "YES" : "NO");
                row.createCell(10).setCellValue(tenant.readinessScore());
                row.createCell(11).setCellValue(tenant.siiStartActivitiesVerified() ? "YES" : "NO");
                row.createCell(12).setCellValue(String.valueOf(tenant.createdAt()));
            }
            autosize(sheet, headers.length);

            XSSFSheet overviewSheet = workbook.createSheet("Overview");
            Row titleRow = overviewSheet.createRow(0);
            titleRow.createCell(0).setCellValue("MixMaster SaaS Admin Registry");
            Row generatedRow = overviewSheet.createRow(1);
            generatedRow.createCell(0).setCellValue("Generated at");
            generatedRow.createCell(1).setCellValue(OffsetDateTime.now().toString());

            int overviewRowIndex = 3;
            overviewRowIndex = writeKeyValue(overviewSheet, overviewRowIndex, "Total tenants", String.valueOf(workspace.overview().totalTenants()));
            overviewRowIndex = writeKeyValue(overviewSheet, overviewRowIndex, "Tenants activos", String.valueOf(workspace.overview().activeTenants()));
            overviewRowIndex = writeKeyValue(overviewSheet, overviewRowIndex, "Trials", String.valueOf(workspace.overview().trialTenants()));
            overviewRowIndex = writeKeyValue(overviewSheet, overviewRowIndex, "Listos legalmente", String.valueOf(workspace.overview().legalReadyTenants()));
            overviewRowIndex = writeKeyValue(overviewSheet, overviewRowIndex, "Inicio act. verificado", String.valueOf(workspace.overview().siiVerifiedTenants()));
            autosize(overviewSheet, 2);

            workbook.write(outputStream);
            return outputStream.toByteArray();
        } catch (IOException exception) {
            throw new IllegalStateException("Could not generate tenant registry workbook", exception);
        }
    }

    public byte[] exportTenantWorkbook(String tenantId, String reportTitle) {
        SaasAdminWorkspaceService.TenantDetailSnapshot tenant = saasAdminWorkspaceService.requireTenantDetail(tenantId);
        try (XSSFWorkbook workbook = new XSSFWorkbook(); ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            CellStyle headerStyle = headerStyle(workbook);

            XSSFSheet summarySheet = workbook.createSheet("Resumen");
            int rowIndex = 0;
            rowIndex = writeKeyValue(summarySheet, rowIndex, "Reporte", reportTitle);
            rowIndex = writeKeyValue(summarySheet, rowIndex, "Generado", OffsetDateTime.now().toString());
            rowIndex = writeKeyValue(summarySheet, rowIndex, "Tenant", tenant.name());
            rowIndex = writeKeyValue(summarySheet, rowIndex, "Codigo", tenant.code());
            rowIndex = writeKeyValue(summarySheet, rowIndex, "Razon social", tenant.legalName());
            rowIndex = writeKeyValue(summarySheet, rowIndex, "RUT", nullSafe(tenant.taxId()));
            rowIndex = writeKeyValue(summarySheet, rowIndex, "Plan", tenant.subscriptionPlanCode());
            rowIndex = writeKeyValue(summarySheet, rowIndex, "Suscripcion", tenant.subscriptionStatus().name());
            rowIndex = writeKeyValue(summarySheet, rowIndex, "Onboarding", tenant.onboardingStage().name());
            rowIndex = writeKeyValue(summarySheet, rowIndex, "Readiness", String.valueOf(tenant.readinessScore()));
            rowIndex = writeKeyValue(summarySheet, rowIndex, "Inicio act. verificado", tenant.siiStartActivitiesVerified() ? "YES" : "NO");
            autosize(summarySheet, 2);

            XSSFSheet legalSheet = workbook.createSheet("Perfil Tributario");
            int legalRowIndex = 0;
            legalRowIndex = writeKeyValue(legalSheet, legalRowIndex, "Correo facturacion", nullSafe(tenant.billingEmail()));
            legalRowIndex = writeKeyValue(legalSheet, legalRowIndex, "Telefono facturacion", nullSafe(tenant.billingPhone()));
            legalRowIndex = writeKeyValue(legalSheet, legalRowIndex, "Actividad economica", nullSafe(tenant.economicActivity()));
            legalRowIndex = writeKeyValue(legalSheet, legalRowIndex, "Codigo actividad SII", nullSafe(tenant.siiActivityCode()));
            legalRowIndex = writeKeyValue(legalSheet, legalRowIndex, "Domicilio tributario", nullSafe(tenant.taxAddress()));
            legalRowIndex = writeKeyValue(legalSheet, legalRowIndex, "Comuna tributaria", nullSafe(tenant.taxCommune()));
            legalRowIndex = writeKeyValue(legalSheet, legalRowIndex, "Ciudad tributaria", nullSafe(tenant.taxCity()));
            legalRowIndex = writeKeyValue(legalSheet, legalRowIndex, "Representante legal", nullSafe(tenant.legalRepresentativeName()));
            legalRowIndex = writeKeyValue(legalSheet, legalRowIndex, "RUT representante", nullSafe(tenant.legalRepresentativeTaxId()));
            autosize(legalSheet, 2);

            XSSFSheet branchSheet = workbook.createSheet("Sucursales");
            String[] branchHeaders = {"Sucursal", "Codigo", "Timezone", "Moneda", "Direccion", "Comuna", "Ciudad", "Activa"};
            writeHeader(branchSheet.createRow(0), branchHeaders, headerStyle);
            int branchRowIndex = 1;
            for (SaasAdminWorkspaceService.TenantBranchSnapshot branch : tenant.branches()) {
                Row row = branchSheet.createRow(branchRowIndex++);
                row.createCell(0).setCellValue(branch.name());
                row.createCell(1).setCellValue(branch.code());
                row.createCell(2).setCellValue(branch.timezone());
                row.createCell(3).setCellValue(branch.currencyCode());
                row.createCell(4).setCellValue(nullSafe(branch.addressLine1()));
                row.createCell(5).setCellValue(nullSafe(branch.commune()));
                row.createCell(6).setCellValue(nullSafe(branch.city()));
                row.createCell(7).setCellValue(branch.active() ? "YES" : "NO");
            }
            autosize(branchSheet, branchHeaders.length);

            XSSFSheet checklistSheet = workbook.createSheet("Checklist");
            String[] checklistHeaders = {"Item", "Estado"};
            writeHeader(checklistSheet.createRow(0), checklistHeaders, headerStyle);
            int checklistRowIndex = 1;
            if (tenant.missingComplianceItems().isEmpty()) {
                Row row = checklistSheet.createRow(checklistRowIndex);
                row.createCell(0).setCellValue("Pack legal completo");
                row.createCell(1).setCellValue("OK");
            } else {
                for (String missingItem : tenant.missingComplianceItems()) {
                    Row row = checklistSheet.createRow(checklistRowIndex++);
                    row.createCell(0).setCellValue(missingItem);
                    row.createCell(1).setCellValue("PENDIENTE");
                }
            }
            autosize(checklistSheet, checklistHeaders.length);

            workbook.write(outputStream);
            return outputStream.toByteArray();
        } catch (IOException exception) {
            throw new IllegalStateException("Could not generate tenant workbook", exception);
        }
    }

    public byte[] exportTenantPdf(String tenantId, String reportTitle) {
        SaasAdminWorkspaceService.TenantDetailSnapshot tenant = saasAdminWorkspaceService.requireTenantDetail(tenantId);
        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            Document document = new Document();
            PdfWriter.getInstance(document, outputStream);
            document.open();

            document.add(new Paragraph(reportTitle, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16)));
            document.add(new Paragraph("Generado: " + OffsetDateTime.now()));
            document.add(new Paragraph("Tenant: " + tenant.name() + " (" + tenant.code() + ")"));
            document.add(new Paragraph("Razon social: " + tenant.legalName()));
            document.add(new Paragraph("RUT: " + nullSafe(tenant.taxId())));
            document.add(new Paragraph("Plan: " + tenant.subscriptionPlanCode()));
            document.add(new Paragraph("Suscripcion: " + tenant.subscriptionStatus().name()));
            document.add(new Paragraph("Onboarding: " + tenant.onboardingStage().name()));
            document.add(new Paragraph("Readiness: " + tenant.readinessScore() + "/100"));
            document.add(new Paragraph(" "));

            document.add(new Paragraph("Perfil tributario", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 13)));
            PdfPTable legalTable = new PdfPTable(2);
            legalTable.setWidthPercentage(100);
            addPdfRow(legalTable, "Correo facturacion", nullSafe(tenant.billingEmail()));
            addPdfRow(legalTable, "Telefono facturacion", nullSafe(tenant.billingPhone()));
            addPdfRow(legalTable, "Actividad economica", nullSafe(tenant.economicActivity()));
            addPdfRow(legalTable, "Codigo actividad SII", nullSafe(tenant.siiActivityCode()));
            addPdfRow(legalTable, "Domicilio tributario", nullSafe(tenant.taxAddress()));
            addPdfRow(legalTable, "Comuna tributaria", nullSafe(tenant.taxCommune()));
            addPdfRow(legalTable, "Ciudad tributaria", nullSafe(tenant.taxCity()));
            addPdfRow(legalTable, "Representante legal", nullSafe(tenant.legalRepresentativeName()));
            addPdfRow(legalTable, "RUT representante", nullSafe(tenant.legalRepresentativeTaxId()));
            addPdfRow(legalTable, "Inicio act. verificado", tenant.siiStartActivitiesVerified() ? "YES" : "NO");
            document.add(legalTable);

            document.add(new Paragraph(" "));
            document.add(new Paragraph("Sucursales", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 13)));
            PdfPTable branchTable = new PdfPTable(4);
            branchTable.setWidthPercentage(100);
            addPdfHeader(branchTable, "Sucursal");
            addPdfHeader(branchTable, "Codigo");
            addPdfHeader(branchTable, "Direccion");
            addPdfHeader(branchTable, "Comuna/Ciudad");
            for (SaasAdminWorkspaceService.TenantBranchSnapshot branch : tenant.branches()) {
                branchTable.addCell(new Phrase(branch.name()));
                branchTable.addCell(new Phrase(branch.code()));
                branchTable.addCell(new Phrase(nullSafe(branch.addressLine1())));
                branchTable.addCell(new Phrase((nullSafe(branch.commune()) + " / " + nullSafe(branch.city())).trim()));
            }
            document.add(branchTable);

            document.add(new Paragraph(" "));
            document.add(new Paragraph("Checklist de brechas", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 13)));
            if (tenant.missingComplianceItems().isEmpty()) {
                document.add(new Paragraph("Sin brechas pendientes."));
            } else {
                for (String missingItem : tenant.missingComplianceItems()) {
                    document.add(new Paragraph("- " + missingItem));
                }
            }

            document.close();
            return outputStream.toByteArray();
        } catch (DocumentException | IOException exception) {
            throw new IllegalStateException("Could not generate tenant PDF report", exception);
        }
    }

    public String exportFileName(String prefix, String extension) {
        return prefix + "-" + OffsetDateTime.now().format(FILE_TS) + "." + extension;
    }

    private CellStyle headerStyle(XSSFWorkbook workbook) {
        CellStyle style = workbook.createCellStyle();
        style.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        return style;
    }

    private void writeHeader(Row row, String[] headers, CellStyle style) {
        for (int index = 0; index < headers.length; index++) {
            Cell cell = row.createCell(index);
            cell.setCellValue(headers[index]);
            cell.setCellStyle(style);
        }
    }

    private int writeKeyValue(XSSFSheet sheet, int rowIndex, String key, String value) {
        Row row = sheet.createRow(rowIndex);
        row.createCell(0).setCellValue(key);
        row.createCell(1).setCellValue(value);
        return rowIndex + 1;
    }

    private void autosize(XSSFSheet sheet, int columnCount) {
        for (int index = 0; index < columnCount; index++) {
            sheet.autoSizeColumn(index);
        }
    }

    private void addPdfHeader(PdfPTable table, String label) {
        PdfPCell cell = new PdfPCell(new Phrase(label, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10)));
        table.addCell(cell);
    }

    private void addPdfRow(PdfPTable table, String label, String value) {
        table.addCell(new Phrase(label, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10)));
        table.addCell(new Phrase(value));
    }

    private String nullSafe(String value) {
        return value == null ? "" : value;
    }
}
