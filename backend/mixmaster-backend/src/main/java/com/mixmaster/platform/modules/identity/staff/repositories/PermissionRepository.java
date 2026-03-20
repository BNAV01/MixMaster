package com.mixmaster.platform.modules.identity.staff.repositories;

import com.mixmaster.platform.modules.identity.staff.models.Permission;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PermissionRepository extends JpaRepository<Permission, String> {

    Optional<Permission> findByCode(String code);

    List<Permission> findAllByCodeIn(Collection<String> codes);
}
