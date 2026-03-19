package com.mixmaster.platform.interfaces.tenantconsole.controllers;

import com.mixmaster.platform.interfaces.tenantconsole.dtos.TenantConsoleStatusResponse;
import com.mixmaster.platform.interfaces.tenantconsole.security.TenantConsoleApiPaths;
import com.mixmaster.platform.interfaces.tenantconsole.services.TenantOperationsStatusService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(TenantConsoleApiPaths.ROOT)
public class TenantOperationsStatusController {

    private final TenantOperationsStatusService tenantOperationsStatusService;

    public TenantOperationsStatusController(TenantOperationsStatusService tenantOperationsStatusService) {
        this.tenantOperationsStatusService = tenantOperationsStatusService;
    }

    @GetMapping("/status")
    public TenantConsoleStatusResponse status() {
        return tenantOperationsStatusService.captureStatus();
    }
}
