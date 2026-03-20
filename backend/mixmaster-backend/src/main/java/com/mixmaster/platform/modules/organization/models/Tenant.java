package com.mixmaster.platform.modules.organization.models;

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
    name = "tenants",
    indexes = {
        @Index(name = "idx_tenants_status", columnList = "status")
    },
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_tenants_code", columnNames = "code")
    }
)
public class Tenant extends BaseEntity {

    @Column(name = "code", nullable = false, length = 80)
    private String code;

    @Column(name = "name", nullable = false, length = 160)
    private String name;

    @Column(name = "legal_name", nullable = false, length = 160)
    private String legalName;

    @Column(name = "tax_id", length = 16)
    private String taxId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 40)
    private TenantStatus status;

    @Column(name = "timezone", nullable = false, length = 80)
    private String timezone;

    @Column(name = "billing_email", length = 160)
    private String billingEmail;

    @Column(name = "billing_phone", length = 40)
    private String billingPhone;

    @Column(name = "economic_activity", length = 160)
    private String economicActivity;

    @Column(name = "sii_activity_code", length = 32)
    private String siiActivityCode;

    @Column(name = "tax_address", length = 200)
    private String taxAddress;

    @Column(name = "tax_commune", length = 120)
    private String taxCommune;

    @Column(name = "tax_city", length = 120)
    private String taxCity;

    @Column(name = "legal_representative_name", length = 160)
    private String legalRepresentativeName;

    @Column(name = "legal_representative_tax_id", length = 16)
    private String legalRepresentativeTaxId;

    @Enumerated(EnumType.STRING)
    @Column(name = "onboarding_stage", nullable = false, length = 40)
    private TenantOnboardingStage onboardingStage = TenantOnboardingStage.OWNER_BOOTSTRAPPED;

    @Column(name = "subscription_plan_code", nullable = false, length = 80)
    private String subscriptionPlanCode = "FOUNDATION";

    @Enumerated(EnumType.STRING)
    @Column(name = "subscription_status", nullable = false, length = 40)
    private TenantSubscriptionStatus subscriptionStatus = TenantSubscriptionStatus.TRIAL;

    @Column(name = "trial_ends_at")
    private OffsetDateTime trialEndsAt;

    @Column(name = "activated_at")
    private OffsetDateTime activatedAt;

    @Column(name = "suspended_at")
    private OffsetDateTime suspendedAt;

    @Column(name = "sii_start_activities_verified", nullable = false)
    private boolean siiStartActivitiesVerified;

    @Column(name = "sii_start_activities_verified_at")
    private OffsetDateTime siiStartActivitiesVerifiedAt;
}
