package com.mixmaster.platform.shared.models;

import com.mixmaster.platform.shared.tenant.TenantScoped;
import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;

@MappedSuperclass
public abstract class TenantScopedEntity extends BaseEntity implements TenantScoped {

    @Column(name = "tenant_id", nullable = false, length = 26)
    private String tenantId;

    @Override
    public String getTenantId() {
        return tenantId;
    }

    @Override
    public void setTenantId(String tenantId) {
        this.tenantId = tenantId;
    }
}
