package com.mixmaster.platform.modules.identity.staff.services;

import com.mixmaster.platform.modules.identity.staff.models.RolePermission;
import com.mixmaster.platform.modules.identity.staff.models.StaffAccessScopeType;
import com.mixmaster.platform.modules.identity.staff.models.StaffRoleAssignment;
import com.mixmaster.platform.modules.identity.staff.models.StaffRoleAssignmentStatus;
import com.mixmaster.platform.modules.identity.staff.models.StaffUser;
import com.mixmaster.platform.modules.identity.staff.repositories.RolePermissionRepository;
import com.mixmaster.platform.modules.identity.staff.repositories.StaffRoleAssignmentRepository;
import com.mixmaster.platform.modules.organization.models.Branch;
import com.mixmaster.platform.modules.organization.repositories.BranchRepository;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class StaffAccessProfileService {

    private final StaffRoleAssignmentRepository staffRoleAssignmentRepository;
    private final RolePermissionRepository rolePermissionRepository;
    private final BranchRepository branchRepository;

    public StaffAccessProfileService(
        StaffRoleAssignmentRepository staffRoleAssignmentRepository,
        RolePermissionRepository rolePermissionRepository,
        BranchRepository branchRepository
    ) {
        this.staffRoleAssignmentRepository = staffRoleAssignmentRepository;
        this.rolePermissionRepository = rolePermissionRepository;
        this.branchRepository = branchRepository;
    }

    public StaffAccessProfile buildProfile(StaffUser staffUser) {
        List<StaffRoleAssignment> assignments = staffRoleAssignmentRepository.findAllByTenantIdAndStaffUserIdAndStatus(
            staffUser.getTenantId(),
            staffUser.getId(),
            StaffRoleAssignmentStatus.ACTIVE
        );

        Set<String> roleCodes = assignments.stream()
            .map(assignment -> assignment.getRole().getCode())
            .collect(Collectors.toCollection(LinkedHashSet::new));

        Set<String> permissionCodes = assignments.stream()
            .map(assignment -> rolePermissionRepository.findAllByRole_Id(assignment.getRole().getId()))
            .flatMap(List::stream)
            .map(RolePermission::getPermission)
            .map(permission -> permission.getCode())
            .collect(Collectors.toCollection(LinkedHashSet::new));

        Set<String> branchIds = resolveBranchIds(staffUser.getTenantId(), assignments);
        List<BranchAccessView> accessibleBranches = branchIds.isEmpty()
            ? List.of()
            : branchRepository.findAllByTenantIdAndIdInAndDeletedAtIsNullOrderByNameAsc(staffUser.getTenantId(), branchIds).stream()
                .map(this::toBranchAccessView)
                .toList();

        String defaultBranchId = !accessibleBranches.isEmpty() ? accessibleBranches.getFirst().branchId() : null;

        return new StaffAccessProfile(permissionCodes, roleCodes, accessibleBranches, defaultBranchId);
    }

    private Set<String> resolveBranchIds(String tenantId, List<StaffRoleAssignment> assignments) {
        Set<String> branchIds = new LinkedHashSet<>();
        Set<String> brandIds = new LinkedHashSet<>();
        boolean tenantWide = false;

        for (StaffRoleAssignment assignment : assignments) {
            StaffAccessScopeType scopeType = assignment.getScopeType();

            if (scopeType == StaffAccessScopeType.TENANT) {
                tenantWide = true;
            } else if (scopeType == StaffAccessScopeType.BRAND && assignment.getBrand() != null) {
                brandIds.add(assignment.getBrand().getId());
            } else if (scopeType == StaffAccessScopeType.BRANCH && assignment.getBranch() != null) {
                branchIds.add(assignment.getBranch().getId());
            }
        }

        if (tenantWide) {
            return branchRepository.findAllByTenantIdAndDeletedAtIsNullOrderByNameAsc(tenantId).stream()
                .map(Branch::getId)
                .collect(Collectors.toCollection(LinkedHashSet::new));
        }

        if (!brandIds.isEmpty()) {
            for (String brandId : brandIds) {
                branchIds.addAll(
                    branchRepository.findAllByTenantIdAndBrandIdAndDeletedAtIsNullOrderByNameAsc(tenantId, brandId).stream()
                        .map(Branch::getId)
                        .toList()
                );
            }
        }

        return branchIds;
    }

    public Map<String, StaffAccessProfile> buildProfiles(List<StaffUser> staffUsers) {
        List<Branch> tenantBranches = new ArrayList<>();
        Set<String> tenantIds = staffUsers.stream().map(StaffUser::getTenantId).collect(Collectors.toSet());

        if (tenantIds.size() == 1) {
            tenantBranches = branchRepository.findAllByTenantIdAndDeletedAtIsNullOrderByNameAsc(staffUsers.getFirst().getTenantId());
        }
        final List<Branch> resolvedTenantBranches = tenantBranches;

        List<StaffRoleAssignment> assignments = staffRoleAssignmentRepository.findAllByTenantIdAndStaffUserIdInAndStatus(
            staffUsers.getFirst().getTenantId(),
            staffUsers.stream().map(StaffUser::getId).toList(),
            StaffRoleAssignmentStatus.ACTIVE
        );

        Map<String, List<StaffRoleAssignment>> assignmentsByStaffUserId = assignments.stream()
            .collect(Collectors.groupingBy(assignment -> assignment.getStaffUser().getId()));

        return staffUsers.stream().collect(Collectors.toMap(
            StaffUser::getId,
            staffUser -> {
                List<StaffRoleAssignment> userAssignments = assignmentsByStaffUserId.getOrDefault(staffUser.getId(), List.of());
                Set<String> roleCodes = userAssignments.stream()
                    .map(assignment -> assignment.getRole().getCode())
                    .collect(Collectors.toCollection(LinkedHashSet::new));
                Set<String> permissionCodes = userAssignments.stream()
                    .map(assignment -> rolePermissionRepository.findAllByRole_Id(assignment.getRole().getId()))
                    .flatMap(List::stream)
                    .map(rolePermission -> rolePermission.getPermission().getCode())
                    .collect(Collectors.toCollection(LinkedHashSet::new));
                Set<String> accessibleBranchIds = resolveBranchIds(staffUser.getTenantId(), userAssignments);
                List<BranchAccessView> branches = resolvedTenantBranches.stream()
                    .filter(branch -> accessibleBranchIds.contains(branch.getId()))
                    .map(this::toBranchAccessView)
                    .toList();

                return new StaffAccessProfile(
                    permissionCodes,
                    roleCodes,
                    branches,
                    !branches.isEmpty() ? branches.getFirst().branchId() : null
                );
            }
        ));
    }

    private BranchAccessView toBranchAccessView(Branch branch) {
        return new BranchAccessView(
            branch.getId(),
            branch.getName(),
            branch.getBrand().getId(),
            branch.getBrand().getName(),
            branch.getTimezone(),
            branch.getCurrencyCode()
        );
    }
}
