package com.mixmaster.platform.modules.platform.status.models;

import java.time.OffsetDateTime;
import java.util.List;

public record PlatformStatusSnapshot(
    String audience,
    String application,
    String architecture,
    String multitenancy,
    String securityMode,
    List<String> activeProfiles,
    String tenantHeaderName,
    String brandHeaderName,
    String branchHeaderName,
    OffsetDateTime generatedAt
) {
}
