package com.mixmaster.platform.interfaces.tenantconsole.controllers;

import com.mixmaster.platform.interfaces.tenantconsole.security.TenantConsoleApiPaths;
import com.mixmaster.platform.modules.identity.auth.services.AuthSessionService;
import com.mixmaster.platform.modules.identity.auth.services.StaffAuthenticationService;
import com.mixmaster.platform.modules.identity.auth.services.StaffSessionBundle;
import com.mixmaster.platform.modules.identity.staff.models.StaffUser;
import com.mixmaster.platform.modules.identity.staff.repositories.StaffUserRepository;
import com.mixmaster.platform.modules.identity.staff.services.BranchAccessView;
import com.mixmaster.platform.modules.identity.staff.services.StaffAccessProfile;
import com.mixmaster.platform.modules.identity.staff.services.StaffAccessProfileService;
import com.mixmaster.platform.modules.organization.models.Tenant;
import com.mixmaster.platform.modules.organization.repositories.TenantRepository;
import com.mixmaster.platform.shared.security.ActorPermissionService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TenantConsoleAuthController {

    private final StaffAuthenticationService staffAuthenticationService;
    private final AuthSessionService authSessionService;
    private final StaffUserRepository staffUserRepository;
    private final TenantRepository tenantRepository;
    private final StaffAccessProfileService staffAccessProfileService;
    private final ActorPermissionService actorPermissionService;

    public TenantConsoleAuthController(
        StaffAuthenticationService staffAuthenticationService,
        AuthSessionService authSessionService,
        StaffUserRepository staffUserRepository,
        TenantRepository tenantRepository,
        StaffAccessProfileService staffAccessProfileService,
        ActorPermissionService actorPermissionService
    ) {
        this.staffAuthenticationService = staffAuthenticationService;
        this.authSessionService = authSessionService;
        this.staffUserRepository = staffUserRepository;
        this.tenantRepository = tenantRepository;
        this.staffAccessProfileService = staffAccessProfileService;
        this.actorPermissionService = actorPermissionService;
    }

    @PostMapping(TenantConsoleApiPaths.PUBLIC_BASE_PATH + "/auth/login")
    public TenantAuthSessionResponse login(@Valid @RequestBody TenantLoginRequest request) {
        return toAuthResponse(staffAuthenticationService.login(
            request.tenantCode(),
            request.email(),
            request.password(),
            request.activeBranchId()
        ));
    }

    @PostMapping(TenantConsoleApiPaths.PUBLIC_BASE_PATH + "/auth/refresh")
    public TenantAuthSessionResponse refresh(@Valid @RequestBody RefreshSessionRequest request) {
        return toAuthResponse(authSessionService.refreshStaffSession(request.refreshToken()));
    }

    @GetMapping(TenantConsoleApiPaths.ROOT + "/me")
    public TenantActorResponse me() {
        var actor = actorPermissionService.requireTenantActor();
        StaffUser staffUser = staffUserRepository.findByIdAndTenantIdAndDeletedAtIsNull(actor.userId(), actor.tenantId())
            .orElseThrow(() -> new IllegalArgumentException("Staff user was not found"));
        Tenant tenant = tenantRepository.findById(actor.tenantId())
            .orElseThrow(() -> new IllegalArgumentException("Tenant was not found"));
        StaffAccessProfile accessProfile = staffAccessProfileService.buildProfile(staffUser);
        return toActorResponse(staffUser, tenant, accessProfile, actor.activeBranchId());
    }

    @PostMapping(TenantConsoleApiPaths.ROOT + "/auth/logout")
    public void logout(@RequestHeader("Authorization") String authorizationHeader) {
        actorPermissionService.requireTenantActor();
        authSessionService.revokeAccessToken(extractBearerToken(authorizationHeader));
    }

    private TenantAuthSessionResponse toAuthResponse(StaffSessionBundle sessionBundle) {
        return new TenantAuthSessionResponse(
            sessionBundle.tokens().accessToken(),
            sessionBundle.tokens().refreshToken(),
            sessionBundle.tokens().accessExpiresAt(),
            sessionBundle.tokens().refreshExpiresAt(),
            toActorResponse(sessionBundle.user(), sessionBundle.tenant(), sessionBundle.accessProfile(), sessionBundle.activeBranchId())
        );
    }

    private TenantActorResponse toActorResponse(
        StaffUser user,
        Tenant tenant,
        StaffAccessProfile accessProfile,
        String activeBranchId
    ) {
        return new TenantActorResponse(
            user.getId(),
            user.getEmail(),
            user.getFullName(),
            tenant.getId(),
            tenant.getCode(),
            tenant.getName(),
            activeBranchId,
            user.isPasswordResetRequired(),
            accessProfile.roleCodes(),
            accessProfile.permissions(),
            accessProfile.accessibleBranches().stream().map(this::toBranchResponse).toList()
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

    private String extractBearerToken(String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            throw new IllegalArgumentException("Authorization header must include a bearer token");
        }

        return authorizationHeader.substring(7).trim();
    }
}
