package com.mixmaster.platform.modules.menu.publication.models;

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
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(
    name = "menus",
    indexes = {
        @Index(name = "idx_menus_scope", columnList = "tenant_id,brand_id,scope_branch_id"),
        @Index(name = "idx_menus_status", columnList = "tenant_id,status")
    },
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_menus_scope_code", columnNames = {"tenant_id", "brand_id", "scope_branch_id", "code"})
    }
)
public class Menu extends TenantScopedSoftDeletableEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "brand_id", nullable = false)
    private Brand brand;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "scope_branch_id")
    private Branch scopeBranch;

    @Column(name = "code", nullable = false, length = 80)
    private String code;

    @Column(name = "name", nullable = false, length = 160)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "scope_type", nullable = false, length = 40)
    private MenuScopeType scopeType;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 40)
    private MenuStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "source_menu_id")
    private Menu sourceMenu;
}
