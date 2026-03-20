package com.mixmaster.platform.modules.identity.staff.repositories;

import com.mixmaster.platform.modules.identity.staff.models.StaffRoleAssignment;
import com.mixmaster.platform.modules.identity.staff.models.StaffRoleAssignmentStatus;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StaffRoleAssignmentRepository extends JpaRepository<StaffRoleAssignment, String> {

    List<StaffRoleAssignment> findAllByTenantIdAndStaffUserIdAndStatus(String tenantId, String staffUserId, StaffRoleAssignmentStatus status);

    List<StaffRoleAssignment> findAllByTenantIdAndStaffUserIdInAndStatus(String tenantId, Collection<String> staffUserIds, StaffRoleAssignmentStatus status);

    List<StaffRoleAssignment> findAllByTenantIdAndRole_IdAndStatus(String tenantId, String roleId, StaffRoleAssignmentStatus status);
}
