package com.mixmaster.platform.modules.menu.publication.models;

import com.mixmaster.platform.shared.models.TenantScopedEntity;
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
    name = "menu_sections",
    indexes = {
        @Index(name = "idx_menu_sections_version_order", columnList = "menu_version_id,display_order")
    },
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_menu_sections_version_code", columnNames = {"menu_version_id", "code"})
    }
)
public class MenuSection extends TenantScopedEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "menu_version_id", nullable = false)
    private MenuVersion menuVersion;

    @Column(name = "code", nullable = false, length = 80)
    private String code;

    @Column(name = "name", nullable = false, length = 160)
    private String name;

    @Column(name = "display_order", nullable = false)
    private int displayOrder;
}
