package com.mixmaster.platform.shared.security;

import com.mixmaster.platform.modules.identity.auth.models.AuthSessionAudience;
import java.util.Set;

public record AuthenticatedActor(
    AuthSessionAudience audience,
    String userId,
    String displayName,
    String tenantId,
    String activeBranchId,
    Set<String> permissions,
    Set<String> roleCodes,
    Set<String> accessibleBranchIds
) {

    public boolean hasPermission(String permission) {
        return permissions.contains(permission);
    }
}
