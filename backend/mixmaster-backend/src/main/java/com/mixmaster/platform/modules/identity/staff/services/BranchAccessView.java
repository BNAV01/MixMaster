package com.mixmaster.platform.modules.identity.staff.services;

public record BranchAccessView(
    String branchId,
    String branchName,
    String brandId,
    String brandName,
    String timezone,
    String currencyCode
) {
}
