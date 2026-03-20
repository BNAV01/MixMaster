package com.mixmaster.platform.modules.identity.auth.services;

import com.mixmaster.platform.modules.identity.platform.models.PlatformUser;
import com.mixmaster.platform.modules.identity.platform.models.PlatformUserStatus;
import com.mixmaster.platform.modules.identity.platform.repositories.PlatformUserRepository;
import java.time.OffsetDateTime;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PlatformAuthenticationService {

    private static final int MAX_FAILED_ATTEMPTS = 5;

    private final PlatformUserRepository platformUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthSessionService authSessionService;

    public PlatformAuthenticationService(
        PlatformUserRepository platformUserRepository,
        PasswordEncoder passwordEncoder,
        AuthSessionService authSessionService
    ) {
        this.platformUserRepository = platformUserRepository;
        this.passwordEncoder = passwordEncoder;
        this.authSessionService = authSessionService;
    }

    @Transactional
    public PlatformSessionBundle login(String email, String password) {
        PlatformUser user = platformUserRepository.findByEmailIgnoreCase(email)
            .orElseThrow(() -> new BadCredentialsException("Invalid platform credentials"));

        validatePlatformUser(user);

        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            registerFailedAttempt(user);
            throw new BadCredentialsException("Invalid platform credentials");
        }

        user.setFailedLoginAttempts(0);
        user.setLockedUntil(null);
        user.setLastLoginAt(OffsetDateTime.now());
        platformUserRepository.save(user);

        return authSessionService.createPlatformSession(user);
    }

    private void validatePlatformUser(PlatformUser user) {
        OffsetDateTime now = OffsetDateTime.now();

        if (user.getStatus() == PlatformUserStatus.DISABLED) {
            throw new BadCredentialsException("Platform user is disabled");
        }

        if (user.getLockedUntil() != null && user.getLockedUntil().isAfter(now)) {
            throw new BadCredentialsException("Platform user is temporarily locked");
        }

        if (user.getStatus() == PlatformUserStatus.LOCKED) {
            user.setStatus(PlatformUserStatus.ACTIVE);
            user.setLockedUntil(null);
            platformUserRepository.save(user);
        }
    }

    private void registerFailedAttempt(PlatformUser user) {
        int failedAttempts = user.getFailedLoginAttempts() + 1;
        user.setFailedLoginAttempts(failedAttempts);

        if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
            user.setStatus(PlatformUserStatus.LOCKED);
            user.setLockedUntil(OffsetDateTime.now().plusMinutes(15));
        }

        platformUserRepository.save(user);
    }
}
