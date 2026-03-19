package com.mixmaster.platform.interfaces.consumerweb.controllers;

import com.mixmaster.platform.interfaces.consumerweb.dtos.ConsumerExperienceStatusResponse;
import com.mixmaster.platform.interfaces.consumerweb.mappers.ConsumerExperienceStatusMapper;
import com.mixmaster.platform.interfaces.consumerweb.security.ConsumerWebApiPaths;
import com.mixmaster.platform.modules.platform.status.services.PlatformStatusService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(ConsumerWebApiPaths.PUBLIC_BASE_PATH)
public class ConsumerExperienceStatusController {

    private final PlatformStatusService platformStatusService;
    private final ConsumerExperienceStatusMapper consumerExperienceStatusMapper;

    public ConsumerExperienceStatusController(
        PlatformStatusService platformStatusService,
        ConsumerExperienceStatusMapper consumerExperienceStatusMapper
    ) {
        this.platformStatusService = platformStatusService;
        this.consumerExperienceStatusMapper = consumerExperienceStatusMapper;
    }

    @GetMapping("/status")
    public ConsumerExperienceStatusResponse status() {
        return consumerExperienceStatusMapper.toResponse(platformStatusService.capture("consumer-web"));
    }
}
