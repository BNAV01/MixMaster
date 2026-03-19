package com.mixmaster.platform.modules.identity.staff.models;

import com.mixmaster.platform.shared.models.TenantScopedSoftDeletableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.OffsetDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(
    name = "staff_users",
    indexes = {
        @Index(name = "idx_staff_users_tenant_status", columnList = "tenant_id,status")
    },
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_staff_users_tenant_email", columnNames = {"tenant_id", "email"})
    }
)
public class StaffUser extends TenantScopedSoftDeletableEntity {

    @Column(name = "email", nullable = false, length = 160)
    private String email;

    @Column(name = "full_name", nullable = false, length = 160)
    private String fullName;

    @Column(name = "password_hash", length = 255)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 40)
    private StaffUserStatus status;

    @Column(name = "last_login_at")
    private OffsetDateTime lastLoginAt;
}
