package com.mixmaster.platform.modules.identity.auth.services;

import com.mixmaster.platform.modules.identity.staff.models.StaffUser;
import com.mixmaster.platform.modules.identity.staff.models.StaffUserStatus;
import com.mixmaster.platform.modules.identity.staff.repositories.StaffUserRepository;
import com.mixmaster.platform.modules.identity.staff.services.StaffAccessProfile;
import com.mixmaster.platform.modules.identity.staff.services.StaffAccessProfileService;
import com.mixmaster.platform.modules.organization.models.Tenant;
import com.mixmaster.platform.modules.organization.models.TenantStatus;
import com.mixmaster.platform.modules.organization.repositories.TenantRepository;
import java.time.OffsetDateTime;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class StaffAuthenticationService {

    private static final int MAX_FAILED_ATTEMPTS = 5;

    private final TenantRepository tenantRepository;
    private final StaffUserRepository staffUserRepository;
    private final StaffAccessProfileService staffAccessProfileService;
    private final PasswordEncoder passwordEncoder;
    private final AuthSessionService authSessionService;

    public StaffAuthenticationService(
        TenantRepository tenantRepository,
        StaffUserRepository staffUserRepository,
        StaffAccessProfileService staffAccessProfileService,
        PasswordEncoder passwordEncoder,
        AuthSessionService authSessionService
    ) {
        this.tenantRepository = tenantRepository;
        this.staffUserRepository = staffUserRepository;
        this.staffAccessProfileService = staffAccessProfileService;
        this.passwordEncoder = passwordEncoder;
        this.authSessionService = authSessionService;
    }

    @Transactional
    public StaffSessionBundle login(
        String tenantCode,
        String email,
        String password,
        String requestedActiveBranchId
    ) {
        Tenant tenant = tenantRepository.findByCodeIgnoreCase(tenantCode)
            .orElseThrow(() -> new BadCredentialsException("Tenant credentials are invalid"));

        if (tenant.getStatus() != TenantStatus.ACTIVE && tenant.getStatus() != TenantStatus.TRIAL) {
            throw new BadCredentialsException("Tenant is not active");
        }

        StaffUser user = staffUserRepository.findByTenantIdAndEmailIgnoreCaseAndDeletedAtIsNull(tenant.getId(), email)
            .orElseThrow(() -> new BadCredentialsException("Tenant credentials are invalid"));

        validateStaffUser(user);

        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            registerFailedAttempt(user);
            throw new BadCredentialsException("Tenant credentials are invalid");
        }

        StaffAccessProfile accessProfile = staffAccessProfileService.buildProfile(user);
        if (accessProfile.roleCodes().isEmpty()) {
            throw new BadCredentialsException("Staff user does not have active permissions");
        }

        user.setFailedLoginAttempts(0);
        user.setLockedUntil(null);
        user.setStatus(StaffUserStatus.ACTIVE);
        user.setLastLoginAt(OffsetDateTime.now());
        staffUserRepository.save(user);

        return authSessionService.createStaffSession(user, tenant, accessProfile, requestedActiveBranchId);
    }

    private void validateStaffUser(StaffUser user) {
        OffsetDateTime now = OffsetDateTime.now();

        if (user.getStatus() == StaffUserStatus.DISABLED) {
            throw new BadCredentialsException("Staff user is disabled");
        }

        if (user.getLockedUntil() != null && user.getLockedUntil().isAfter(now)) {
            throw new BadCredentialsException("Staff user is temporarily locked");
        }

        if (user.getStatus() == StaffUserStatus.LOCKED) {
            user.setStatus(StaffUserStatus.ACTIVE);
            user.setLockedUntil(null);
            staffUserRepository.save(user);
        }
    }

    private void registerFailedAttempt(StaffUser user) {
        int failedAttempts = user.getFailedLoginAttempts() + 1;
        user.setFailedLoginAttempts(failedAttempts);

        if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
            user.setStatus(StaffUserStatus.LOCKED);
            user.setLockedUntil(OffsetDateTime.now().plusMinutes(15));
        }

        staffUserRepository.save(user);
    }
}
