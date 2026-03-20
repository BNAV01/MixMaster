package com.mixmaster.platform.modules.organization.repositories;

import com.mixmaster.platform.modules.organization.models.Brand;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BrandRepository extends JpaRepository<Brand, String> {

    List<Brand> findAllByTenantIdAndDeletedAtIsNullOrderByNameAsc(String tenantId);

    long countByTenantIdAndDeletedAtIsNull(String tenantId);

    boolean existsByTenantIdAndCodeIgnoreCaseAndDeletedAtIsNull(String tenantId, String code);

    Optional<Brand> findByIdAndTenantIdAndDeletedAtIsNull(String id, String tenantId);
}
