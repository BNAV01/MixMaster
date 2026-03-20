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
    name = "branches",
    indexes = {
        @Index(name = "idx_branches_tenant_brand", columnList = "tenant_id,brand_id"),
        @Index(name = "idx_branches_tenant_active", columnList = "tenant_id,is_active")
    },
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_branches_tenant_code", columnNames = {"tenant_id", "code"})
    }
)
public class Branch extends TenantScopedSoftDeletableEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "brand_id", nullable = false)
    private Brand brand;

    @Column(name = "code", nullable = false, length = 80)
    private String code;

    @Column(name = "name", nullable = false, length = 160)
    private String name;

    @Column(name = "timezone", nullable = false, length = 80)
    private String timezone;

    @Column(name = "currency_code", nullable = false, length = 3)
    private String currencyCode;

    @Column(name = "address_line1", length = 200)
    private String addressLine1;

    @Column(name = "commune", length = 120)
    private String commune;

    @Column(name = "city", length = 120)
    private String city;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;
}
