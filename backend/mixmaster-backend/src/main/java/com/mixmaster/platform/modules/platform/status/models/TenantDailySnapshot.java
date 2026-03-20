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
    name = "tenant_daily_snapshots",
    indexes = {
        @Index(name = "idx_tenant_daily_snapshots_tenant_captured_at", columnList = "tenant_id,captured_at"),
        @Index(name = "idx_tenant_daily_snapshots_for_date", columnList = "captured_for_date"),
        @Index(name = "idx_tenant_daily_snapshots_plan_status", columnList = "subscription_plan_code,subscription_status")
    }
)
public class TenantDailySnapshot extends BaseEntity {

    @Column(name = "tenant_id", nullable = false, length = 26)
    private String tenantId;

    @Column(name = "captured_for_date", nullable = false)
    private LocalDate capturedForDate;

    @Column(name = "captured_at", nullable = false)
    private OffsetDateTime capturedAt;

    @Column(name = "code", nullable = false, length = 80)
    private String code;

    @Column(name = "name", nullable = false, length = 160)
    private String name;

    @Column(name = "legal_name", nullable = false, length = 160)
    private String legalName;

    @Column(name = "timezone", nullable = false, length = 80)
    private String timezone;

    @Column(name = "status", nullable = false, length = 40)
    private String status;

    @Column(name = "subscription_plan_code", nullable = false, length = 80)
    private String subscriptionPlanCode;

    @Column(name = "subscription_status", nullable = false, length = 40)
    private String subscriptionStatus;

    @Column(name = "onboarding_stage", nullable = false, length = 40)
    private String onboardingStage;

    @Column(name = "owner_email", length = 160)
    private String ownerEmail;

    @Column(name = "owner_full_name", length = 160)
    private String ownerFullName;

    @Column(name = "owner_password_reset_required", nullable = false)
    private boolean ownerPasswordResetRequired;

    @Column(name = "brand_count", nullable = false)
    private long brandCount;

    @Column(name = "branch_count", nullable = false)
    private long branchCount;

    @Column(name = "staff_user_count", nullable = false)
    private long staffUserCount;

    @Column(name = "active_staff_user_count", nullable = false)
    private long activeStaffUserCount;

    @Column(name = "legal_ready", nullable = false)
    private boolean legalReady;

    @Column(name = "readiness_score", nullable = false)
    private int readinessScore;

    @Column(name = "sii_start_activities_verified", nullable = false)
    private boolean siiStartActivitiesVerified;

    @Column(name = "open_ticket_count", nullable = false)
    private long openTicketCount;

    @Column(name = "urgent_ticket_count", nullable = false)
    private long urgentTicketCount;

    @Column(name = "trial_ends_at")
    private OffsetDateTime trialEndsAt;
}
