package com.mixmaster.platform.modules.menu.catalog.models;

import com.mixmaster.platform.shared.models.TenantScopedSoftDeletableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Index;
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
    name = "product_categories",
    indexes = {
        @Index(name = "idx_product_categories_tenant_active", columnList = "tenant_id,is_active")
    },
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_product_categories_tenant_code", columnNames = {"tenant_id", "code"})
    }
)
public class ProductCategory extends TenantScopedSoftDeletableEntity {

    @Column(name = "code", nullable = false, length = 80)
    private String code;

    @Column(name = "name", nullable = false, length = 120)
    private String name;

    @Column(name = "display_order", nullable = false)
    private int displayOrder;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;
}
