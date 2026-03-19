package com.mixmaster.platform.shared.repositories;

import com.mixmaster.platform.shared.models.TenantScopedEntity;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.NoRepositoryBean;

@NoRepositoryBean
public interface TenantScopedRepository<T extends TenantScopedEntity> extends JpaRepository<T, String> {

    List<T> findAllByTenantId(String tenantId);
}
