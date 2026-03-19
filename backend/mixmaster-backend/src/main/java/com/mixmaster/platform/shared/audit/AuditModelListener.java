package com.mixmaster.platform.shared.audit;

import java.time.OffsetDateTime;
import java.util.Map;
import org.springframework.stereotype.Component;

@Component
public class AuditModelListener {

    public AuditRevisionEvent onChange(
        String module,
        String action,
        String actor,
        String tenantKey,
        Map<String, String> metadata
    ) {
        return new AuditRevisionEvent(
            module,
            action,
            actor,
            tenantKey,
            metadata,
            OffsetDateTime.now()
        );
    }
}
