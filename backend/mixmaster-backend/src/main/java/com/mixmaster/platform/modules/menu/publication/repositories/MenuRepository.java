package com.mixmaster.platform.modules.menu.publication.repositories;

import com.mixmaster.platform.modules.menu.publication.models.Menu;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MenuRepository extends JpaRepository<Menu, String> {

    Optional<Menu> findTopByTenantIdAndScopeBranchIdAndDeletedAtIsNullOrderByCreatedAtDesc(String tenantId, String branchId);

    List<Menu> findAllByTenantIdAndDeletedAtIsNullOrderByNameAsc(String tenantId);
}
