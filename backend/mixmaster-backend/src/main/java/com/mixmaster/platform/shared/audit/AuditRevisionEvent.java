package com.mixmaster.platform.shared.audit;

import java.time.OffsetDateTime;
import java.util.Map;

public record AuditRevisionEvent(
    String module,
    String action,
    String actor,
    String tenantKey,
    Map<String, String> metadata,
    OffsetDateTime occurredAt
) {
}
