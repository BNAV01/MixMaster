package com.mixmaster.platform.modules.identity.staff.models;

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
    name = "roles",
    indexes = {
        @Index(name = "idx_roles_tenant_active", columnList = "tenant_id,is_active")
    },
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_roles_tenant_code", columnNames = {"tenant_id", "code"})
    }
)
public class Role extends TenantScopedSoftDeletableEntity {

    @Column(name = "code", nullable = false, length = 80)
    private String code;

    @Column(name = "name", nullable = false, length = 120)
    private String name;

    @Column(name = "description", length = 255)
    private String description;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;
}
