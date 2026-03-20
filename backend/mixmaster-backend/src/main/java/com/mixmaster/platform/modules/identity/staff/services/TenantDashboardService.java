package com.mixmaster.platform.modules.identity.staff.services;

import com.mixmaster.platform.modules.identity.staff.models.StaffUserStatus;
import com.mixmaster.platform.modules.identity.staff.repositories.RoleRepository;
import com.mixmaster.platform.modules.identity.staff.repositories.StaffUserRepository;
import com.mixmaster.platform.modules.organization.repositories.BranchRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class TenantDashboardService {

    private final StaffUserRepository staffUserRepository;
    private final RoleRepository roleRepository;
    private final BranchRepository branchRepository;

    public TenantDashboardService(
        StaffUserRepository staffUserRepository,
        RoleRepository roleRepository,
        BranchRepository branchRepository
    ) {
        this.staffUserRepository = staffUserRepository;
        this.roleRepository = roleRepository;
        this.branchRepository = branchRepository;
    }

    public List<DashboardMetricView> buildDashboard(String tenantId, int accessibleBranchCount, boolean branchScoped) {
        long activeStaff = staffUserRepository.countByTenantIdAndStatusAndDeletedAtIsNull(tenantId, StaffUserStatus.ACTIVE);
        long lockedStaff = staffUserRepository.countByTenantIdAndStatusAndDeletedAtIsNull(tenantId, StaffUserStatus.LOCKED);
        long activeRoles = roleRepository.findAllByTenantIdAndActiveIsTrueAndDeletedAtIsNullOrderByNameAsc(tenantId).size();
        long totalBranches = branchRepository.countByTenantIdAndDeletedAtIsNull(tenantId);

        return List.of(
            new DashboardMetricView("Usuarios activos", Long.toString(activeStaff), lockedStaff > 0 ? lockedStaff + " bloqueados" : null),
            new DashboardMetricView("Roles operativos", Long.toString(activeRoles), "RBAC real"),
            new DashboardMetricView("Sucursales visibles", Integer.toString(accessibleBranchCount), branchScoped ? "scope acotado" : totalBranches + " totales"),
            new DashboardMetricView("Enforcement", "Backend activo", "tenant + branch + rol")
        );
    }

    public record DashboardMetricView(
        String label,
        String value,
        String delta
    ) {
    }
}
