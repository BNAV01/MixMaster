package com.mixmaster.platform.interfaces.tenantconsole.controllers;

import com.mixmaster.platform.interfaces.tenantconsole.security.TenantConsoleApiPaths;
import com.mixmaster.platform.modules.identity.staff.services.BranchAccessView;
import com.mixmaster.platform.modules.identity.staff.services.TenantDashboardService;
import com.mixmaster.platform.modules.identity.staff.services.TenantStaffManagementService;
import com.mixmaster.platform.shared.security.ActorPermissionService;
import com.mixmaster.platform.shared.security.AuthenticatedActor;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(TenantConsoleApiPaths.ROOT)
public class TenantConsoleAccessController {

    private final ActorPermissionService actorPermissionService;
    private final TenantDashboardService tenantDashboardService;
    private final TenantStaffManagementService tenantStaffManagementService;

    public TenantConsoleAccessController(
        ActorPermissionService actorPermissionService,
        TenantDashboardService tenantDashboardService,
        TenantStaffManagementService tenantStaffManagementService
    ) {
        this.actorPermissionService = actorPermissionService;
        this.tenantDashboardService = tenantDashboardService;
        this.tenantStaffManagementService = tenantStaffManagementService;
    }

    @GetMapping("/dashboard")
    public TenantDashboardResponse dashboard(@RequestParam(required = false) String branchId) {
        AuthenticatedActor actor = actorPermissionService.requireTenantPermission("tenant.dashboard.read");
        actorPermissionService.requireBranchAccess(actor, branchId);
        List<TenantDashboardMetricResponse> metrics = tenantDashboardService.buildDashboard(
            actor.tenantId(),
            actor.accessibleBranchIds().size(),
            branchId != null || actor.accessibleBranchIds().size() <= 1
        ).stream()
            .map(metric -> new TenantDashboardMetricResponse(metric.label(), metric.value(), metric.delta()))
            .toList();
        return new TenantDashboardResponse(actor.tenantId(), branchId != null ? branchId : actor.activeBranchId(), metrics);
    }

    @GetMapping("/staff/roles")
    public List<TenantRoleResponse> roles() {
        AuthenticatedActor actor = actorPermissionService.requireTenantAnyPermission("tenant.staff.read", "tenant.staff.assign");
        return tenantStaffManagementService.listRoles(actor.tenantId()).stream()
            .map(role -> new TenantRoleResponse(
                role.roleId(),
                role.code(),
                role.name(),
                role.description(),
                role.active(),
                role.permissions()
            ))
            .toList();
    }

    @GetMapping("/staff/users")
    public List<TenantStaffUserResponse> staffUsers() {
        AuthenticatedActor actor = actorPermissionService.requireTenantPermission("tenant.staff.read");
        return tenantStaffManagementService.listStaffUsers(actor.tenantId(), actor.accessibleBranchIds()).stream()
            .map(this::toStaffUserResponse)
            .toList();
    }

    @PostMapping("/staff/users")
    public TenantStaffUserResponse createStaffUser(@Valid @RequestBody CreateTenantStaffUserRequest request) {
        AuthenticatedActor actor = actorPermissionService.requireTenantPermission("tenant.staff.write");
        actorPermissionService.requireTenantPermission("tenant.staff.assign");
        return toStaffUserResponse(tenantStaffManagementService.createStaffUser(
            actor.tenantId(),
            actor.accessibleBranchIds(),
            new TenantStaffManagementService.CreateStaffUserCommand(
                request.email(),
                request.fullName(),
                request.password(),
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

    @PatchMapping("/staff/users/{userId}/status")
    public TenantStaffUserResponse updateStatus(
        @PathVariable String userId,
        @Valid @RequestBody UpdateTenantStaffUserStatusRequest request
    ) {
        AuthenticatedActor actor = actorPermissionService.requireTenantPermission("tenant.staff.write");
        return toStaffUserResponse(tenantStaffManagementService.updateStaffUserStatus(
            actor.tenantId(),
            actor.accessibleBranchIds(),
            userId,
            request.status()
        ));
    }

    @PatchMapping("/staff/users/{userId}/access")
    public TenantStaffUserResponse updateAccess(
        @PathVariable String userId,
        @Valid @RequestBody UpdateTenantStaffUserAccessRequest request
    ) {
        AuthenticatedActor actor = actorPermissionService.requireTenantPermission("tenant.staff.write");
        actorPermissionService.requireTenantPermission("tenant.staff.assign");
        return toStaffUserResponse(tenantStaffManagementService.updateStaffUserAccess(
            actor.tenantId(),
            actor.accessibleBranchIds(),
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

    @PostMapping("/staff/users/{userId}/reset-password")
    public TenantStaffUserResponse resetPassword(
        @PathVariable String userId,
        @Valid @RequestBody ResetTenantStaffUserPasswordRequest request
    ) {
        AuthenticatedActor actor = actorPermissionService.requireTenantPermission("tenant.staff.write");
        return toStaffUserResponse(tenantStaffManagementService.resetPassword(
            actor.tenantId(),
            actor.accessibleBranchIds(),
            userId,
            request.newPassword(),
            request.requireReset()
        ));
    }

    private TenantStaffUserResponse toStaffUserResponse(TenantStaffManagementService.StaffUserView staffUserView) {
        return new TenantStaffUserResponse(
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
                .map(assignment -> new TenantStaffAssignmentResponse(
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

    private TenantBranchAccessResponse toBranchResponse(BranchAccessView branchAccessView) {
        return new TenantBranchAccessResponse(
            branchAccessView.branchId(),
            branchAccessView.branchName(),
            branchAccessView.brandId(),
            branchAccessView.brandName(),
            branchAccessView.timezone(),
            branchAccessView.currencyCode()
        );
    }
}
