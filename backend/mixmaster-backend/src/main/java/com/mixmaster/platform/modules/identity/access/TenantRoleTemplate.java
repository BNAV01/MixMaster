package com.mixmaster.platform.modules.identity.access;

import java.util.Set;

public record TenantRoleTemplate(
    String code,
    String name,
    String description,
    Set<String> permissions
) {
}
