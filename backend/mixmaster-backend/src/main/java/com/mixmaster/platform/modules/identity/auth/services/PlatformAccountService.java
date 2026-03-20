package com.mixmaster.platform.modules.identity.auth.services;

import com.mixmaster.platform.modules.identity.auth.models.AuthSessionAudience;
import com.mixmaster.platform.modules.identity.auth.models.AuthSession;
import com.mixmaster.platform.modules.identity.auth.repositories.AuthSessionRepository;
import com.mixmaster.platform.modules.identity.platform.models.PlatformUser;
import com.mixmaster.platform.modules.identity.platform.repositories.PlatformUserRepository;
import java.time.OffsetDateTime;
import java.util.List;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PlatformAccountService {

    private final PlatformUserRepository platformUserRepository;
    private final AuthSessionRepository authSessionRepository;
    private final PasswordEncoder passwordEncoder;
    private final CredentialSecurityService credentialSecurityService;

    public PlatformAccountService(
        PlatformUserRepository platformUserRepository,
        AuthSessionRepository authSessionRepository,
        PasswordEncoder passwordEncoder,
        CredentialSecurityService credentialSecurityService
    ) {
        this.platformUserRepository = platformUserRepository;
        this.authSessionRepository = authSessionRepository;
        this.passwordEncoder = passwordEncoder;
        this.credentialSecurityService = credentialSecurityService;
    }

    @Transactional(readOnly = true)
    public AccountProfileView loadProfile(String platformUserId) {
        PlatformUser user = requireUser(platformUserId);
        long activeSessions = authSessionRepository.countByAudienceAndPlatformUser_IdAndRevokedAtIsNullAndAccessExpiresAtAfter(
            AuthSessionAudience.PLATFORM,
            platformUserId,
            OffsetDateTime.now()
        );

        return new AccountProfileView(
            user.getId(),
            user.getEmail(),
            user.getFullName(),
            user.getRoleCode().name(),
            user.getStatus().name(),
            user.getPasswordSetAt(),
            user.getLastLoginAt(),
            activeSessions
        );
    }

    @Transactional
    public AccountProfileView changePassword(String platformUserId, String currentPassword, String newPassword) {
        PlatformUser user = requireUser(platformUserId);
        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            throw new BadCredentialsException("Current platform password is invalid");
        }

        credentialSecurityService.validatePassword(newPassword, user.getEmail(), user.getFullName());
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setPasswordSetAt(OffsetDateTime.now());
        user.setFailedLoginAttempts(0);
        user.setLockedUntil(null);
        platformUserRepository.save(user);

        List<AuthSession> activeSessions = authSessionRepository.findAllByAudienceAndPlatformUser_IdAndRevokedAtIsNull(
            AuthSessionAudience.PLATFORM,
            platformUserId
        );
        OffsetDateTime now = OffsetDateTime.now();
        activeSessions.forEach(session -> session.setRevokedAt(now));
        authSessionRepository.saveAll(activeSessions);

        return loadProfile(platformUserId);
    }

    private PlatformUser requireUser(String platformUserId) {
        return platformUserRepository.findById(platformUserId)
            .orElseThrow(() -> new IllegalArgumentException("Platform user was not found"));
    }

    public record AccountProfileView(
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
}
