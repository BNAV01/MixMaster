package com.mixmaster.platform.modules.organization.services;

import com.mixmaster.platform.modules.organization.models.TenantStatus;
import java.time.LocalDateTime;

public record TenantOverview(
    String tenantId,
    String code,
    String name,
    TenantStatus status,
    String timezone,
    long brandCount,
    long branchCount,
    LocalDateTime createdAt
) {
}
