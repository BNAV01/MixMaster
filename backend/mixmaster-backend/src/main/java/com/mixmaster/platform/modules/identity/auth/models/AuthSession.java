package com.mixmaster.platform.modules.identity.auth.models;

import com.mixmaster.platform.modules.identity.platform.models.PlatformUser;
import com.mixmaster.platform.modules.identity.staff.models.StaffUser;
import com.mixmaster.platform.shared.models.BaseEntity;
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
import java.time.OffsetDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(
    name = "auth_sessions",
    indexes = {
        @Index(name = "idx_auth_sessions_audience", columnList = "audience"),
        @Index(name = "idx_auth_sessions_staff_active", columnList = "staff_user_id,revoked_at,access_expires_at"),
        @Index(name = "idx_auth_sessions_platform_active", columnList = "platform_user_id,revoked_at,access_expires_at")
    },
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_auth_sessions_access_hash", columnNames = "access_token_hash"),
        @UniqueConstraint(name = "uk_auth_sessions_refresh_hash", columnNames = "refresh_token_hash")
    }
)
public class AuthSession extends BaseEntity {

    @Enumerated(EnumType.STRING)
    @Column(name = "audience", nullable = false, length = 40)
    private AuthSessionAudience audience;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "platform_user_id")
    private PlatformUser platformUser;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "staff_user_id")
    private StaffUser staffUser;

    @Column(name = "tenant_id", length = 26)
    private String tenantId;

    @Column(name = "active_branch_id", length = 26)
    private String activeBranchId;

    @Column(name = "access_token_hash", nullable = false, length = 64)
    private String accessTokenHash;

    @Column(name = "refresh_token_hash", nullable = false, length = 64)
    private String refreshTokenHash;

    @Column(name = "access_expires_at", nullable = false)
    private OffsetDateTime accessExpiresAt;

    @Column(name = "refresh_expires_at", nullable = false)
    private OffsetDateTime refreshExpiresAt;

    @Column(name = "revoked_at")
    private OffsetDateTime revokedAt;
}
