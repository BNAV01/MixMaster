package com.mixmaster.platform.interfaces.tenantconsole.services;

import com.mixmaster.platform.interfaces.tenantconsole.audit.TenantConsoleAuditAction;
import com.mixmaster.platform.interfaces.tenantconsole.audit.TenantConsoleAuditService;
import com.mixmaster.platform.interfaces.tenantconsole.dtos.TenantConsoleStatusResponse;
import com.mixmaster.platform.interfaces.tenantconsole.mappers.TenantConsoleStatusMapper;
import com.mixmaster.platform.interfaces.tenantconsole.security.TenantConsoleApiPaths;
import com.mixmaster.platform.modules.platform.status.services.PlatformStatusService;
import com.mixmaster.platform.shared.tenant.TenantContext;
import com.mixmaster.platform.shared.tenant.TenantContextService;
import java.util.Map;
import java.util.Optional;
import org.springframework.stereotype.Service;

@Service
public class TenantOperationsStatusService {

    private final PlatformStatusService platformStatusService;
    private final TenantConsoleStatusMapper tenantConsoleStatusMapper;
    private final TenantConsoleAuditService tenantConsoleAuditService;
    private final TenantContextService tenantContextService;

    public TenantOperationsStatusService(
        PlatformStatusService platformStatusService,
        TenantConsoleStatusMapper tenantConsoleStatusMapper,
        TenantConsoleAuditService tenantConsoleAuditService,
        TenantContextService tenantContextService
    ) {
        this.platformStatusService = platformStatusService;
        this.tenantConsoleStatusMapper = tenantConsoleStatusMapper;
        this.tenantConsoleAuditService = tenantConsoleAuditService;
        this.tenantContextService = tenantContextService;
    }

    public TenantConsoleStatusResponse captureStatus() {
        tenantConsoleAuditService.record(
            TenantConsoleAuditAction.STATUS_VIEWED,
            Map.of("route", TenantConsoleApiPaths.ROOT + "/status")
        );

        Optional<TenantContext> tenantContext = tenantContextService.current();
        return tenantConsoleStatusMapper.toResponse(
            platformStatusService.capture("tenant-console"),
            tenantContext
        );
    }
}
