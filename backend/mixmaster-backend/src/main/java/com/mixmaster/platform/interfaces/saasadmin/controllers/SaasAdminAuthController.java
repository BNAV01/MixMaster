package com.mixmaster.platform.interfaces.saasadmin.controllers;

import com.mixmaster.platform.interfaces.saasadmin.security.SaasAdminApiPaths;
import com.mixmaster.platform.modules.identity.auth.services.AuthSessionService;
import com.mixmaster.platform.modules.identity.auth.services.PlatformAuthenticationService;
import com.mixmaster.platform.modules.identity.auth.services.PlatformSessionBundle;
import com.mixmaster.platform.modules.identity.platform.models.PlatformUser;
import com.mixmaster.platform.modules.identity.platform.repositories.PlatformUserRepository;
import com.mixmaster.platform.shared.security.ActorPermissionService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class SaasAdminAuthController {

    private final PlatformAuthenticationService platformAuthenticationService;
    private final PlatformUserRepository platformUserRepository;
    private final AuthSessionService authSessionService;
    private final ActorPermissionService actorPermissionService;

    public SaasAdminAuthController(
        PlatformAuthenticationService platformAuthenticationService,
        PlatformUserRepository platformUserRepository,
        AuthSessionService authSessionService,
        ActorPermissionService actorPermissionService
    ) {
        this.platformAuthenticationService = platformAuthenticationService;
        this.platformUserRepository = platformUserRepository;
        this.authSessionService = authSessionService;
        this.actorPermissionService = actorPermissionService;
    }

    @PostMapping(SaasAdminApiPaths.PUBLIC_BASE_PATH + "/auth/login")
    public PlatformAuthSessionResponse login(@Valid @RequestBody PlatformLoginRequest request) {
        return toAuthResponse(platformAuthenticationService.login(request.email(), request.password()));
    }

    @PostMapping(SaasAdminApiPaths.PUBLIC_BASE_PATH + "/auth/refresh")
    public PlatformAuthSessionResponse refresh(@Valid @RequestBody RefreshSessionRequest request) {
        return toAuthResponse(authSessionService.refreshPlatformSession(request.refreshToken()));
    }

    @GetMapping(SaasAdminApiPaths.ROOT + "/me")
    public PlatformActorResponse me() {
        String userId = actorPermissionService.requirePlatformActor().userId();
        PlatformUser user = platformUserRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("Platform user was not found"));
        return toActorResponse(user);
    }

    @PostMapping(SaasAdminApiPaths.ROOT + "/auth/logout")
    public void logout(@RequestHeader("Authorization") String authorizationHeader) {
        actorPermissionService.requirePlatformActor();
        authSessionService.revokeAccessToken(extractBearerToken(authorizationHeader));
    }

    private PlatformAuthSessionResponse toAuthResponse(PlatformSessionBundle sessionBundle) {
        return new PlatformAuthSessionResponse(
            sessionBundle.tokens().accessToken(),
            sessionBundle.tokens().refreshToken(),
            sessionBundle.tokens().accessExpiresAt(),
            sessionBundle.tokens().refreshExpiresAt(),
            toActorResponse(sessionBundle.user())
        );
    }

    private PlatformActorResponse toActorResponse(PlatformUser user) {
        return new PlatformActorResponse(
            user.getId(),
            user.getEmail(),
            user.getFullName(),
            user.getRoleCode().name(),
            com.mixmaster.platform.modules.identity.access.PlatformRolePermissionCatalog.permissionsFor(user.getRoleCode())
        );
    }

    private String extractBearerToken(String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            throw new IllegalArgumentException("Authorization header must include a bearer token");
        }

        return authorizationHeader.substring(7).trim();
    }
}
