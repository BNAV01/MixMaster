package com.mixmaster.platform.modules.menu.catalog.models;

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
    name = "product_subcategories",
    indexes = {
        @Index(name = "idx_product_subcategories_category", columnList = "category_id"),
        @Index(name = "idx_product_subcategories_tenant_active", columnList = "tenant_id,is_active")
    },
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_product_subcategories_tenant_category_code", columnNames = {"tenant_id", "category_id", "code"})
    }
)
public class ProductSubcategory extends TenantScopedSoftDeletableEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    private ProductCategory category;

    @Column(name = "code", nullable = false, length = 80)
    private String code;

    @Column(name = "name", nullable = false, length = 120)
    private String name;

    @Column(name = "display_order", nullable = false)
    private int displayOrder;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;
}
