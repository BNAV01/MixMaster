package com.mixmaster.platform.interfaces.saasadmin.controllers;

import com.mixmaster.platform.interfaces.saasadmin.dtos.SaasAdminStatusResponse;
import com.mixmaster.platform.interfaces.saasadmin.mappers.SaasAdminStatusMapper;
import com.mixmaster.platform.interfaces.saasadmin.security.SaasAdminApiPaths;
import com.mixmaster.platform.modules.platform.status.services.PlatformStatusService;
import com.mixmaster.platform.shared.audit.AuditRevisionService;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(SaasAdminApiPaths.ROOT)
public class SaasAdminStatusController {

    private final PlatformStatusService platformStatusService;
    private final SaasAdminStatusMapper saasAdminStatusMapper;
    private final AuditRevisionService auditRevisionService;

    public SaasAdminStatusController(
        PlatformStatusService platformStatusService,
        SaasAdminStatusMapper saasAdminStatusMapper,
        AuditRevisionService auditRevisionService
    ) {
        this.platformStatusService = platformStatusService;
        this.saasAdminStatusMapper = saasAdminStatusMapper;
        this.auditRevisionService = auditRevisionService;
    }

    @GetMapping("/status")
    public SaasAdminStatusResponse status() {
        auditRevisionService.record(
            "saas-admin",
            "STATUS_VIEWED",
            Map.of("route", SaasAdminApiPaths.ROOT + "/status")
        );

        return saasAdminStatusMapper.toResponse(platformStatusService.capture("saas-admin"));
    }
}
