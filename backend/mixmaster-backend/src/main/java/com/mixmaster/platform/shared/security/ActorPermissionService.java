package com.mixmaster.platform.shared.security;

import com.mixmaster.platform.modules.identity.auth.models.AuthSessionAudience;
import java.util.Arrays;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

@Service
public class ActorPermissionService {

    private final CurrentActorService currentActorService;

    public ActorPermissionService(CurrentActorService currentActorService) {
        this.currentActorService = currentActorService;
    }

    public AuthenticatedActor requirePlatformPermission(String permission) {
        AuthenticatedActor actor = requireAudience(AuthSessionAudience.PLATFORM);
        requirePermission(actor, permission);
        return actor;
    }

    public AuthenticatedActor requirePlatformActor() {
        return requireAudience(AuthSessionAudience.PLATFORM);
    }

    public AuthenticatedActor requirePlatformAnyPermission(String... permissions) {
        AuthenticatedActor actor = requireAudience(AuthSessionAudience.PLATFORM);
        boolean allowed = Arrays.stream(permissions).anyMatch(actor.permissions()::contains);

        if (!allowed) {
            throw new AccessDeniedException("Missing any of the required platform permissions");
        }

        return actor;
    }

    public AuthenticatedActor requireTenantPermission(String permission) {
        AuthenticatedActor actor = requireAudience(AuthSessionAudience.STAFF);
        requirePermission(actor, permission);
        return actor;
    }

    public AuthenticatedActor requireTenantActor() {
        return requireAudience(AuthSessionAudience.STAFF);
    }

    public AuthenticatedActor requireTenantAnyPermission(String... permissions) {
        AuthenticatedActor actor = requireAudience(AuthSessionAudience.STAFF);
        boolean allowed = Arrays.stream(permissions).anyMatch(actor.permissions()::contains);

        if (!allowed) {
            throw new AccessDeniedException("Missing any of the required permissions");
        }

        return actor;
    }

    public void requireBranchAccess(AuthenticatedActor actor, String branchId) {
        if (branchId == null || branchId.isBlank()) {
            return;
        }

        if (!actor.accessibleBranchIds().contains(branchId)) {
            throw new AccessDeniedException("Branch access is not granted for the current actor");
        }
    }

    private AuthenticatedActor requireAudience(AuthSessionAudience audience) {
        AuthenticatedActor actor = currentActorService.require();

        if (actor.audience() != audience) {
            throw new AccessDeniedException("The current actor cannot access this audience");
        }

        return actor;
    }

    private void requirePermission(AuthenticatedActor actor, String permission) {
        if (!actor.hasPermission(permission)) {
            throw new AccessDeniedException("Missing required permission " + permission);
        }
    }
}
