package com.mixmaster.platform.shared.tenant;

import java.util.Optional;
import org.springframework.stereotype.Service;

@Service
public class TenantContextService {

    public Optional<TenantContext> current() {
        return TenantContextHolder.get();
    }

    public TenantContext require() {
        return current().orElseThrow(() -> new TenantContextMissingException(
            "Tenant context is required for this operation"
        ));
    }

    public String requireTenantKey() {
        return require().tenantKey();
    }

    public Optional<String> currentTenantKey() {
        return current().map(TenantContext::tenantKey);
    }

    public Optional<String> currentBrandKey() {
        return current().map(TenantContext::brandKey);
    }

    public Optional<String> currentBranchKey() {
        return current().map(TenantContext::branchKey);
    }
}
