package com.mixmaster.platform.modules.organization.repositories;

import com.mixmaster.platform.modules.organization.models.Branch;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BranchRepository extends JpaRepository<Branch, String> {

    List<Branch> findAllByTenantIdAndDeletedAtIsNullOrderByNameAsc(String tenantId);

    List<Branch> findAllByTenantIdAndBrandIdAndDeletedAtIsNullOrderByNameAsc(String tenantId, String brandId);

    List<Branch> findAllByTenantIdAndIdInAndDeletedAtIsNullOrderByNameAsc(String tenantId, Collection<String> ids);

    long countByTenantIdAndDeletedAtIsNull(String tenantId);

    boolean existsByTenantIdAndCodeIgnoreCaseAndDeletedAtIsNull(String tenantId, String code);

    Optional<Branch> findByIdAndTenantIdAndDeletedAtIsNull(String id, String tenantId);
}
