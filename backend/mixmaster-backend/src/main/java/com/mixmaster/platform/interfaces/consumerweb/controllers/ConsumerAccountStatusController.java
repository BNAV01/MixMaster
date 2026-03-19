package com.mixmaster.platform.interfaces.consumerweb.controllers;

import com.mixmaster.platform.interfaces.consumerweb.dtos.ConsumerAccountStatusResponse;
import com.mixmaster.platform.interfaces.consumerweb.security.ConsumerWebApiPaths;
import com.mixmaster.platform.interfaces.consumerweb.services.ConsumerExperienceStatusService;
import java.security.Principal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(ConsumerWebApiPaths.ACCOUNT_BASE_PATH)
public class ConsumerAccountStatusController {

    private final ConsumerExperienceStatusService consumerExperienceStatusService;

    public ConsumerAccountStatusController(ConsumerExperienceStatusService consumerExperienceStatusService) {
        this.consumerExperienceStatusService = consumerExperienceStatusService;
    }

    @GetMapping("/status")
    public ConsumerAccountStatusResponse status(Principal principal) {
        return consumerExperienceStatusService.captureAccountStatus(principal.getName());
    }
}
