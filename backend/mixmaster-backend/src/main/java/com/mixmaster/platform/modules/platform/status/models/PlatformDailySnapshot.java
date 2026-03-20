package com.mixmaster.platform.modules.platform.status.models;

import com.mixmaster.platform.shared.models.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(
    name = "platform_daily_snapshots",
    indexes = {
        @Index(name = "idx_platform_daily_snapshots_captured_at", columnList = "captured_at"),
        @Index(name = "idx_platform_daily_snapshots_for_date", columnList = "captured_for_date")
    }
)
public class PlatformDailySnapshot extends BaseEntity {

    @Column(name = "captured_for_date", nullable = false)
    private LocalDate capturedForDate;

    @Column(name = "captured_at", nullable = false)
    private OffsetDateTime capturedAt;

    @Column(name = "total_tenants", nullable = false)
    private long totalTenants;

    @Column(name = "active_tenants", nullable = false)
    private long activeTenants;

    @Column(name = "trial_tenants", nullable = false)
    private long trialTenants;

    @Column(name = "suspended_tenants", nullable = false)
    private long suspendedTenants;

    @Column(name = "legal_ready_tenants", nullable = false)
    private long legalReadyTenants;

    @Column(name = "onboarding_pending_tenants", nullable = false)
    private long onboardingPendingTenants;

    @Column(name = "expiring_trials", nullable = false)
    private long expiringTrials;

    @Column(name = "sii_verified_tenants", nullable = false)
    private long siiVerifiedTenants;

    @Column(name = "total_staff_users", nullable = false)
    private long totalStaffUsers;

    @Column(name = "active_staff_users", nullable = false)
    private long activeStaffUsers;

    @Column(name = "owners_pending_password_reset", nullable = false)
    private long ownersPendingPasswordReset;

    @Column(name = "open_tickets", nullable = false)
    private long openTickets;

    @Column(name = "urgent_tickets", nullable = false)
    private long urgentTickets;

    @Column(name = "average_readiness_score", nullable = false)
    private int averageReadinessScore;

    @Column(name = "new_tenants_last_24h", nullable = false)
    private long newTenantsLast24h;
}
