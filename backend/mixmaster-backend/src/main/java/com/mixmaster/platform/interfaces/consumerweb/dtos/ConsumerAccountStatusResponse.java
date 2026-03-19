package com.mixmaster.platform.interfaces.consumerweb.dtos;

import java.time.OffsetDateTime;
import java.util.List;

public record ConsumerAccountStatusResponse(
    String audience,
    String securityMode,
    List<String> activeProfiles,
    String principal,
    List<String> accountCapabilities,
    OffsetDateTime generatedAt
) {
}
