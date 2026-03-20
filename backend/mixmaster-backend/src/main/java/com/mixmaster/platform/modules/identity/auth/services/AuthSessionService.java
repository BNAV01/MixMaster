package com.mixmaster.platform.modules.identity.auth.services;

import com.mixmaster.platform.modules.identity.access.PlatformRolePermissionCatalog;
import com.mixmaster.platform.modules.identity.auth.models.AuthSession;
import com.mixmaster.platform.modules.identity.auth.models.AuthSessionAudience;
import com.mixmaster.platform.modules.identity.auth.repositories.AuthSessionRepository;
import com.mixmaster.platform.modules.identity.platform.models.PlatformUser;
import com.mixmaster.platform.modules.identity.platform.models.PlatformUserStatus;
import com.mixmaster.platform.modules.identity.platform.repositories.PlatformUserRepository;
import com.mixmaster.platform.modules.identity.staff.models.StaffUser;
import com.mixmaster.platform.modules.identity.staff.models.StaffUserStatus;
import com.mixmaster.platform.modules.identity.staff.repositories.StaffUserRepository;
import com.mixmaster.platform.modules.identity.staff.services.StaffAccessProfile;
import com.mixmaster.platform.modules.identity.staff.services.StaffAccessProfileService;
import com.mixmaster.platform.modules.organization.models.Tenant;
import com.mixmaster.platform.modules.organization.repositories.TenantRepository;
import com.mixmaster.platform.shared.config.ApplicationProperties;
import com.mixmaster.platform.shared.security.AuthenticatedActor;
import java.time.OffsetDateTime;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthSessionService {

    private final AuthSessionRepository authSessionRepository;
    private final PlatformUserRepository platformUserRepository;
    private final StaffUserRepository staffUserRepository;
    private final TenantRepository tenantRepository;
    private final StaffAccessProfileService staffAccessProfileService;
    private final SessionTokenCodec sessionTokenCodec;
    private final ApplicationProperties applicationProperties;

    public AuthSessionService(
        AuthSessionRepository authSessionRepository,
        PlatformUserRepository platformUserRepository,
        StaffUserRepository staffUserRepository,
        TenantRepository tenantRepository,
        StaffAccessProfileService staffAccessProfileService,
        SessionTokenCodec sessionTokenCodec,
        ApplicationProperties applicationProperties
    ) {
        this.authSessionRepository = authSessionRepository;
        this.platformUserRepository = platformUserRepository;
        this.staffUserRepository = staffUserRepository;
        this.tenantRepository = tenantRepository;
        this.staffAccessProfileService = staffAccessProfileService;
        this.sessionTokenCodec = sessionTokenCodec;
        this.applicationProperties = applicationProperties;
    }

    @Transactional
    public PlatformSessionBundle createPlatformSession(PlatformUser user) {
        AuthTokens tokens = issueTokens();
        AuthSession session = new AuthSession();
        session.setAudience(AuthSessionAudience.PLATFORM);
        session.setPlatformUser(user);
        session.setAccessTokenHash(sessionTokenCodec.hash(tokens.accessToken()));
        session.setRefreshTokenHash(sessionTokenCodec.hash(tokens.refreshToken()));
        session.setAccessExpiresAt(tokens.accessExpiresAt());
        session.setRefreshExpiresAt(tokens.refreshExpiresAt());
        authSessionRepository.save(session);
        return new PlatformSessionBundle(tokens, user);
    }

    @Transactional
    public StaffSessionBundle createStaffSession(
        StaffUser user,
        Tenant tenant,
        StaffAccessProfile accessProfile,
        String requestedActiveBranchId
    ) {
        String activeBranchId = resolveActiveBranchId(accessProfile, requestedActiveBranchId);
        AuthTokens tokens = issueTokens();
        AuthSession session = new AuthSession();
        session.setAudience(AuthSessionAudience.STAFF);
        session.setStaffUser(user);
        session.setTenantId(user.getTenantId());
        session.setActiveBranchId(activeBranchId);
        session.setAccessTokenHash(sessionTokenCodec.hash(tokens.accessToken()));
        session.setRefreshTokenHash(sessionTokenCodec.hash(tokens.refreshToken()));
        session.setAccessExpiresAt(tokens.accessExpiresAt());
        session.setRefreshExpiresAt(tokens.refreshExpiresAt());
        authSessionRepository.save(session);
        return new StaffSessionBundle(tokens, user, tenant, accessProfile, activeBranchId);
    }

    @Transactional
    public PlatformSessionBundle refreshPlatformSession(String refreshToken) {
        AuthSession session = requireRefreshSession(refreshToken, AuthSessionAudience.PLATFORM);
        PlatformUser user = requireActivePlatformUser(session.getPlatformUser().getId());
        AuthTokens tokens = rotateTokens(session);
        return new PlatformSessionBundle(tokens, user);
    }

    @Transactional
    public StaffSessionBundle refreshStaffSession(String refreshToken) {
        AuthSession session = requireRefreshSession(refreshToken, AuthSessionAudience.STAFF);
        StaffUser user = requireActiveStaffUser(session.getStaffUser().getId(), session.getTenantId());
        Tenant tenant = requireTenant(session.getTenantId());
        StaffAccessProfile accessProfile = requireAccessProfile(user);
        String activeBranchId = resolveActiveBranchId(accessProfile, session.getActiveBranchId());
        session.setActiveBranchId(activeBranchId);
        AuthTokens tokens = rotateTokens(session);
        return new StaffSessionBundle(tokens, user, tenant, accessProfile, activeBranchId);
    }

    @Transactional
    public void revokeAccessToken(String accessToken) {
        String accessTokenHash = sessionTokenCodec.hash(accessToken);
        authSessionRepository.findByAccessTokenHash(accessTokenHash).ifPresent(session -> {
            session.setRevokedAt(OffsetDateTime.now());
            authSessionRepository.save(session);
        });
    }

    @Transactional(readOnly = true)
    public AuthenticatedActor authenticateAccessToken(String accessToken) {
        AuthSession session = authSessionRepository.findByAccessTokenHash(sessionTokenCodec.hash(accessToken))
            .orElseThrow(() -> new BadCredentialsException("Access session was not found"));

        OffsetDateTime now = OffsetDateTime.now();
        if (session.getRevokedAt() != null || session.getAccessExpiresAt().isBefore(now)) {
            throw new BadCredentialsException("Access session is no longer valid");
        }

        if (session.getAudience() == AuthSessionAudience.PLATFORM) {
            PlatformUser user = requireActivePlatformUser(session.getPlatformUser().getId());
            Set<String> permissions = PlatformRolePermissionCatalog.permissionsFor(user.getRoleCode());
            return new AuthenticatedActor(
                AuthSessionAudience.PLATFORM,
                user.getId(),
                user.getFullName(),
                null,
                null,
                permissions,
                Set.of(user.getRoleCode().name()),
                Set.of()
            );
        }

        if (session.getAudience() == AuthSessionAudience.STAFF) {
            StaffUser user = requireActiveStaffUser(session.getStaffUser().getId(), session.getTenantId());
            StaffAccessProfile accessProfile = requireAccessProfile(user);
            String activeBranchId = resolveActiveBranchId(accessProfile, session.getActiveBranchId());
            return new AuthenticatedActor(
                AuthSessionAudience.STAFF,
                user.getId(),
                user.getFullName(),
                user.getTenantId(),
                activeBranchId,
                accessProfile.permissions(),
                accessProfile.roleCodes(),
                accessProfile.accessibleBranches().stream().map(branch -> branch.branchId()).collect(Collectors.toSet())
            );
        }

        throw new BadCredentialsException("Unsupported session audience");
    }

    private AuthSession requireRefreshSession(String refreshToken, AuthSessionAudience audience) {
        AuthSession session = authSessionRepository.findByRefreshTokenHash(sessionTokenCodec.hash(refreshToken))
            .orElseThrow(() -> new BadCredentialsException("Refresh session was not found"));

        OffsetDateTime now = OffsetDateTime.now();
        if (session.getAudience() != audience || session.getRevokedAt() != null || session.getRefreshExpiresAt().isBefore(now)) {
            throw new BadCredentialsException("Refresh session is no longer valid");
        }

        return session;
    }

    private PlatformUser requireActivePlatformUser(String userId) {
        PlatformUser user = platformUserRepository.findById(userId)
            .orElseThrow(() -> new BadCredentialsException("Platform user was not found"));

        if (user.getStatus() != PlatformUserStatus.ACTIVE) {
            throw new BadCredentialsException("Platform user is not active");
        }

        return user;
    }

    private StaffUser requireActiveStaffUser(String userId, String tenantId) {
        StaffUser user = staffUserRepository.findByIdAndTenantIdAndDeletedAtIsNull(userId, tenantId)
            .orElseThrow(() -> new BadCredentialsException("Staff user was not found"));

        if (user.getStatus() != StaffUserStatus.ACTIVE) {
            throw new BadCredentialsException("Staff user is not active");
        }

        return user;
    }

    private Tenant requireTenant(String tenantId) {
        return tenantRepository.findById(tenantId)
            .orElseThrow(() -> new BadCredentialsException("Tenant was not found"));
    }

    private StaffAccessProfile requireAccessProfile(StaffUser user) {
        StaffAccessProfile accessProfile = staffAccessProfileService.buildProfile(user);
        if (accessProfile.roleCodes().isEmpty()) {
            throw new BadCredentialsException("Staff user does not have active role assignments");
        }
        return accessProfile;
    }

    private AuthTokens rotateTokens(AuthSession session) {
        AuthTokens tokens = issueTokens();
        session.setAccessTokenHash(sessionTokenCodec.hash(tokens.accessToken()));
        session.setRefreshTokenHash(sessionTokenCodec.hash(tokens.refreshToken()));
        session.setAccessExpiresAt(tokens.accessExpiresAt());
        session.setRefreshExpiresAt(tokens.refreshExpiresAt());
        authSessionRepository.save(session);
        return tokens;
    }

    private AuthTokens issueTokens() {
        OffsetDateTime now = OffsetDateTime.now();
        ApplicationProperties.Security.Token tokenProperties = applicationProperties.getSecurity().getToken();
        return new AuthTokens(
            sessionTokenCodec.generateToken(),
            sessionTokenCodec.generateToken(),
            now.plus(tokenProperties.getAccessTtl()),
            now.plus(tokenProperties.getRefreshTtl())
        );
    }

    private String resolveActiveBranchId(StaffAccessProfile accessProfile, String requestedActiveBranchId) {
        if (requestedActiveBranchId != null && accessProfile.accessibleBranches().stream()
            .anyMatch(branch -> branch.branchId().equals(requestedActiveBranchId))) {
            return requestedActiveBranchId;
        }

        return accessProfile.defaultBranchId();
    }
}
