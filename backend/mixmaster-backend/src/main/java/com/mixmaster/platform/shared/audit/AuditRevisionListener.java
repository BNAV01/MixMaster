package com.mixmaster.platform.shared.audit;

import java.util.UUID;
import org.springframework.stereotype.Component;

@Component
public class AuditRevisionListener {

    public AuditRevision toRevision(AuditRevisionEvent event) {
        return new AuditRevision(UUID.randomUUID().toString(), event);
    }
}
