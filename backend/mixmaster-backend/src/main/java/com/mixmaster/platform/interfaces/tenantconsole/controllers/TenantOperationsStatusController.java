package com.mixmaster.platform.interfaces.tenantconsole.controllers;

import com.mixmaster.platform.interfaces.tenantconsole.dtos.TenantConsoleStatusResponse;
import com.mixmaster.platform.interfaces.tenantconsole.mappers.TenantConsoleStatusMapper;
import com.mixmaster.platform.interfaces.tenantconsole.security.TenantConsoleApiPaths;
import com.mixmaster.platform.modules.platform.status.services.PlatformStatusService;
import com.mixmaster.platform.shared.audit.AuditRevisionService;
import com.mixmaster.platform.shared.tenant.TenantContextHolder;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(TenantConsoleApiPaths.ROOT)
public class TenantOperationsStatusController {

    private final PlatformStatusService platformStatusService;
    private final TenantConsoleStatusMapper tenantConsoleStatusMapper;
    private final AuditRevisionService auditRevisionService;

    public TenantOperationsStatusController(
        PlatformStatusService platformStatusService,
        TenantConsoleStatusMapper tenantConsoleStatusMapper,
        AuditRevisionService auditRevisionService
    ) {
        this.platformStatusService = platformStatusService;
        this.tenantConsoleStatusMapper = tenantConsoleStatusMapper;
        this.auditRevisionService = auditRevisionService;
    }

    @GetMapping("/status")
    public TenantConsoleStatusResponse status() {
        auditRevisionService.record(
            "tenant-console",
            "STATUS_VIEWED",
            Map.of("route", TenantConsoleApiPaths.ROOT + "/status")
        );

        return tenantConsoleStatusMapper.toResponse(
            platformStatusService.capture("tenant-console"),
            TenantContextHolder.get()
        );
    }
}
