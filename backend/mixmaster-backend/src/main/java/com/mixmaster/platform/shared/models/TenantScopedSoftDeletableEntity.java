package com.mixmaster.platform.shared.models;

import com.mixmaster.platform.shared.tenant.TenantScoped;
import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import java.time.OffsetDateTime;

@MappedSuperclass
public abstract class TenantScopedSoftDeletableEntity extends BaseEntity implements TenantScoped {

    @Column(name = "tenant_id", nullable = false, length = 26)
    private String tenantId;

    @Column(name = "deleted_at")
    private OffsetDateTime deletedAt;

    @Override
    public String getTenantId() {
        return tenantId;
    }

    @Override
    public void setTenantId(String tenantId) {
        this.tenantId = tenantId;
    }

    public OffsetDateTime getDeletedAt() {
        return deletedAt;
    }

    public void setDeletedAt(OffsetDateTime deletedAt) {
        this.deletedAt = deletedAt;
    }
}
