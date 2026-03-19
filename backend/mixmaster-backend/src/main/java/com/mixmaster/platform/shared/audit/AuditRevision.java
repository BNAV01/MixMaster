package com.mixmaster.platform.shared.audit;

public record AuditRevision(
    String revisionId,
    AuditRevisionEvent event
) {
}
