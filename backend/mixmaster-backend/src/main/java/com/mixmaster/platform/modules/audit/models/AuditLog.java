package com.mixmaster.platform.modules.audit.models;

import com.mixmaster.platform.shared.utils.UlidGenerator;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Immutable;

@Getter
@Setter
@NoArgsConstructor
@Immutable
@Entity
@Table(
    name = "audit_logs",
    indexes = {
        @Index(name = "idx_audit_logs_module_occurred_at", columnList = "module,occurred_at"),
        @Index(name = "idx_audit_logs_tenant_occurred_at", columnList = "tenant_id,occurred_at"),
        @Index(name = "idx_audit_logs_entity_lookup", columnList = "entity_type,entity_id")
    }
)
public class AuditLog {

    @Id
    @Column(name = "id", nullable = false, updatable = false, length = 26)
    private String id;

    @Column(name = "tenant_id", length = 26)
    private String tenantId;

    @Column(name = "brand_id", length = 26)
    private String brandId;

    @Column(name = "branch_id", length = 26)
    private String branchId;

    @Column(name = "actor", nullable = false, length = 160)
    private String actor;

    @Enumerated(EnumType.STRING)
    @Column(name = "audience", length = 40)
    private AuditAudience audience;

    @Column(name = "module", nullable = false, length = 80)
    private String module;

    @Column(name = "action", nullable = false, length = 120)
    private String action;

    @Column(name = "entity_type", length = 120)
    private String entityType;

    @Column(name = "entity_id", length = 26)
    private String entityId;

    @Column(name = "trace_id", length = 80)
    private String traceId;

    @Column(name = "metadata_json", columnDefinition = "json")
    private String metadataJson;

    @Column(name = "occurred_at", nullable = false)
    private OffsetDateTime occurredAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @PrePersist
    void prePersist() {
        if (id == null || id.isBlank()) {
            id = UlidGenerator.nextUlid();
        }
        if (createdAt == null) {
            createdAt = OffsetDateTime.now();
        }
        if (occurredAt == null) {
            occurredAt = createdAt;
        }
    }
}
