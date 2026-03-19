package com.mixmaster.platform.modules.menu.catalog.models;

import com.mixmaster.platform.modules.organization.models.Brand;
import com.mixmaster.platform.modules.organization.models.Branch;
import com.mixmaster.platform.shared.models.TenantScopedSoftDeletableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.math.BigDecimal;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(
    name = "products",
    indexes = {
        @Index(name = "idx_products_tenant_brand", columnList = "tenant_id,brand_id"),
        @Index(name = "idx_products_category", columnList = "category_id"),
        @Index(name = "idx_products_scope", columnList = "scope_type,scope_branch_id"),
        @Index(name = "idx_products_active_visibility", columnList = "tenant_id,is_active,visibility_mode")
    },
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_products_tenant_code", columnNames = {"tenant_id", "code"}),
        @UniqueConstraint(name = "uk_products_tenant_slug", columnNames = {"tenant_id", "slug"})
    }
)
public class Product extends TenantScopedSoftDeletableEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "brand_id", nullable = false)
    private Brand brand;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "scope_branch_id")
    private Branch scopeBranch;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    private ProductCategory category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subcategory_id")
    private ProductSubcategory subcategory;

    @Enumerated(EnumType.STRING)
    @Column(name = "scope_type", nullable = false, length = 40)
    private ProductScopeType scopeType;

    @Enumerated(EnumType.STRING)
    @Column(name = "product_type", nullable = false, length = 40)
    private ProductType productType;

    @Column(name = "code", nullable = false, length = 80)
    private String code;

    @Column(name = "slug", nullable = false, length = 180)
    private String slug;

    @Column(name = "name", nullable = false, length = 160)
    private String name;

    @Column(name = "short_description", length = 255)
    private String shortDescription;

    @Column(name = "long_description", columnDefinition = "TEXT")
    private String longDescription;

    @Column(name = "alcohol_level", precision = 5, scale = 2)
    private BigDecimal alcoholLevel;

    @Column(name = "price_current", nullable = false, precision = 10, scale = 2)
    private BigDecimal priceCurrent;

    @Column(name = "currency_code", nullable = false, length = 3)
    private String currencyCode;

    @Column(name = "image_url", length = 512)
    private String imageUrl;

    @Column(name = "is_featured", nullable = false)
    private boolean featured;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    @Enumerated(EnumType.STRING)
    @Column(name = "visibility_mode", nullable = false, length = 40)
    private ProductVisibilityMode visibilityMode;
}
