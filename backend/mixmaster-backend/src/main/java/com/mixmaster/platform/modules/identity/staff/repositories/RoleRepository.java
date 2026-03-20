package com.mixmaster.platform.modules.identity.staff.repositories;

import com.mixmaster.platform.modules.identity.staff.models.Role;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoleRepository extends JpaRepository<Role, String> {

    Optional<Role> findByTenantIdAndCodeAndDeletedAtIsNull(String tenantId, String code);

    List<Role> findAllByTenantIdAndDeletedAtIsNullOrderByNameAsc(String tenantId);

    List<Role> findAllByTenantIdAndActiveIsTrueAndDeletedAtIsNullOrderByNameAsc(String tenantId);

    List<Role> findAllByTenantIdAndCodeInAndDeletedAtIsNull(String tenantId, Collection<String> codes);
}
