package com.mixmaster.platform.modules.organization.services;

import com.mixmaster.platform.modules.identity.auth.services.CredentialSecurityService;
import com.mixmaster.platform.modules.identity.access.TenantRoleCatalog;
import com.mixmaster.platform.modules.identity.access.TenantRoleTemplate;
import com.mixmaster.platform.modules.identity.staff.models.Permission;
import com.mixmaster.platform.modules.identity.staff.models.Role;
import com.mixmaster.platform.modules.identity.staff.models.RolePermission;
import com.mixmaster.platform.modules.identity.staff.models.StaffAccessScopeType;
import com.mixmaster.platform.modules.identity.staff.models.StaffRoleAssignment;
import com.mixmaster.platform.modules.identity.staff.models.StaffRoleAssignmentStatus;
import com.mixmaster.platform.modules.identity.staff.models.StaffUser;
import com.mixmaster.platform.modules.identity.staff.models.StaffUserStatus;
import com.mixmaster.platform.modules.identity.staff.repositories.PermissionRepository;
import com.mixmaster.platform.modules.identity.staff.repositories.RolePermissionRepository;
import com.mixmaster.platform.modules.identity.staff.repositories.RoleRepository;
import com.mixmaster.platform.modules.identity.staff.repositories.StaffRoleAssignmentRepository;
import com.mixmaster.platform.modules.identity.staff.repositories.StaffUserRepository;
import com.mixmaster.platform.modules.organization.models.Brand;
import com.mixmaster.platform.modules.organization.models.Branch;
import com.mixmaster.platform.modules.organization.models.Tenant;
import com.mixmaster.platform.modules.organization.models.TenantOnboardingStage;
import com.mixmaster.platform.modules.organization.models.TenantStatus;
import com.mixmaster.platform.modules.organization.models.TenantSubscriptionStatus;
import com.mixmaster.platform.modules.organization.repositories.BrandRepository;
import com.mixmaster.platform.modules.organization.repositories.BranchRepository;
import com.mixmaster.platform.modules.organization.repositories.TenantRepository;
import com.mixmaster.platform.shared.utils.ChileanTaxIdUtils;
import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Pattern;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TenantProvisioningService {

    private static final Pattern NON_ALPHANUMERIC = Pattern.compile("[^a-z0-9]+");

    private final TenantRepository tenantRepository;
    private final BrandRepository brandRepository;
    private final BranchRepository branchRepository;
    private final StaffUserRepository staffUserRepository;
    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final RolePermissionRepository rolePermissionRepository;
    private final StaffRoleAssignmentRepository staffRoleAssignmentRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;
    private final CredentialSecurityService credentialSecurityService;

    public TenantProvisioningService(
        TenantRepository tenantRepository,
        BrandRepository brandRepository,
        BranchRepository branchRepository,
        StaffUserRepository staffUserRepository,
        RoleRepository roleRepository,
        PermissionRepository permissionRepository,
        RolePermissionRepository rolePermissionRepository,
        StaffRoleAssignmentRepository staffRoleAssignmentRepository,
        org.springframework.security.crypto.password.PasswordEncoder passwordEncoder,
        CredentialSecurityService credentialSecurityService
    ) {
        this.tenantRepository = tenantRepository;
        this.brandRepository = brandRepository;
        this.branchRepository = branchRepository;
        this.staffUserRepository = staffUserRepository;
        this.roleRepository = roleRepository;
        this.permissionRepository = permissionRepository;
        this.rolePermissionRepository = rolePermissionRepository;
        this.staffRoleAssignmentRepository = staffRoleAssignmentRepository;
        this.passwordEncoder = passwordEncoder;
        this.credentialSecurityService = credentialSecurityService;
    }

    @Transactional
    public TenantProvisioningResult createTenant(CreateTenantCommand command) {
        String tenantName = command.name().trim();
        String tenantCode = resolveTenantCode(command.code(), tenantName);
        String timezone = resolveText(command.timezone(), "America/Santiago");
        String brandName = resolveText(command.primaryBrandName(), tenantName);
        String brandCode = normalizeCode(resolveText(command.primaryBrandCode(), brandName));
        String branchName = resolveText(command.primaryBranchName(), "Casa Matriz");
        String branchCode = normalizeCode(resolveText(command.primaryBranchCode(), branchName));
        String currencyCode = resolveText(command.currencyCode(), "CLP").toUpperCase(Locale.ROOT);
        CredentialSecurityService.BootstrapCredential bootstrapCredential = credentialSecurityService.issueBootstrapCredential(
            command.ownerPassword(),
            command.ownerEmail(),
            command.ownerFullName()
        );

        if (command.code() != null && !command.code().isBlank() && tenantRepository.existsByCodeIgnoreCase(tenantCode)) {
            throw new IllegalArgumentException("Tenant code is already in use");
        }

        TenantStatus status = command.status() == null ? TenantStatus.TRIAL : command.status();
        Tenant tenant = new Tenant();
        tenant.setCode(tenantCode);
        tenant.setName(tenantName);
        tenant.setLegalName(resolveText(command.legalName(), tenantName));
        tenant.setTaxId(normalizeTaxId(command.taxId(), "Tenant tax id"));
        tenant.setTimezone(timezone);
        tenant.setStatus(status);
        tenant.setBillingEmail(resolveEmail(command.billingEmail(), command.ownerEmail()));
        tenant.setBillingPhone(resolveNullable(command.billingPhone()));
        tenant.setEconomicActivity(resolveNullable(command.economicActivity()));
        tenant.setSiiActivityCode(resolveNullable(command.siiActivityCode()));
        tenant.setTaxAddress(resolveNullable(command.taxAddress()));
        tenant.setTaxCommune(resolveNullable(command.taxCommune()));
        tenant.setTaxCity(resolveNullable(command.taxCity()));
        tenant.setLegalRepresentativeName(resolveNullable(command.legalRepresentativeName()));
        tenant.setLegalRepresentativeTaxId(normalizeTaxId(command.legalRepresentativeTaxId(), "Legal representative tax id"));
        tenant.setOnboardingStage(command.onboardingStage() == null ? TenantOnboardingStage.OWNER_BOOTSTRAPPED : command.onboardingStage());
        tenant.setSubscriptionPlanCode(resolveText(command.subscriptionPlanCode(), "FOUNDATION"));
        applyLifecycleDefaults(tenant, status, null, null);
        if (command.siiStartActivitiesVerified()) {
            tenant.setSiiStartActivitiesVerified(true);
            tenant.setSiiStartActivitiesVerifiedAt(OffsetDateTime.now());
        }
        tenantRepository.save(tenant);

        Brand brand = new Brand();
        brand.setTenantId(tenant.getId());
        brand.setCode(brandCode);
        brand.setName(brandName);
        brandRepository.save(brand);

        Branch branch = new Branch();
        branch.setTenantId(tenant.getId());
        branch.setBrand(brand);
        branch.setCode(branchCode);
        branch.setName(branchName);
        branch.setTimezone(timezone);
        branch.setCurrencyCode(currencyCode);
        branch.setAddressLine1(resolveNullable(command.primaryBranchAddressLine1()));
        branch.setCommune(resolveNullable(command.primaryBranchCommune()));
        branch.setCity(resolveNullable(command.primaryBranchCity()));
        branchRepository.save(branch);

        Map<String, Permission> permissionsByCode = permissionRepository.findAll().stream()
            .collect(HashMap::new, (map, permission) -> map.put(permission.getCode(), permission), HashMap::putAll);

        Map<String, Role> rolesByCode = new HashMap<>();
        for (TenantRoleTemplate template : TenantRoleCatalog.templates()) {
            Role role = new Role();
            role.setTenantId(tenant.getId());
            role.setCode(template.code());
            role.setName(template.name());
            role.setDescription(template.description());
            role.setActive(true);
            roleRepository.save(role);
            rolesByCode.put(template.code(), role);

            for (String permissionCode : template.permissions()) {
                Permission permission = permissionsByCode.get(permissionCode);
                if (permission == null) {
                    throw new IllegalStateException("Permission " + permissionCode + " is not synchronized");
                }

                RolePermission rolePermission = new RolePermission();
                rolePermission.setRole(role);
                rolePermission.setPermission(permission);
                rolePermissionRepository.save(rolePermission);
            }
        }

        StaffUser owner = new StaffUser();
        owner.setTenantId(tenant.getId());
        owner.setEmail(command.ownerEmail().trim().toLowerCase(Locale.ROOT));
        owner.setFullName(command.ownerFullName().trim());
        owner.setPasswordHash(passwordEncoder.encode(bootstrapCredential.password()));
        owner.setPasswordSetAt(OffsetDateTime.now());
        owner.setPasswordResetRequired(true);
        owner.setStatus(StaffUserStatus.ACTIVE);
        staffUserRepository.save(owner);

        StaffRoleAssignment ownerAssignment = new StaffRoleAssignment();
        ownerAssignment.setTenantId(tenant.getId());
        ownerAssignment.setStaffUser(owner);
        ownerAssignment.setRole(rolesByCode.get("TENANT_OWNER"));
        ownerAssignment.setScopeType(StaffAccessScopeType.TENANT);
        ownerAssignment.setStatus(StaffRoleAssignmentStatus.ACTIVE);
        staffRoleAssignmentRepository.save(ownerAssignment);

        return new TenantProvisioningResult(
            tenant.getId(),
            owner.getId(),
            owner.getEmail(),
            owner.getFullName(),
            bootstrapCredential.password(),
            bootstrapCredential.generated(),
            owner.isPasswordResetRequired()
        );
    }

    @Transactional
    public void updateTenantProfile(String tenantId, UpdateTenantCommand command) {
        Tenant tenant = tenantRepository.findById(tenantId)
            .orElseThrow(() -> new IllegalArgumentException("Tenant was not found"));

        if (command.code() != null) {
            String normalizedCode = normalizeCode(command.code());
            if (!tenant.getCode().equalsIgnoreCase(normalizedCode) && tenantRepository.existsByCodeIgnoreCase(normalizedCode)) {
                throw new IllegalArgumentException("Tenant code is already in use");
            }
            tenant.setCode(normalizedCode);
        }

        if (command.name() != null) {
            tenant.setName(command.name().trim());
        }

        if (command.legalName() != null) {
            tenant.setLegalName(resolveText(command.legalName(), tenant.getName()));
        }

        if (command.timezone() != null) {
            tenant.setTimezone(command.timezone().trim());
        }

        if (command.status() != null) {
            tenant.setStatus(command.status());
        }

        if (command.taxId() != null) {
            tenant.setTaxId(normalizeTaxId(command.taxId(), "Tenant tax id"));
        }
        if (command.billingEmail() != null) {
            tenant.setBillingEmail(resolveOptionalEmail(command.billingEmail(), tenant.getBillingEmail()));
        }
        if (command.billingPhone() != null) {
            tenant.setBillingPhone(resolveNullable(command.billingPhone()));
        }
        if (command.economicActivity() != null) {
            tenant.setEconomicActivity(resolveNullable(command.economicActivity()));
        }
        if (command.siiActivityCode() != null) {
            tenant.setSiiActivityCode(resolveNullable(command.siiActivityCode()));
        }
        if (command.taxAddress() != null) {
            tenant.setTaxAddress(resolveNullable(command.taxAddress()));
        }
        if (command.taxCommune() != null) {
            tenant.setTaxCommune(resolveNullable(command.taxCommune()));
        }
        if (command.taxCity() != null) {
            tenant.setTaxCity(resolveNullable(command.taxCity()));
        }
        if (command.legalRepresentativeName() != null) {
            tenant.setLegalRepresentativeName(resolveNullable(command.legalRepresentativeName()));
        }
        if (command.legalRepresentativeTaxId() != null) {
            tenant.setLegalRepresentativeTaxId(normalizeTaxId(command.legalRepresentativeTaxId(), "Legal representative tax id"));
        }
        if (command.onboardingStage() != null) {
            tenant.setOnboardingStage(command.onboardingStage());
        }
        if (command.subscriptionPlanCode() != null && !command.subscriptionPlanCode().isBlank()) {
            tenant.setSubscriptionPlanCode(command.subscriptionPlanCode().trim().toUpperCase(Locale.ROOT));
        }
        applyLifecycleDefaults(tenant, tenant.getStatus(), command.subscriptionStatus(), command.trialEndsAt());
        updateSiiVerification(tenant, command.siiStartActivitiesVerified());
        tenantRepository.save(tenant);

        Branch branch = resolvePrimaryBranch(tenantId, command.primaryBranchId());
        if (branch != null) {
            if (command.primaryBranchName() != null && !command.primaryBranchName().isBlank()) {
                branch.setName(command.primaryBranchName().trim());
            }
            if (command.primaryBranchCode() != null && !command.primaryBranchCode().isBlank()) {
                String normalizedBranchCode = normalizeCode(command.primaryBranchCode());
                if (!branch.getCode().equalsIgnoreCase(normalizedBranchCode)
                    && branchRepository.existsByTenantIdAndCodeIgnoreCaseAndDeletedAtIsNull(tenantId, normalizedBranchCode)) {
                    throw new IllegalArgumentException("Primary branch code is already in use");
                }
                branch.setCode(normalizedBranchCode);
            }
            if (command.currencyCode() != null && !command.currencyCode().isBlank()) {
                branch.setCurrencyCode(command.currencyCode().trim().toUpperCase(Locale.ROOT));
            }
            if (command.primaryBranchAddressLine1() != null) {
                branch.setAddressLine1(resolveNullable(command.primaryBranchAddressLine1()));
            }
            if (command.primaryBranchCommune() != null) {
                branch.setCommune(resolveNullable(command.primaryBranchCommune()));
            }
            if (command.primaryBranchCity() != null) {
                branch.setCity(resolveNullable(command.primaryBranchCity()));
            }
            if (command.timezone() != null && !command.timezone().isBlank()) {
                branch.setTimezone(command.timezone().trim());
            }
            branchRepository.save(branch);
        }
    }

    @Transactional
    public TenantProvisioningResult resetTenantOwnerCredential(String tenantId) {
        tenantRepository.findById(tenantId)
            .orElseThrow(() -> new IllegalArgumentException("Tenant was not found"));

        StaffUser owner = requireTenantOwner(tenantId);
        CredentialSecurityService.BootstrapCredential bootstrapCredential = credentialSecurityService.issueBootstrapCredential(
            null,
            owner.getEmail(),
            owner.getFullName()
        );

        owner.setPasswordHash(passwordEncoder.encode(bootstrapCredential.password()));
        owner.setPasswordSetAt(OffsetDateTime.now());
        owner.setPasswordResetRequired(true);
        owner.setFailedLoginAttempts(0);
        owner.setLockedUntil(null);
        owner.setStatus(StaffUserStatus.ACTIVE);
        staffUserRepository.save(owner);

        return new TenantProvisioningResult(
            tenantId,
            owner.getId(),
            owner.getEmail(),
            owner.getFullName(),
            bootstrapCredential.password(),
            bootstrapCredential.generated(),
            owner.isPasswordResetRequired()
        );
    }

    private String normalizeCode(String rawValue) {
        String normalized = NON_ALPHANUMERIC.matcher(rawValue.trim().toLowerCase(Locale.ROOT)).replaceAll("-");
        normalized = normalized.replaceAll("(^-+|-+$)", "");

        if (normalized.isBlank()) {
            throw new IllegalArgumentException("A valid code is required");
        }

        return normalized;
    }

    private String resolveTenantCode(String rawCode, String tenantName) {
        if (rawCode != null && !rawCode.isBlank()) {
            return normalizeCode(rawCode);
        }

        String baseCode = normalizeCode(tenantName);
        String candidate = baseCode;
        int suffix = 2;
        while (tenantRepository.existsByCodeIgnoreCase(candidate)) {
            candidate = baseCode + "-" + suffix;
            suffix++;
        }
        return candidate;
    }

    private void applyLifecycleDefaults(
        Tenant tenant,
        TenantStatus tenantStatus,
        TenantSubscriptionStatus requestedSubscriptionStatus,
        OffsetDateTime requestedTrialEndsAt
    ) {
        TenantSubscriptionStatus subscriptionStatus = requestedSubscriptionStatus;
        if (subscriptionStatus == null) {
            subscriptionStatus = switch (tenantStatus) {
                case TRIAL -> TenantSubscriptionStatus.TRIAL;
                case ACTIVE -> TenantSubscriptionStatus.ACTIVE;
                case SUSPENDED -> TenantSubscriptionStatus.SUSPENDED;
                case ARCHIVED -> TenantSubscriptionStatus.ARCHIVED;
            };
        }

        tenant.setSubscriptionStatus(subscriptionStatus);
        if (subscriptionStatus == TenantSubscriptionStatus.TRIAL) {
            tenant.setTrialEndsAt(requestedTrialEndsAt != null ? requestedTrialEndsAt : defaultTrialEndsAt(tenant));
        } else {
            tenant.setTrialEndsAt(requestedTrialEndsAt);
        }

        if (tenantStatus == TenantStatus.ACTIVE && tenant.getActivatedAt() == null) {
            tenant.setActivatedAt(OffsetDateTime.now());
        }

        if (tenantStatus == TenantStatus.SUSPENDED) {
            if (tenant.getSuspendedAt() == null) {
                tenant.setSuspendedAt(OffsetDateTime.now());
            }
        } else if (tenantStatus != TenantStatus.SUSPENDED) {
            tenant.setSuspendedAt(null);
        }
    }

    private OffsetDateTime defaultTrialEndsAt(Tenant tenant) {
        return tenant.getTrialEndsAt() != null ? tenant.getTrialEndsAt() : OffsetDateTime.now().plusDays(14);
    }

    private void updateSiiVerification(Tenant tenant, Boolean siiStartActivitiesVerified) {
        if (siiStartActivitiesVerified == null) {
            return;
        }

        tenant.setSiiStartActivitiesVerified(siiStartActivitiesVerified);
        tenant.setSiiStartActivitiesVerifiedAt(siiStartActivitiesVerified ? OffsetDateTime.now() : null);
    }

    private Branch resolvePrimaryBranch(String tenantId, String branchId) {
        if (branchId != null && !branchId.isBlank()) {
            return branchRepository.findByIdAndTenantIdAndDeletedAtIsNull(branchId, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Primary branch was not found"));
        }

        return branchRepository.findAllByTenantIdAndDeletedAtIsNullOrderByNameAsc(tenantId).stream().findFirst().orElse(null);
    }

    private String normalizeTaxId(String rawValue, String fieldLabel) {
        if (rawValue == null) {
            return null;
        }

        if (rawValue.isBlank()) {
            return null;
        }

        ChileanTaxIdUtils.validate(rawValue, fieldLabel);
        return ChileanTaxIdUtils.normalize(rawValue);
    }

    private String resolveNullable(String rawValue) {
        if (rawValue == null) {
            return null;
        }

        String trimmed = rawValue.trim();
        return trimmed.isBlank() ? null : trimmed;
    }

    private String resolveText(String rawValue, String fallback) {
        String trimmed = resolveNullable(rawValue);
        return trimmed == null ? fallback : trimmed;
    }

    private String resolveEmail(String rawValue, String fallback) {
        String selectedValue = resolveText(rawValue, fallback);
        return selectedValue.toLowerCase(Locale.ROOT);
    }

    private String resolveOptionalEmail(String rawValue, String currentValue) {
        if (rawValue == null) {
            return currentValue;
        }
        String trimmed = resolveNullable(rawValue);
        return trimmed == null ? null : trimmed.toLowerCase(Locale.ROOT);
    }

    private StaffUser requireTenantOwner(String tenantId) {
        Optional<Role> ownerRole = roleRepository.findByTenantIdAndCodeAndDeletedAtIsNull(tenantId, "TENANT_OWNER");
        if (ownerRole.isEmpty()) {
            throw new IllegalArgumentException("Tenant owner role was not found");
        }

        return staffRoleAssignmentRepository.findAllByTenantIdAndRole_IdAndStatus(
            tenantId,
            ownerRole.get().getId(),
            StaffRoleAssignmentStatus.ACTIVE
        ).stream()
            .map(StaffRoleAssignment::getStaffUser)
            .findFirst()
            .orElseThrow(() -> new IllegalArgumentException("Tenant owner was not found"));
    }

    public record CreateTenantCommand(
        String name,
        String code,
        String timezone,
        TenantStatus status,
        String primaryBrandName,
        String primaryBrandCode,
        String primaryBranchName,
        String primaryBranchCode,
        String currencyCode,
        String primaryBranchAddressLine1,
        String primaryBranchCommune,
        String primaryBranchCity,
        String ownerEmail,
        String ownerFullName,
        String ownerPassword,
        String legalName,
        String taxId,
        String billingEmail,
        String billingPhone,
        String economicActivity,
        String siiActivityCode,
        String taxAddress,
        String taxCommune,
        String taxCity,
        String legalRepresentativeName,
        String legalRepresentativeTaxId,
        String subscriptionPlanCode,
        TenantOnboardingStage onboardingStage,
        boolean siiStartActivitiesVerified
    ) {
    }

    public record UpdateTenantCommand(
        String name,
        String code,
        String timezone,
        TenantStatus status,
        String legalName,
        String taxId,
        String billingEmail,
        String billingPhone,
        String economicActivity,
        String siiActivityCode,
        String taxAddress,
        String taxCommune,
        String taxCity,
        String legalRepresentativeName,
        String legalRepresentativeTaxId,
        String subscriptionPlanCode,
        TenantSubscriptionStatus subscriptionStatus,
        OffsetDateTime trialEndsAt,
        TenantOnboardingStage onboardingStage,
        Boolean siiStartActivitiesVerified,
        String primaryBranchId,
        String primaryBranchName,
        String primaryBranchCode,
        String currencyCode,
        String primaryBranchAddressLine1,
        String primaryBranchCommune,
        String primaryBranchCity
    ) {
    }

    public record TenantProvisioningResult(
        String tenantId,
        String ownerUserId,
        String ownerEmail,
        String ownerFullName,
        String bootstrapPassword,
        boolean bootstrapPasswordGenerated,
        boolean passwordResetRequired
    ) {
    }
}
