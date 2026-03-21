package com.mixmaster.platform.modules.identity.auth.services;

import com.mixmaster.platform.modules.identity.access.PermissionCatalog;
import com.mixmaster.platform.modules.identity.platform.models.PlatformUser;
import com.mixmaster.platform.modules.identity.platform.models.PlatformUserRole;
import com.mixmaster.platform.modules.identity.platform.models.PlatformUserStatus;
import com.mixmaster.platform.modules.identity.platform.repositories.PlatformUserRepository;
import com.mixmaster.platform.modules.identity.staff.models.Permission;
import com.mixmaster.platform.modules.identity.staff.repositories.PermissionRepository;
import com.mixmaster.platform.shared.config.ApplicationProperties;
import java.time.OffsetDateTime;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
public class IdentityBootstrapService {

    private final PermissionRepository permissionRepository;
    private final PlatformUserRepository platformUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final ApplicationProperties applicationProperties;

    public IdentityBootstrapService(
        PermissionRepository permissionRepository,
        PlatformUserRepository platformUserRepository,
        PasswordEncoder passwordEncoder,
        ApplicationProperties applicationProperties
    ) {
        this.permissionRepository = permissionRepository;
        this.platformUserRepository = platformUserRepository;
        this.passwordEncoder = passwordEncoder;
        this.applicationProperties = applicationProperties;
    }

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void initializeIdentityFoundation() {
        synchronizePermissions();
        ensureBootstrapPlatformAdmin();
    }

    private void synchronizePermissions() {
        for (var definition : PermissionCatalog.definitions()) {
            Permission permission = permissionRepository.findByCode(definition.code()).orElseGet(Permission::new);
            permission.setCode(definition.code());
            permission.setDescription(definition.description());
            permissionRepository.save(permission);
        }
    }

    private void ensureBootstrapPlatformAdmin() {
        ApplicationProperties.Security.Bootstrap bootstrap = applicationProperties.getSecurity().getBootstrap();

        if (!bootstrap.isEnabled()) {
            return;
        }

        if (!StringUtils.hasText(bootstrap.getPlatformUsername()) || !StringUtils.hasText(bootstrap.getPlatformPassword())) {
            return;
        }

        String platformEmail = bootstrap.getPlatformUsername().trim().toLowerCase();
        PlatformUser platformUser = platformUserRepository.findByEmailIgnoreCase(platformEmail)
            .orElseGet(PlatformUser::new);

        platformUser.setEmail(platformEmail);
        platformUser.setFullName(bootstrap.getPlatformFullName());
        platformUser.setPasswordHash(passwordEncoder.encode(bootstrap.getPlatformPassword()));
        platformUser.setRoleCode(PlatformUserRole.SAAS_SUPER_ADMIN);
        platformUser.setStatus(PlatformUserStatus.ACTIVE);
        platformUser.setPasswordSetAt(OffsetDateTime.now());
        platformUser.setFailedLoginAttempts(0);
        platformUser.setLockedUntil(null);
        platformUserRepository.save(platformUser);
    }
}
