package com.mixmaster.platform.interfaces.consumerweb.dtos;

import java.time.OffsetDateTime;
import java.util.List;

public record ConsumerExperienceStatusResponse(
    String audience,
    String application,
    String architecture,
    String multitenancy,
    List<String> activeProfiles,
    List<String> entryCapabilities,
    OffsetDateTime generatedAt
) {
}
