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
    name = "menu_subsections",
    indexes = {
        @Index(name = "idx_menu_subsections_section_order", columnList = "menu_section_id,display_order")
    },
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_menu_subsections_section_code", columnNames = {"menu_section_id", "code"})
    }
)
public class MenuSubsection extends TenantScopedEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "menu_section_id", nullable = false)
    private MenuSection menuSection;

    @Column(name = "code", nullable = false, length = 80)
    private String code;

    @Column(name = "name", nullable = false, length = 160)
    private String name;

    @Column(name = "display_order", nullable = false)
    private int displayOrder;
}
