package com.mixmaster.platform.modules.platform.status.services;

import com.mixmaster.platform.modules.platform.status.models.PlatformStatusSnapshot;
import com.mixmaster.platform.shared.config.ApplicationProperties;
import java.time.OffsetDateTime;
import java.util.Arrays;
import java.util.List;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;

@Service
public class PlatformStatusService {

    private final Environment environment;
    private final ApplicationProperties applicationProperties;

    public PlatformStatusService(Environment environment, ApplicationProperties applicationProperties) {
        this.environment = environment;
        this.applicationProperties = applicationProperties;
    }

    public PlatformStatusSnapshot capture(String audience) {
        String[] activeProfiles = environment.getActiveProfiles();
        List<String> profiles = activeProfiles.length == 0
            ? List.of(environment.getDefaultProfiles())
            : Arrays.asList(activeProfiles);

        return new PlatformStatusSnapshot(
            audience,
            "mixmaster-backend",
            "modular-monolith",
            "shared-schema",
            resolveSecurityMode(),
            profiles,
            applicationProperties.getTenant().getHeaderName(),
            applicationProperties.getTenant().getBrandHeaderName(),
            applicationProperties.getTenant().getBranchHeaderName(),
            OffsetDateTime.now()
        );
    }

    private String resolveSecurityMode() {
        if (applicationProperties.getSecurity().getToken().isEnabled()) {
            return "token-prepared";
        }

        if (applicationProperties.getSecurity().getBootstrap().isEnabled()) {
            return "bootstrap-basic-auth";
        }

        return "prepared-for-db-backed-auth";
    }
}
