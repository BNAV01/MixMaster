package com.mixmaster.platform.interfaces.consumerweb.controllers;

import com.mixmaster.platform.interfaces.consumerweb.dtos.ConsumerExperienceStatusResponse;
import com.mixmaster.platform.interfaces.consumerweb.security.ConsumerWebApiPaths;
import com.mixmaster.platform.interfaces.consumerweb.services.ConsumerExperienceStatusService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(ConsumerWebApiPaths.PUBLIC_BASE_PATH)
public class ConsumerExperienceStatusController {

    private final ConsumerExperienceStatusService consumerExperienceStatusService;

    public ConsumerExperienceStatusController(ConsumerExperienceStatusService consumerExperienceStatusService) {
        this.consumerExperienceStatusService = consumerExperienceStatusService;
    }

    @GetMapping("/status")
    public ConsumerExperienceStatusResponse status() {
        return consumerExperienceStatusService.capturePublicStatus();
    }
}
