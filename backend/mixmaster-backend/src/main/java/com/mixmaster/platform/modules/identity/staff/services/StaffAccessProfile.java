package com.mixmaster.platform.modules.identity.staff.services;

import java.util.List;
import java.util.Set;

public record StaffAccessProfile(
    Set<String> permissions,
    Set<String> roleCodes,
    List<BranchAccessView> accessibleBranches,
    String defaultBranchId
) {
}
