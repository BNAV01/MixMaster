package com.mixmaster.platform.modules.organization.models;

import com.mixmaster.platform.shared.models.TenantScopedSoftDeletableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(
    name = "brands",
    indexes = {
        @Index(name = "idx_brands_tenant_active", columnList = "tenant_id,is_active")
    },
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_brands_tenant_code", columnNames = {"tenant_id", "code"})
    }
)
public class Brand extends TenantScopedSoftDeletableEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tenant_id", nullable = false, insertable = false, updatable = false)
    private Tenant tenant;

    @Column(name = "code", nullable = false, length = 80)
    private String code;

    @Column(name = "name", nullable = false, length = 160)
    private String name;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;
}
