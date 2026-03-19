package com.mixmaster.platform.modules.identity.staff.models;

import com.mixmaster.platform.modules.organization.models.Brand;
import com.mixmaster.platform.modules.organization.models.Branch;
import com.mixmaster.platform.shared.models.TenantScopedEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(
    name = "staff_role_assignments",
    indexes = {
        @Index(name = "idx_staff_role_assignments_tenant_staff", columnList = "tenant_id,staff_user_id"),
        @Index(name = "idx_staff_role_assignments_tenant_role", columnList = "tenant_id,role_id"),
        @Index(name = "idx_staff_role_assignments_branch", columnList = "branch_id")
    }
)
public class StaffRoleAssignment extends TenantScopedEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "staff_user_id", nullable = false)
    private StaffUser staffUser;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "role_id", nullable = false)
    private Role role;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "brand_id")
    private Brand brand;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id")
    private Branch branch;

    @Enumerated(EnumType.STRING)
    @jakarta.persistence.Column(name = "status", nullable = false, length = 40)
    private StaffRoleAssignmentStatus status;
}
