package com.mixmaster.platform.interfaces.saasadmin.dtos;

import java.time.OffsetDateTime;
import java.util.List;

public record SaasAdminStatusResponse(
    String audience,
    String securityMode,
    List<String> activeProfiles,
    List<String> platformCapabilities,
    OffsetDateTime generatedAt
) {
}
