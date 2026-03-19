package com.mixmaster.platform.interfaces.saasadmin.controllers;

import com.mixmaster.platform.interfaces.saasadmin.dtos.SaasAdminStatusResponse;
import com.mixmaster.platform.interfaces.saasadmin.security.SaasAdminApiPaths;
import com.mixmaster.platform.interfaces.saasadmin.services.SaasAdminStatusService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(SaasAdminApiPaths.ROOT)
public class SaasAdminStatusController {

    private final SaasAdminStatusService saasAdminStatusService;

    public SaasAdminStatusController(SaasAdminStatusService saasAdminStatusService) {
        this.saasAdminStatusService = saasAdminStatusService;
    }

    @GetMapping("/status")
    public SaasAdminStatusResponse status() {
        return saasAdminStatusService.captureStatus();
    }
}
