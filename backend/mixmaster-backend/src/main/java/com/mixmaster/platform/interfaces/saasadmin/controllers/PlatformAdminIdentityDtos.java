package com.mixmaster.platform.interfaces.saasadmin.controllers;

import com.mixmaster.platform.modules.identity.staff.models.StaffAccessScopeType;
import com.mixmaster.platform.modules.identity.staff.models.StaffUserStatus;
import com.mixmaster.platform.modules.organization.models.TenantOnboardingStage;
import com.mixmaster.platform.modules.organization.models.TenantStatus;
import com.mixmaster.platform.modules.organization.models.TenantSubscriptionStatus;
import com.mixmaster.platform.modules.support.models.SupportTicketPriority;
import com.mixmaster.platform.modules.support.models.SupportTicketStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Set;

record PlatformLoginRequest(
    @NotBlank @Email String email,
    @NotBlank String password
) {
}

record RefreshSessionRequest(
    @NotBlank String refreshToken
) {
}

record PlatformActorResponse(
    String userId,
    String email,
    String fullName,
    String roleCode,
    Set<String> permissions
) {
}

record PlatformAuthSessionResponse(
    String accessToken,
    String refreshToken,
    OffsetDateTime accessExpiresAt,
    OffsetDateTime refreshExpiresAt,
    PlatformActorResponse actor
) {
}

record CreateTenantRequest(
    @NotBlank String name,
    String code,
    String timezone,
    String primaryBrandName,
    String primaryBrandCode,
    String primaryBranchName,
    String primaryBranchCode,
    @Size(min = 3, max = 3) String currencyCode,
    String primaryBranchAddressLine1,
    String primaryBranchCommune,
    String primaryBranchCity,
    @NotBlank @Email String ownerEmail,
    @NotBlank String ownerFullName,
    @Size(min = 8, max = 128) String ownerPassword,
    String legalName,
    String taxId,
    @Email String billingEmail,
    String billingPhone,
    String economicActivity,
    String siiActivityCode,
    String taxAddress,
    String taxCommune,
    String taxCity,
    String legalRepresentativeName,
    String legalRepresentativeTaxId,
    String subscriptionPlanCode,
    TenantOnboardingStage onboardingStage,
    boolean siiStartActivitiesVerified,
    TenantStatus status
) {
}

record UpdateTenantProfileRequest(
    String name,
    String code,
    String timezone,
    TenantStatus status,
    String legalName,
    String taxId,
    @Email String billingEmail,
    String billingPhone,
    String economicActivity,
    String siiActivityCode,
    String taxAddress,
    String taxCommune,
    String taxCity,
    String legalRepresentativeName,
    String legalRepresentativeTaxId,
    String subscriptionPlanCode,
    TenantSubscriptionStatus subscriptionStatus,
    OffsetDateTime trialEndsAt,
    TenantOnboardingStage onboardingStage,
    Boolean siiStartActivitiesVerified,
    String primaryBranchId,
    String primaryBranchName,
    String primaryBranchCode,
    String currencyCode,
    String primaryBranchAddressLine1,
    String primaryBranchCommune,
    String primaryBranchCity
) {
}

record PlatformOverviewResponse(
    long totalTenants,
    long activeTenants,
    long trialTenants,
    long suspendedTenants,
    long legalReadyTenants,
    long onboardingPendingTenants,
    long expiringTrials,
    long siiVerifiedTenants,
    long totalStaffUsers,
    long activeStaffUsers,
    long ownersPendingPasswordReset,
    long openTickets,
    long urgentTickets,
    int averageReadinessScore,
    long newTenantsLast24h,
    OffsetDateTime capturedAt
) {
}

record PlatformPlanSummaryResponse(
    String planCode,
    long tenantCount,
    long activeCount,
    long trialCount,
    long legalReadyCount
) {
}

record PlatformSubscriptionSummaryResponse(
    String tenantId,
    String tenantName,
    String planCode,
    String subscriptionStatus,
    OffsetDateTime trialEndsAt,
    boolean legalReady,
    boolean siiStartActivitiesVerified
) {
}

record PlatformOnboardingItemResponse(
    String tenantId,
    String tenantName,
    String ownerEmail,
    String stage,
    boolean legalReady,
    int readinessScore,
    String nextAction
) {
}

record PlatformSupportAlertResponse(
    String tenantId,
    String tenantName,
    String severity,
    String title,
    String description
) {
}

record PlatformFeatureFlagResponse(
    String code,
    String name,
    String description,
    boolean enabledByDefault,
    String rolloutPolicy,
    List<String> eligiblePlans
) {
}

record PlatformReportCatalogItemResponse(
    String reportCode,
    String name,
    String description,
    String scope,
    List<String> formats
) {
}

record PlatformWorkspaceResponse(
    PlatformOverviewResponse overview,
    List<PlatformTenantSummaryResponse> tenants,
    List<PlatformPlanSummaryResponse> planSummaries,
    List<PlatformSubscriptionSummaryResponse> subscriptionSummaries,
    List<PlatformOnboardingItemResponse> onboardingQueue,
    List<PlatformSupportAlertResponse> supportAlerts,
    List<PlatformFeatureFlagResponse> featureFlags,
    List<PlatformReportCatalogItemResponse> reportCatalog
) {
}

record PlatformBootstrapCredentialResponse(
    String email,
    String temporaryPassword,
    boolean generated,
    boolean passwordResetRequired
) {
}

record PlatformTenantBranchResponse(
    String branchId,
    String brandId,
    String brandName,
    String code,
    String name,
    String timezone,
    String currencyCode,
    String addressLine1,
    String commune,
    String city,
    boolean active
) {
}

record PlatformTenantSummaryResponse(
    String tenantId,
    String code,
    String name,
    String legalName,
    String status,
    String timezone,
    long brandCount,
    long branchCount,
    String ownerEmail,
    String ownerFullName,
    boolean ownerPasswordResetRequired,
    String subscriptionPlanCode,
    String subscriptionStatus,
    String onboardingStage,
    boolean legalReady,
    int readinessScore,
    boolean siiStartActivitiesVerified,
    long openTicketCount,
    long urgentTicketCount,
    long staffUserCount,
    long activeStaffUserCount,
    LocalDateTime createdAt,
    OffsetDateTime trialEndsAt,
    OffsetDateTime telemetryCapturedAt
) {
}

record PlatformTenantDetailResponse(
    String tenantId,
    String code,
    String name,
    String legalName,
    String status,
    String timezone,
    long brandCount,
    long branchCount,
    String ownerEmail,
    String ownerFullName,
    boolean ownerPasswordResetRequired,
    String subscriptionPlanCode,
    String subscriptionStatus,
    String onboardingStage,
    boolean legalReady,
    int readinessScore,
    boolean siiStartActivitiesVerified,
    long openTicketCount,
    long urgentTicketCount,
    long staffUserCount,
    long activeStaffUserCount,
    String taxId,
    String billingEmail,
    String billingPhone,
    String economicActivity,
    String siiActivityCode,
    String taxAddress,
    String taxCommune,
    String taxCity,
    String legalRepresentativeName,
    String legalRepresentativeTaxId,
    OffsetDateTime trialEndsAt,
    OffsetDateTime activatedAt,
    OffsetDateTime suspendedAt,
    LocalDateTime createdAt,
    OffsetDateTime telemetryCapturedAt,
    List<String> missingComplianceItems,
    List<PlatformTenantBranchResponse> branches,
    PlatformBootstrapCredentialResponse bootstrapCredential
) {
}

record PlatformTenantStaffAssignmentResponse(
    String assignmentId,
    String roleCode,
    String roleName,
    String scopeType,
    String brandId,
    String brandName,
    String branchId,
    String branchName
) {
}

record PlatformTenantStaffUserResponse(
    String userId,
    String email,
    String fullName,
    String status,
    boolean bootstrapProtected,
    boolean passwordResetRequired,
    OffsetDateTime lastLoginAt,
    Set<String> permissions,
    List<PlatformTenantBranchResponse> accessibleBranches,
    List<PlatformTenantStaffAssignmentResponse> assignments
) {
}

record PlatformTenantRoleResponse(
    String roleId,
    String code,
    String name,
    String description,
    boolean active,
    List<String> permissions
) {
}

record UpdatePlatformTenantStaffAssignmentRequest(
    @NotBlank String roleCode,
    @NotNull StaffAccessScopeType scopeType,
    List<String> brandIds,
    List<String> branchIds
) {
}

record UpdatePlatformTenantStaffAccessRequest(
    @NotNull StaffUserStatus status,
    boolean passwordResetRequired,
    @NotEmpty List<@Valid UpdatePlatformTenantStaffAssignmentRequest> assignments
) {
}

record ResetPlatformTenantStaffPasswordRequest(
    @NotBlank @Size(min = 8, max = 128) String newPassword,
    boolean requireReset
) {
}

record PlatformAccountProfileResponse(
    String userId,
    String email,
    String fullName,
    String roleCode,
    String status,
    OffsetDateTime passwordSetAt,
    OffsetDateTime lastLoginAt,
    long activeSessions
) {
}

record ChangePlatformPasswordRequest(
    @NotBlank String currentPassword,
    @NotBlank @Size(min = 8, max = 128) String newPassword
) {
}

record PlatformSupportTicketSummaryResponse(
    String ticketId,
    String tenantId,
    String tenantName,
    String subject,
    String category,
    String priority,
    String status,
    String requestedByEmail,
    String requestedByName,
    String assignedPlatformUserId,
    String lastReplyByAudience,
    OffsetDateTime lastMessageAt,
    OffsetDateTime lastTenantMessageAt,
    OffsetDateTime lastPlatformReplyAt,
    OffsetDateTime resolvedAt,
    String resolutionSummary
) {
}

record PlatformSupportTicketMessageResponse(
    String messageId,
    String authorAudience,
    String authorDisplayName,
    String authorEmail,
    String body,
    boolean internalNote,
    LocalDateTime createdAt
) {
}

record PlatformSupportTicketDetailResponse(
    PlatformSupportTicketSummaryResponse summary,
    List<PlatformSupportTicketMessageResponse> messages
) {
}

record CreatePlatformSupportTicketReplyRequest(
    @NotBlank String body,
    boolean internalNote
) {
}

record UpdatePlatformSupportTicketRequest(
    SupportTicketStatus status,
    SupportTicketPriority priority,
    String assignedPlatformUserId,
    String resolutionSummary
) {
}
