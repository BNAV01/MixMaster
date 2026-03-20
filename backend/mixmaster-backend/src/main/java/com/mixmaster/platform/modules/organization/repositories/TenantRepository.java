package com.mixmaster.platform.modules.organization.repositories;

import com.mixmaster.platform.modules.organization.models.Tenant;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TenantRepository extends JpaRepository<Tenant, String> {

    Optional<Tenant> findByCode(String code);

    Optional<Tenant> findByCodeIgnoreCase(String code);

    boolean existsByCode(String code);

    boolean existsByCodeIgnoreCase(String code);
}
