package com.mixmaster.platform.interfaces.saasadmin.services;

import com.mixmaster.platform.interfaces.saasadmin.audit.SaasAdminAuditAction;
import com.mixmaster.platform.interfaces.saasadmin.audit.SaasAdminAuditService;
import com.mixmaster.platform.interfaces.saasadmin.dtos.SaasAdminStatusResponse;
import com.mixmaster.platform.interfaces.saasadmin.mappers.SaasAdminStatusMapper;
import com.mixmaster.platform.interfaces.saasadmin.security.SaasAdminApiPaths;
import com.mixmaster.platform.modules.platform.status.services.PlatformStatusService;
import java.util.Map;
import org.springframework.stereotype.Service;

@Service
public class SaasAdminStatusService {

    private final PlatformStatusService platformStatusService;
    private final SaasAdminStatusMapper saasAdminStatusMapper;
    private final SaasAdminAuditService saasAdminAuditService;

    public SaasAdminStatusService(
        PlatformStatusService platformStatusService,
        SaasAdminStatusMapper saasAdminStatusMapper,
        SaasAdminAuditService saasAdminAuditService
    ) {
        this.platformStatusService = platformStatusService;
        this.saasAdminStatusMapper = saasAdminStatusMapper;
        this.saasAdminAuditService = saasAdminAuditService;
    }

    public SaasAdminStatusResponse captureStatus() {
        saasAdminAuditService.record(
            SaasAdminAuditAction.STATUS_VIEWED,
            Map.of("route", SaasAdminApiPaths.ROOT + "/status")
        );

        return saasAdminStatusMapper.toResponse(platformStatusService.capture("saas-admin"));
    }
}
