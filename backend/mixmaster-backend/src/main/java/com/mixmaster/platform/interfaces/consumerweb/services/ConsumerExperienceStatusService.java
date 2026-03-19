package com.mixmaster.platform.interfaces.consumerweb.services;

import com.mixmaster.platform.interfaces.consumerweb.audit.ConsumerWebAuditAction;
import com.mixmaster.platform.interfaces.consumerweb.audit.ConsumerWebAuditService;
import com.mixmaster.platform.interfaces.consumerweb.dtos.ConsumerAccountStatusResponse;
import com.mixmaster.platform.interfaces.consumerweb.dtos.ConsumerExperienceStatusResponse;
import com.mixmaster.platform.interfaces.consumerweb.mappers.ConsumerAccountStatusMapper;
import com.mixmaster.platform.interfaces.consumerweb.mappers.ConsumerExperienceStatusMapper;
import com.mixmaster.platform.interfaces.consumerweb.security.ConsumerWebApiPaths;
import com.mixmaster.platform.modules.platform.status.services.PlatformStatusService;
import java.util.Map;
import org.springframework.stereotype.Service;

@Service
public class ConsumerExperienceStatusService {

    private final PlatformStatusService platformStatusService;
    private final ConsumerExperienceStatusMapper consumerExperienceStatusMapper;
    private final ConsumerAccountStatusMapper consumerAccountStatusMapper;
    private final ConsumerWebAuditService consumerWebAuditService;

    public ConsumerExperienceStatusService(
        PlatformStatusService platformStatusService,
        ConsumerExperienceStatusMapper consumerExperienceStatusMapper,
        ConsumerAccountStatusMapper consumerAccountStatusMapper,
        ConsumerWebAuditService consumerWebAuditService
    ) {
        this.platformStatusService = platformStatusService;
        this.consumerExperienceStatusMapper = consumerExperienceStatusMapper;
        this.consumerAccountStatusMapper = consumerAccountStatusMapper;
        this.consumerWebAuditService = consumerWebAuditService;
    }

    public ConsumerExperienceStatusResponse capturePublicStatus() {
        return consumerExperienceStatusMapper.toResponse(platformStatusService.capture("consumer-web"));
    }

    public ConsumerAccountStatusResponse captureAccountStatus(String principal) {
        consumerWebAuditService.record(
            ConsumerWebAuditAction.ACCOUNT_STATUS_VIEWED,
            Map.of("route", ConsumerWebApiPaths.ACCOUNT_BASE_PATH + "/status")
        );

        return consumerAccountStatusMapper.toResponse(
            platformStatusService.capture("consumer-web"),
            principal
        );
    }
}
