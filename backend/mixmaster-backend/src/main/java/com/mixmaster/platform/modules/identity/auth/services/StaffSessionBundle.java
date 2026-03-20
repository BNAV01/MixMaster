package com.mixmaster.platform.modules.identity.auth.services;

import com.mixmaster.platform.modules.identity.staff.models.StaffUser;
import com.mixmaster.platform.modules.identity.staff.services.StaffAccessProfile;
import com.mixmaster.platform.modules.organization.models.Tenant;

public record StaffSessionBundle(
    AuthTokens tokens,
    StaffUser user,
    Tenant tenant,
    StaffAccessProfile accessProfile,
    String activeBranchId
) {
}
