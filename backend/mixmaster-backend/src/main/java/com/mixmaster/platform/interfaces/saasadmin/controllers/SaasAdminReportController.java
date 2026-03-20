package com.mixmaster.platform.interfaces.saasadmin.controllers;

import com.mixmaster.platform.interfaces.saasadmin.security.SaasAdminApiPaths;
import com.mixmaster.platform.interfaces.saasadmin.services.SaasAdminReportExportService;
import com.mixmaster.platform.shared.security.ActorPermissionService;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(SaasAdminApiPaths.ROOT + "/reports")
public class SaasAdminReportController {

    private final ActorPermissionService actorPermissionService;
    private final SaasAdminReportExportService saasAdminReportExportService;

    public SaasAdminReportController(
        ActorPermissionService actorPermissionService,
        SaasAdminReportExportService saasAdminReportExportService
    ) {
        this.actorPermissionService = actorPermissionService;
        this.saasAdminReportExportService = saasAdminReportExportService;
    }

    @GetMapping("/exports/tenant-registry.xlsx")
    public ResponseEntity<ByteArrayResource> exportTenantRegistryWorkbook() {
        actorPermissionService.requirePlatformPermission("platform.reports.export");
        return fileResponse(
            saasAdminReportExportService.exportTenantRegistryWorkbook(),
            saasAdminReportExportService.exportFileName("tenant-registry", "xlsx"),
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
    }

    @GetMapping("/tenants/{tenantId}/sii-readiness.xlsx")
    public ResponseEntity<ByteArrayResource> exportTenantReadinessWorkbook(@PathVariable String tenantId) {
        actorPermissionService.requirePlatformPermission("platform.reports.export");
        return fileResponse(
            saasAdminReportExportService.exportTenantWorkbook(tenantId, "Pack readiness SII 2026"),
            saasAdminReportExportService.exportFileName("sii-readiness-" + tenantId, "xlsx"),
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
    }

    @GetMapping("/tenants/{tenantId}/sii-readiness.pdf")
    public ResponseEntity<ByteArrayResource> exportTenantReadinessPdf(@PathVariable String tenantId) {
        actorPermissionService.requirePlatformPermission("platform.reports.export");
        return fileResponse(
            saasAdminReportExportService.exportTenantPdf(tenantId, "Pack readiness SII 2026"),
            saasAdminReportExportService.exportFileName("sii-readiness-" + tenantId, "pdf"),
            MediaType.APPLICATION_PDF_VALUE
        );
    }

    @GetMapping("/tenants/{tenantId}/f29-support.xlsx")
    public ResponseEntity<ByteArrayResource> exportTenantF29Workbook(@PathVariable String tenantId) {
        actorPermissionService.requirePlatformPermission("platform.reports.export");
        return fileResponse(
            saasAdminReportExportService.exportTenantWorkbook(tenantId, "Workbook de soporte F29"),
            saasAdminReportExportService.exportFileName("f29-support-" + tenantId, "xlsx"),
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
    }

    @GetMapping("/tenants/{tenantId}/f29-support.pdf")
    public ResponseEntity<ByteArrayResource> exportTenantF29Pdf(@PathVariable String tenantId) {
        actorPermissionService.requirePlatformPermission("platform.reports.export");
        return fileResponse(
            saasAdminReportExportService.exportTenantPdf(tenantId, "Workbook de soporte F29"),
            saasAdminReportExportService.exportFileName("f29-support-" + tenantId, "pdf"),
            MediaType.APPLICATION_PDF_VALUE
        );
    }

    private ResponseEntity<ByteArrayResource> fileResponse(byte[] bytes, String filename, String contentType) {
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
            .contentType(MediaType.parseMediaType(contentType))
            .contentLength(bytes.length)
            .body(new ByteArrayResource(bytes));
    }
}
