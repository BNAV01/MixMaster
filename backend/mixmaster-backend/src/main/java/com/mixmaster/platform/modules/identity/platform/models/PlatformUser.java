package com.mixmaster.platform.modules.identity.platform.models;

import com.mixmaster.platform.shared.models.BaseEntity;
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
    name = "platform_users",
    indexes = {
        @Index(name = "idx_platform_users_status", columnList = "status"),
        @Index(name = "idx_platform_users_role_status", columnList = "role_code,status")
    },
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_platform_users_email", columnNames = "email")
    }
)
public class PlatformUser extends BaseEntity {

    @Column(name = "email", nullable = false, length = 160)
    private String email;

    @Column(name = "full_name", nullable = false, length = 160)
    private String fullName;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(name = "role_code", nullable = false, length = 80)
    private PlatformUserRole roleCode;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 40)
    private PlatformUserStatus status;

    @Column(name = "password_set_at")
    private OffsetDateTime passwordSetAt;

    @Column(name = "failed_login_attempts", nullable = false)
    private int failedLoginAttempts;

    @Column(name = "locked_until")
    private OffsetDateTime lockedUntil;

    @Column(name = "last_login_at")
    private OffsetDateTime lastLoginAt;
}
