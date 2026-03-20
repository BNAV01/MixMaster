package com.mixmaster.platform.modules.identity.staff.repositories;

import com.mixmaster.platform.modules.identity.staff.models.RolePermission;
import com.mixmaster.platform.modules.identity.staff.models.RolePermissionId;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RolePermissionRepository extends JpaRepository<RolePermission, RolePermissionId> {

    List<RolePermission> findAllByRole_Id(String roleId);
}
