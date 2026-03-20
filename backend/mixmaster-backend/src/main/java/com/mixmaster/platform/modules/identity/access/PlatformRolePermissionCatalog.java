package com.mixmaster.platform.modules.identity.access;

import com.mixmaster.platform.modules.identity.platform.models.PlatformUserRole;
import java.util.Set;

public final class PlatformRolePermissionCatalog {

    private PlatformRolePermissionCatalog() {
    }

    public static Set<String> permissionsFor(PlatformUserRole role) {
        return switch (role) {
            case SAAS_SUPER_ADMIN -> Set.of(
                PermissionCatalog.PLATFORM_TENANTS_READ,
                PermissionCatalog.PLATFORM_TENANTS_WRITE,
                PermissionCatalog.PLATFORM_USERS_READ,
                PermissionCatalog.PLATFORM_USERS_WRITE,
                PermissionCatalog.PLATFORM_ONBOARDING_READ,
                PermissionCatalog.PLATFORM_ONBOARDING_WRITE,
                PermissionCatalog.PLATFORM_BILLING_READ,
                PermissionCatalog.PLATFORM_BILLING_WRITE,
                PermissionCatalog.PLATFORM_SUPPORT_READ,
                PermissionCatalog.PLATFORM_SUPPORT_WRITE,
                PermissionCatalog.PLATFORM_FLAGS_READ,
                PermissionCatalog.PLATFORM_FLAGS_WRITE,
                PermissionCatalog.PLATFORM_REPORTS_READ,
                PermissionCatalog.PLATFORM_REPORTS_EXPORT,
                PermissionCatalog.PLATFORM_COMMUNICATIONS_READ,
                PermissionCatalog.PLATFORM_COMMUNICATIONS_WRITE
            );
            case SAAS_SUPPORT -> Set.of(
                PermissionCatalog.PLATFORM_TENANTS_READ,
                PermissionCatalog.PLATFORM_ONBOARDING_READ,
                PermissionCatalog.PLATFORM_BILLING_READ,
                PermissionCatalog.PLATFORM_SUPPORT_READ,
                PermissionCatalog.PLATFORM_SUPPORT_WRITE,
                PermissionCatalog.PLATFORM_FLAGS_READ,
                PermissionCatalog.PLATFORM_REPORTS_READ,
                PermissionCatalog.PLATFORM_COMMUNICATIONS_READ
            );
        };
    }
}
