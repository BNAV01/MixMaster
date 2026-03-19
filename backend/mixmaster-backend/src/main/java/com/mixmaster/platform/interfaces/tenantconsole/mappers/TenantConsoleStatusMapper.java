package com.mixmaster.platform.interfaces.tenantconsole.mappers;

import com.mixmaster.platform.interfaces.tenantconsole.dtos.TenantConsoleStatusResponse;
import com.mixmaster.platform.modules.platform.status.models.PlatformStatusSnapshot;
import com.mixmaster.platform.shared.tenant.TenantContext;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.stereotype.Component;

@Component
public class TenantConsoleStatusMapper {

    public TenantConsoleStatusResponse toResponse(
        PlatformStatusSnapshot snapshot,
        Optional<TenantContext> tenantContext
    ) {
        Map<String, String> requestedContext = tenantContext
            .map(context -> Map.of(
                "tenantKey", safeValue(context.tenantKey()),
                "brandKey", safeValue(context.brandKey()),
                "branchKey", safeValue(context.branchKey())
            ))
            .orElseGet(Map::of);

        return new TenantConsoleStatusResponse(
            snapshot.audience(),
            snapshot.securityMode(),
            snapshot.activeProfiles(),
            Map.of(
                "tenantHeader", snapshot.tenantHeaderName(),
                "brandHeader", snapshot.brandHeaderName(),
                "branchHeader", snapshot.branchHeaderName()
            ),
            requestedContext,
            List.of(
                "menu-draft-publication",
                "realtime-availability",
                "campaign-operations",
                "branch-ops-analytics"
            ),
            snapshot.generatedAt()
        );
    }

    private String safeValue(String value) {
        return value == null ? "" : value;
    }
}
