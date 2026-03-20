package com.mixmaster.platform.interfaces.saasadmin.controllers;

import com.mixmaster.platform.interfaces.saasadmin.security.SaasAdminApiPaths;
import com.mixmaster.platform.modules.identity.auth.services.PlatformAccountService;
import com.mixmaster.platform.shared.security.ActorPermissionService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(SaasAdminApiPaths.ROOT)
public class SaasAdminAccountController {

    private final ActorPermissionService actorPermissionService;
    private final PlatformAccountService platformAccountService;

    public SaasAdminAccountController(
        ActorPermissionService actorPermissionService,
        PlatformAccountService platformAccountService
    ) {
        this.actorPermissionService = actorPermissionService;
        this.platformAccountService = platformAccountService;
    }

    @GetMapping("/account/profile")
    public PlatformAccountProfileResponse profile() {
        String userId = actorPermissionService.requirePlatformActor().userId();
        PlatformAccountService.AccountProfileView profile = platformAccountService.loadProfile(userId);
        return new PlatformAccountProfileResponse(
            profile.userId(),
            profile.email(),
            profile.fullName(),
            profile.roleCode(),
            profile.status(),
            profile.passwordSetAt(),
            profile.lastLoginAt(),
            profile.activeSessions()
        );
    }

    @PostMapping("/account/password")
    public PlatformAccountProfileResponse changePassword(@Valid @RequestBody ChangePlatformPasswordRequest request) {
        String userId = actorPermissionService.requirePlatformActor().userId();
        PlatformAccountService.AccountProfileView profile = platformAccountService.changePassword(
            userId,
            request.currentPassword(),
            request.newPassword()
        );
        return new PlatformAccountProfileResponse(
            profile.userId(),
            profile.email(),
            profile.fullName(),
            profile.roleCode(),
            profile.status(),
            profile.passwordSetAt(),
            profile.lastLoginAt(),
            profile.activeSessions()
        );
    }
}
