package com.mixmaster.platform.modules.menu.publication.models;

import com.mixmaster.platform.modules.menu.catalog.models.Product;
import com.mixmaster.platform.modules.menu.catalog.models.ProductVisibilityMode;
import com.mixmaster.platform.shared.models.TenantScopedEntity;
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
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(
    name = "menu_items",
    indexes = {
        @Index(name = "idx_menu_items_version_order", columnList = "menu_version_id,display_order"),
        @Index(name = "idx_menu_items_subsection", columnList = "menu_subsection_id")
    },
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_menu_items_section_product", columnNames = {"menu_section_id", "product_id"})
    }
)
public class MenuItem extends TenantScopedEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "menu_version_id", nullable = false)
    private MenuVersion menuVersion;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "menu_section_id", nullable = false)
    private MenuSection menuSection;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "menu_subsection_id")
    private MenuSubsection menuSubsection;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "display_order", nullable = false)
    private int displayOrder;

    @Enumerated(EnumType.STRING)
    @Column(name = "visibility_mode", nullable = false, length = 40)
    private ProductVisibilityMode visibilityMode;

    @Column(name = "is_featured", nullable = false)
    private boolean featured;
}
