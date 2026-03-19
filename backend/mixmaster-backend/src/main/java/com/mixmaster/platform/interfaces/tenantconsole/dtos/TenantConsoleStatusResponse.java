package com.mixmaster.platform.interfaces.tenantconsole.dtos;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

public record TenantConsoleStatusResponse(
    String audience,
    String securityMode,
    List<String> activeProfiles,
    Map<String, String> expectedTenantHeaders,
    Map<String, String> requestedTenantContext,
    List<String> operationCapabilities,
    OffsetDateTime generatedAt
) {
}
