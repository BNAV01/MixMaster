package com.mixmaster.platform.shared.tenant;

public record TenantContext(
    String tenantKey,
    String brandKey,
    String branchKey
) {
}
