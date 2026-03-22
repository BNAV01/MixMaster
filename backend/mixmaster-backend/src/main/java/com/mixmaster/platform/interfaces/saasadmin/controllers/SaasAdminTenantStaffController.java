package com.mixmaster.platform.interfaces.saasadmin.controllers;

import com.mixmaster.platform.interfaces.saasadmin.security.SaasAdminApiPaths;
import com.mixmaster.platform.modules.identity.staff.services.BranchAccessView;
import com.mixmaster.platform.modules.identity.staff.services.TenantStaffManagementService;
import com.mixmaster.platform.shared.security.ActorPermissionService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Set;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(SaasAdminApiPaths.ROOT)
public class SaasAdminTenantStaffController {

    private final ActorPermissionService actorPermissionService;
    private final TenantStaffManagementService tenantStaffManagementService;

    public SaasAdminTenantStaffController(
        ActorPermissionService actorPermissionService,
        TenantStaffManagementService tenantStaffManagementService
    ) {
        this.actorPermissionService = actorPermissionService;
        this.tenantStaffManagementService = tenantStaffManagementService;
    }

    @GetMapping("/tenants/{tenantId}/staff/roles")
    public List<PlatformTenantRoleResponse> roles(@PathVariable String tenantId) {
        actorPermissionService.requirePlatformPermission("platform.tenants.read");
        return tenantStaffManagementService.listRoles(tenantId).stream()
            .map(role -> new PlatformTenantRoleResponse(
                role.roleId(),
                role.code(),
                role.name(),
                role.description(),
                role.active(),
                role.permissions()
            ))
            .toList();
    }

    @GetMapping("/tenants/{tenantId}/staff/users")
    public List<PlatformTenantStaffUserResponse> staffUsers(@PathVariable String tenantId) {
        actorPermissionService.requirePlatformPermission("platform.tenants.read");
        return tenantStaffManagementService.listStaffUsers(tenantId, Set.of()).stream()
            .map(this::toStaffUserResponse)
            .toList();
    }

    @PatchMapping("/tenants/{tenantId}/staff/users/{userId}/access")
    public PlatformTenantStaffUserResponse updateAccess(
        @PathVariable String tenantId,
        @PathVariable String userId,
        @Valid @RequestBody UpdatePlatformTenantStaffAccessRequest request
    ) {
        actorPermissionService.requirePlatformPermission("platform.tenants.write");
        return toStaffUserResponse(tenantStaffManagementService.updateStaffUserAccess(
            tenantId,
            Set.of(),
            userId,
            new TenantStaffManagementService.UpdateStaffUserAccessCommand(
                request.status(),
                request.passwordResetRequired(),
                request.assignments().stream()
                    .map(assignment -> new TenantStaffManagementService.CreateAssignmentCommand(
                        assignment.roleCode(),
                        assignment.scopeType(),
                        assignment.brandIds(),
                        assignment.branchIds()
                    ))
                    .toList()
            )
        ));
    }

    @PostMapping("/tenants/{tenantId}/staff/users/{userId}/reset-password")
    public PlatformTenantStaffUserResponse resetPassword(
        @PathVariable String tenantId,
        @PathVariable String userId,
        @Valid @RequestBody ResetPlatformTenantStaffPasswordRequest request
    ) {
        actorPermissionService.requirePlatformPermission("platform.tenants.write");
        return toStaffUserResponse(tenantStaffManagementService.resetPassword(
            tenantId,
            Set.of(),
            userId,
            request.newPassword(),
            request.requireReset()
        ));
    }

    private PlatformTenantStaffUserResponse toStaffUserResponse(TenantStaffManagementService.StaffUserView staffUserView) {
        return new PlatformTenantStaffUserResponse(
            staffUserView.userId(),
            staffUserView.email(),
            staffUserView.fullName(),
            staffUserView.status().name(),
            staffUserView.bootstrapProtected(),
            staffUserView.passwordResetRequired(),
            staffUserView.lastLoginAt(),
            staffUserView.permissions(),
            staffUserView.accessibleBranches().stream().map(this::toBranchResponse).toList(),
            staffUserView.assignments().stream()
                .map(assignment -> new PlatformTenantStaffAssignmentResponse(
                    assignment.assignmentId(),
                    assignment.roleCode(),
                    assignment.roleName(),
                    assignment.scopeType().name(),
                    assignment.brandId(),
                    assignment.brandName(),
                    assignment.branchId(),
                    assignment.branchName()
                ))
                .toList()
        );
    }

    private PlatformTenantBranchResponse toBranchResponse(BranchAccessView branchAccessView) {
        return new PlatformTenantBranchResponse(
            branchAccessView.branchId(),
            branchAccessView.brandId(),
            branchAccessView.brandName(),
            null,
            branchAccessView.branchName(),
            branchAccessView.timezone(),
            branchAccessView.currencyCode(),
            null,
            null,
            null,
            true
        );
    }
}
