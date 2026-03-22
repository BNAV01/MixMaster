package com.mixmaster.platform.interfaces.tenantconsole.controllers;

import com.mixmaster.platform.modules.identity.staff.models.StaffAccessScopeType;
import com.mixmaster.platform.modules.identity.staff.models.StaffUserStatus;
import com.mixmaster.platform.modules.support.models.SupportTicketCategory;
import com.mixmaster.platform.modules.support.models.SupportTicketPriority;
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

record TenantLoginRequest(
    @NotBlank String tenantCode,
    @NotBlank @Email String email,
    @NotBlank String password,
    String activeBranchId
) {
}

record RefreshSessionRequest(
    @NotBlank String refreshToken
) {
}

record TenantBranchAccessResponse(
    String branchId,
    String branchName,
    String brandId,
    String brandName,
    String timezone,
    String currencyCode
) {
}

record TenantActorResponse(
    String userId,
    String email,
    String fullName,
    String tenantId,
    String tenantCode,
    String tenantName,
    String activeBranchId,
    boolean passwordResetRequired,
    Set<String> roleCodes,
    Set<String> permissions,
    List<TenantBranchAccessResponse> accessibleBranches
) {
}

record TenantAuthSessionResponse(
    String accessToken,
    String refreshToken,
    OffsetDateTime accessExpiresAt,
    OffsetDateTime refreshExpiresAt,
    TenantActorResponse actor
) {
}

record TenantDashboardMetricResponse(
    String label,
    String value,
    String delta
) {
}

record TenantDashboardResponse(
    String tenantId,
    String branchId,
    List<TenantDashboardMetricResponse> metrics
) {
}

record TenantRoleResponse(
    String roleId,
    String code,
    String name,
    String description,
    boolean active,
    List<String> permissions
) {
}

record TenantStaffAssignmentResponse(
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

record TenantStaffUserResponse(
    String userId,
    String email,
    String fullName,
    String status,
    boolean bootstrapProtected,
    boolean passwordResetRequired,
    OffsetDateTime lastLoginAt,
    Set<String> permissions,
    List<TenantBranchAccessResponse> accessibleBranches,
    List<TenantStaffAssignmentResponse> assignments
) {
}

record TenantOrganizationBranchResponse(
    String branchId,
    String brandId,
    String brandName,
    String code,
    String name,
    String timezone,
    String currencyCode,
    boolean active
) {
}

record TenantOrganizationBrandResponse(
    String brandId,
    String code,
    String name,
    boolean active,
    int totalBranchCount,
    int visibleBranchCount,
    List<TenantOrganizationBranchResponse> branches
) {
}

record TenantOrganizationResponse(
    String tenantId,
    int brandCount,
    int totalBranchCount,
    int visibleBranchCount,
    boolean crossBranchAccess,
    boolean canWrite,
    List<TenantOrganizationBrandResponse> brands
) {
}

record CreateTenantStaffAssignmentRequest(
    @NotBlank String roleCode,
    @NotNull StaffAccessScopeType scopeType,
    List<String> brandIds,
    List<String> branchIds
) {
}

record CreateTenantStaffUserRequest(
    @NotBlank @Email String email,
    @NotBlank String fullName,
    @NotBlank @Size(min = 8, max = 128) String password,
    @NotNull StaffUserStatus status,
    boolean passwordResetRequired,
    @NotEmpty List<@Valid CreateTenantStaffAssignmentRequest> assignments
) {
}

record UpdateTenantStaffUserStatusRequest(
    @NotNull StaffUserStatus status
) {
}

record UpdateTenantStaffUserAccessRequest(
    @NotNull StaffUserStatus status,
    boolean passwordResetRequired,
    @NotEmpty List<@Valid CreateTenantStaffAssignmentRequest> assignments
) {
}

record ResetTenantStaffUserPasswordRequest(
    @NotBlank @Size(min = 8, max = 128) String newPassword,
    boolean requireReset
) {
}

record CreateTenantBrandRequest(
    @NotBlank @Size(max = 80) String code,
    @NotBlank @Size(max = 160) String name
) {
}

record CreateTenantBranchRequest(
    @NotBlank String brandId,
    @NotBlank @Size(max = 80) String code,
    @NotBlank @Size(max = 160) String name,
    @NotBlank @Size(max = 80) String timezone,
    @NotBlank @Size(min = 3, max = 3) String currencyCode
) {
}

record UpdateTenantBranchRequest(
    @NotBlank @Size(max = 160) String name,
    @NotBlank @Size(max = 80) String timezone,
    @NotBlank @Size(min = 3, max = 3) String currencyCode,
    boolean active
) {
}

record TenantSupportTicketSummaryResponse(
    String ticketId,
    String tenantId,
    String branchId,
    String subject,
    String category,
    String priority,
    String status,
    String requestedByEmail,
    String requestedByName,
    String lastReplyByAudience,
    OffsetDateTime lastMessageAt,
    OffsetDateTime lastTenantMessageAt,
    OffsetDateTime lastPlatformReplyAt,
    OffsetDateTime resolvedAt,
    String resolutionSummary
) {
}

record TenantSupportTicketMessageResponse(
    String messageId,
    String authorAudience,
    String authorDisplayName,
    String authorEmail,
    String body,
    LocalDateTime createdAt
) {
}

record TenantSupportTicketDetailResponse(
    TenantSupportTicketSummaryResponse summary,
    List<TenantSupportTicketMessageResponse> messages
) {
}

record CreateTenantSupportTicketRequest(
    String branchId,
    @NotBlank @Size(max = 200) String subject,
    @NotNull SupportTicketCategory category,
    @NotNull SupportTicketPriority priority,
    @NotBlank String body
) {
}

record ReplyTenantSupportTicketRequest(
    @NotBlank String body
) {
}

record ResolveTenantSupportTicketRequest(
    String resolutionSummary
) {
}
