package com.mixmaster.platform.modules.identity.staff.services;

import com.mixmaster.platform.modules.identity.auth.services.CredentialSecurityService;
import com.mixmaster.platform.modules.identity.staff.models.Role;
import com.mixmaster.platform.modules.identity.staff.models.RolePermission;
import com.mixmaster.platform.modules.identity.staff.models.StaffAccessScopeType;
import com.mixmaster.platform.modules.identity.staff.models.StaffRoleAssignment;
import com.mixmaster.platform.modules.identity.staff.models.StaffRoleAssignmentStatus;
import com.mixmaster.platform.modules.identity.staff.models.StaffUser;
import com.mixmaster.platform.modules.identity.staff.models.StaffUserStatus;
import com.mixmaster.platform.modules.identity.staff.repositories.RolePermissionRepository;
import com.mixmaster.platform.modules.identity.staff.repositories.RoleRepository;
import com.mixmaster.platform.modules.identity.staff.repositories.StaffRoleAssignmentRepository;
import com.mixmaster.platform.modules.identity.staff.repositories.StaffUserRepository;
import com.mixmaster.platform.modules.organization.models.Brand;
import com.mixmaster.platform.modules.organization.models.Branch;
import com.mixmaster.platform.modules.organization.repositories.BrandRepository;
import com.mixmaster.platform.modules.organization.repositories.BranchRepository;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TenantStaffManagementService {

    private final StaffUserRepository staffUserRepository;
    private final RoleRepository roleRepository;
    private final RolePermissionRepository rolePermissionRepository;
    private final StaffRoleAssignmentRepository staffRoleAssignmentRepository;
    private final BrandRepository brandRepository;
    private final BranchRepository branchRepository;
    private final StaffAccessProfileService staffAccessProfileService;
    private final PasswordEncoder passwordEncoder;
    private final CredentialSecurityService credentialSecurityService;

    public TenantStaffManagementService(
        StaffUserRepository staffUserRepository,
        RoleRepository roleRepository,
        RolePermissionRepository rolePermissionRepository,
        StaffRoleAssignmentRepository staffRoleAssignmentRepository,
        BrandRepository brandRepository,
        BranchRepository branchRepository,
        StaffAccessProfileService staffAccessProfileService,
        PasswordEncoder passwordEncoder,
        CredentialSecurityService credentialSecurityService
    ) {
        this.staffUserRepository = staffUserRepository;
        this.roleRepository = roleRepository;
        this.rolePermissionRepository = rolePermissionRepository;
        this.staffRoleAssignmentRepository = staffRoleAssignmentRepository;
        this.brandRepository = brandRepository;
        this.branchRepository = branchRepository;
        this.staffAccessProfileService = staffAccessProfileService;
        this.passwordEncoder = passwordEncoder;
        this.credentialSecurityService = credentialSecurityService;
    }

    @Transactional(readOnly = true)
    public List<RoleView> listRoles(String tenantId) {
        return roleRepository.findAllByTenantIdAndActiveIsTrueAndDeletedAtIsNullOrderByNameAsc(tenantId).stream()
            .map(role -> new RoleView(
                role.getId(),
                role.getCode(),
                role.getName(),
                role.getDescription(),
                role.isActive(),
                rolePermissionRepository.findAllByRole_Id(role.getId()).stream()
                    .map(RolePermission::getPermission)
                    .map(permission -> permission.getCode())
                    .sorted()
                    .toList()
            ))
            .toList();
    }

    @Transactional(readOnly = true)
    public List<StaffUserView> listStaffUsers(String tenantId, Set<String> actorAccessibleBranchIds) {
        List<StaffUser> staffUsers = staffUserRepository.findAllByTenantIdAndDeletedAtIsNullOrderByFullNameAsc(tenantId);
        Map<String, StaffAccessProfile> accessProfiles = staffUsers.isEmpty()
            ? Map.of()
            : staffAccessProfileService.buildProfiles(staffUsers);
        List<StaffRoleAssignment> assignments = staffUsers.isEmpty()
            ? List.of()
            : staffRoleAssignmentRepository.findAllByTenantIdAndStaffUserIdInAndStatus(
                tenantId,
                staffUsers.stream().map(StaffUser::getId).toList(),
                StaffRoleAssignmentStatus.ACTIVE
            );
        Map<String, List<StaffRoleAssignment>> assignmentsByUserId = assignments.stream()
            .collect(LinkedHashMap::new, (map, assignment) -> map
                .computeIfAbsent(assignment.getStaffUser().getId(), ignored -> new ArrayList<>())
                .add(assignment), LinkedHashMap::putAll);

        return staffUsers.stream()
            .filter(staffUser -> isVisibleToActor(accessProfiles.get(staffUser.getId()), actorAccessibleBranchIds))
            .map(staffUser -> toStaffUserView(
                staffUser,
                accessProfiles.get(staffUser.getId()),
                assignmentsByUserId.getOrDefault(staffUser.getId(), List.of())
            ))
            .toList();
    }

    @Transactional
    public StaffUserView createStaffUser(String tenantId, Set<String> actorAccessibleBranchIds, CreateStaffUserCommand command) {
        if (staffUserRepository.existsByTenantIdAndEmailIgnoreCaseAndDeletedAtIsNull(tenantId, command.email())) {
            throw new IllegalArgumentException("Staff email is already in use for this tenant");
        }

        requireAssignableScopes(tenantId, actorAccessibleBranchIds, command.assignments());
        credentialSecurityService.validatePassword(command.password(), command.email(), command.fullName());

        StaffUser staffUser = new StaffUser();
        staffUser.setTenantId(tenantId);
        staffUser.setEmail(command.email().trim().toLowerCase(Locale.ROOT));
        staffUser.setFullName(command.fullName().trim());
        staffUser.setPasswordHash(passwordEncoder.encode(command.password()));
        staffUser.setPasswordSetAt(OffsetDateTime.now());
        staffUser.setPasswordResetRequired(command.passwordResetRequired());
        staffUser.setStatus(command.status());
        staffUserRepository.save(staffUser);

        List<StaffRoleAssignment> assignments = materializeAssignments(tenantId, staffUser, command.assignments());
        staffRoleAssignmentRepository.saveAll(assignments);

        return toStaffUserView(staffUser, staffAccessProfileService.buildProfile(staffUser), assignments);
    }

    @Transactional
    public StaffUserView updateStaffUserStatus(String tenantId, Set<String> actorAccessibleBranchIds, String userId, StaffUserStatus status) {
        StaffUser staffUser = requireMutableStaffUser(tenantId, actorAccessibleBranchIds, userId);
        staffUser.setStatus(status);
        if (status != StaffUserStatus.LOCKED) {
            staffUser.setLockedUntil(null);
        }
        staffUserRepository.save(staffUser);
        return toStaffUserView(staffUser, staffAccessProfileService.buildProfile(staffUser), activeAssignments(tenantId, userId));
    }

    @Transactional
    public StaffUserView updateStaffUserAccess(
        String tenantId,
        Set<String> actorAccessibleBranchIds,
        String userId,
        UpdateStaffUserAccessCommand command
    ) {
        requireAssignableScopes(tenantId, actorAccessibleBranchIds, command.assignments());
        StaffUser staffUser = requireMutableStaffUser(tenantId, actorAccessibleBranchIds, userId);

        staffUser.setStatus(command.status());
        staffUser.setPasswordResetRequired(command.passwordResetRequired());
        if (command.status() != StaffUserStatus.LOCKED) {
            staffUser.setLockedUntil(null);
        }
        staffUserRepository.save(staffUser);

        List<StaffRoleAssignment> currentAssignments = activeAssignments(tenantId, userId);
        currentAssignments.forEach(assignment -> assignment.setStatus(StaffRoleAssignmentStatus.REVOKED));
        staffRoleAssignmentRepository.saveAll(currentAssignments);

        List<StaffRoleAssignment> nextAssignments = materializeAssignments(tenantId, staffUser, command.assignments());
        staffRoleAssignmentRepository.saveAll(nextAssignments);

        return toStaffUserView(staffUser, staffAccessProfileService.buildProfile(staffUser), nextAssignments);
    }

    @Transactional
    public StaffUserView resetPassword(
        String tenantId,
        Set<String> actorAccessibleBranchIds,
        String userId,
        String newPassword,
        boolean requireReset
    ) {
        StaffUser staffUser = requireMutableStaffUser(tenantId, actorAccessibleBranchIds, userId);
        credentialSecurityService.validatePassword(newPassword, staffUser.getEmail(), staffUser.getFullName());
        staffUser.setPasswordHash(passwordEncoder.encode(newPassword));
        staffUser.setPasswordSetAt(OffsetDateTime.now());
        staffUser.setPasswordResetRequired(requireReset);
        staffUser.setFailedLoginAttempts(0);
        staffUser.setLockedUntil(null);
        if (staffUser.getStatus() == StaffUserStatus.LOCKED) {
            staffUser.setStatus(StaffUserStatus.ACTIVE);
        }
        staffUserRepository.save(staffUser);
        return toStaffUserView(staffUser, staffAccessProfileService.buildProfile(staffUser), activeAssignments(tenantId, userId));
    }

    private List<StaffRoleAssignment> materializeAssignments(
        String tenantId,
        StaffUser staffUser,
        List<CreateAssignmentCommand> commands
    ) {
        if (commands == null || commands.isEmpty()) {
            throw new IllegalArgumentException("At least one role assignment is required");
        }

        List<StaffRoleAssignment> assignments = new ArrayList<>();
        Set<String> uniquenessGuard = new LinkedHashSet<>();

        for (CreateAssignmentCommand command : commands) {
            Role role = roleRepository.findByTenantIdAndCodeAndDeletedAtIsNull(tenantId, command.roleCode())
                .orElseThrow(() -> new IllegalArgumentException("Role " + command.roleCode() + " was not found"));

            if (command.scopeType() == StaffAccessScopeType.TENANT) {
                String key = role.getId() + ":TENANT";
                if (uniquenessGuard.add(key)) {
                    assignments.add(buildAssignment(tenantId, staffUser, role, StaffAccessScopeType.TENANT, null, null));
                }
                continue;
            }

            if (command.scopeType() == StaffAccessScopeType.BRAND) {
                if (command.brandIds() == null || command.brandIds().isEmpty()) {
                    throw new IllegalArgumentException("Brand scoped assignments require brand ids");
                }

                for (String brandId : command.brandIds()) {
                    Brand brand = brandRepository.findByIdAndTenantIdAndDeletedAtIsNull(brandId, tenantId)
                        .orElseThrow(() -> new IllegalArgumentException("Brand " + brandId + " was not found"));
                    String key = role.getId() + ":BRAND:" + brand.getId();
                    if (uniquenessGuard.add(key)) {
                        assignments.add(buildAssignment(tenantId, staffUser, role, StaffAccessScopeType.BRAND, brand, null));
                    }
                }
                continue;
            }

            if (command.branchIds() == null || command.branchIds().isEmpty()) {
                throw new IllegalArgumentException("Branch scoped assignments require branch ids");
            }

            for (String branchId : command.branchIds()) {
                Branch branch = branchRepository.findByIdAndTenantIdAndDeletedAtIsNull(branchId, tenantId)
                    .orElseThrow(() -> new IllegalArgumentException("Branch " + branchId + " was not found"));
                String key = role.getId() + ":BRANCH:" + branch.getId();
                if (uniquenessGuard.add(key)) {
                    assignments.add(buildAssignment(tenantId, staffUser, role, StaffAccessScopeType.BRANCH, null, branch));
                }
            }
        }

        return assignments;
    }

    private StaffRoleAssignment buildAssignment(
        String tenantId,
        StaffUser staffUser,
        Role role,
        StaffAccessScopeType scopeType,
        Brand brand,
        Branch branch
    ) {
        StaffRoleAssignment assignment = new StaffRoleAssignment();
        assignment.setTenantId(tenantId);
        assignment.setStaffUser(staffUser);
        assignment.setRole(role);
        assignment.setScopeType(scopeType);
        assignment.setBrand(brand);
        assignment.setBranch(branch);
        assignment.setStatus(StaffRoleAssignmentStatus.ACTIVE);
        return assignment;
    }

    private boolean isVisibleToActor(StaffAccessProfile accessProfile, Set<String> actorAccessibleBranchIds) {
        if (actorAccessibleBranchIds == null || actorAccessibleBranchIds.isEmpty()) {
            return true;
        }

        if (accessProfile == null || accessProfile.accessibleBranches().isEmpty()) {
            return false;
        }

        return accessProfile.accessibleBranches().stream()
            .map(BranchAccessView::branchId)
            .anyMatch(actorAccessibleBranchIds::contains);
    }

    private void requireAssignableScopes(
        String tenantId,
        Set<String> actorAccessibleBranchIds,
        List<CreateAssignmentCommand> assignments
    ) {
        if (actorAccessibleBranchIds == null || actorAccessibleBranchIds.isEmpty()) {
            return;
        }

        long tenantBranchCount = branchRepository.countByTenantIdAndDeletedAtIsNull(tenantId);
        boolean actorHasTenantWideVisibility = tenantBranchCount > 0 && actorAccessibleBranchIds.size() == tenantBranchCount;

        for (CreateAssignmentCommand assignment : assignments) {
            if (assignment.scopeType() == StaffAccessScopeType.TENANT && !actorHasTenantWideVisibility) {
                throw new AccessDeniedException("The current actor cannot grant tenant-wide assignments");
            }

            if (assignment.scopeType() == StaffAccessScopeType.BRANCH && assignment.branchIds() != null) {
                boolean invalidBranch = assignment.branchIds().stream().anyMatch(branchId -> !actorAccessibleBranchIds.contains(branchId));
                if (invalidBranch) {
                    throw new AccessDeniedException("The current actor cannot assign roles outside their visible branches");
                }
            }

            if (assignment.scopeType() == StaffAccessScopeType.BRAND && assignment.brandIds() != null) {
                for (String brandId : assignment.brandIds()) {
                    List<String> branchIdsByBrand = branchRepository.findAllByTenantIdAndBrandIdAndDeletedAtIsNullOrderByNameAsc(tenantId, brandId).stream()
                        .map(Branch::getId)
                        .toList();
                    if (!actorHasTenantWideVisibility && !actorAccessibleBranchIds.containsAll(branchIdsByBrand)) {
                        throw new AccessDeniedException("The current actor cannot assign a brand scope with hidden branches");
                    }
                }
            }
        }
    }

    private StaffUser requireManageableStaffUser(String tenantId, Set<String> actorAccessibleBranchIds, String userId) {
        StaffUser staffUser = staffUserRepository.findByIdAndTenantIdAndDeletedAtIsNull(userId, tenantId)
            .orElseThrow(() -> new IllegalArgumentException("Staff user was not found"));

        if (actorAccessibleBranchIds == null || actorAccessibleBranchIds.isEmpty()) {
            return staffUser;
        }

        StaffAccessProfile accessProfile = staffAccessProfileService.buildProfile(staffUser);
        Set<String> targetBranchIds = accessProfile.accessibleBranches().stream()
            .map(BranchAccessView::branchId)
            .collect(Collectors.toSet());
        boolean manageable = targetBranchIds.stream().anyMatch(actorAccessibleBranchIds::contains);

        if (!manageable) {
            throw new AccessDeniedException("The current actor cannot manage this staff user");
        }

        return staffUser;
    }

    private StaffUser requireMutableStaffUser(String tenantId, Set<String> actorAccessibleBranchIds, String userId) {
        StaffUser staffUser = requireManageableStaffUser(tenantId, actorAccessibleBranchIds, userId);
        if (isBootstrapStaffUser(tenantId, staffUser.getId())) {
            throw new IllegalArgumentException("The bootstrap owner must be managed from the SaaS console credential flow");
        }

        return staffUser;
    }

    private boolean isBootstrapStaffUser(String tenantId, String userId) {
        return staffUserRepository.findTopByTenantIdAndDeletedAtIsNullOrderByCreatedAtAsc(tenantId)
            .map(bootstrapUser -> bootstrapUser.getId().equals(userId))
            .orElse(false);
    }

    private List<StaffRoleAssignment> activeAssignments(String tenantId, String userId) {
        return staffRoleAssignmentRepository.findAllByTenantIdAndStaffUserIdAndStatus(
            tenantId,
            userId,
            StaffRoleAssignmentStatus.ACTIVE
        );
    }

    private StaffUserView toStaffUserView(
        StaffUser staffUser,
        StaffAccessProfile accessProfile,
        List<StaffRoleAssignment> assignments
    ) {
        return new StaffUserView(
            staffUser.getId(),
            staffUser.getEmail(),
            staffUser.getFullName(),
            staffUser.getStatus(),
            isBootstrapStaffUser(staffUser.getTenantId(), staffUser.getId()),
            staffUser.isPasswordResetRequired(),
            staffUser.getLastLoginAt(),
            accessProfile == null ? Set.of() : accessProfile.permissions(),
            accessProfile == null ? List.of() : accessProfile.accessibleBranches(),
            assignments.stream()
                .map(assignment -> new AssignmentView(
                    assignment.getId(),
                    assignment.getRole().getCode(),
                    assignment.getRole().getName(),
                    assignment.getScopeType(),
                    assignment.getBrand() != null ? assignment.getBrand().getId() : null,
                    assignment.getBrand() != null ? assignment.getBrand().getName() : null,
                    assignment.getBranch() != null ? assignment.getBranch().getId() : null,
                    assignment.getBranch() != null ? assignment.getBranch().getName() : null
                ))
                .toList()
        );
    }

    public record RoleView(
        String roleId,
        String code,
        String name,
        String description,
        boolean active,
        List<String> permissions
    ) {
    }

    public record AssignmentView(
        String assignmentId,
        String roleCode,
        String roleName,
        StaffAccessScopeType scopeType,
        String brandId,
        String brandName,
        String branchId,
        String branchName
    ) {
    }

    public record StaffUserView(
        String userId,
        String email,
        String fullName,
        StaffUserStatus status,
        boolean bootstrapProtected,
        boolean passwordResetRequired,
        OffsetDateTime lastLoginAt,
        Set<String> permissions,
        List<BranchAccessView> accessibleBranches,
        List<AssignmentView> assignments
    ) {
    }

    public record CreateAssignmentCommand(
        String roleCode,
        StaffAccessScopeType scopeType,
        List<String> brandIds,
        List<String> branchIds
    ) {
    }

    public record CreateStaffUserCommand(
        String email,
        String fullName,
        String password,
        StaffUserStatus status,
        boolean passwordResetRequired,
        List<CreateAssignmentCommand> assignments
    ) {
    }

    public record UpdateStaffUserAccessCommand(
        StaffUserStatus status,
        boolean passwordResetRequired,
        List<CreateAssignmentCommand> assignments
    ) {
    }
}
