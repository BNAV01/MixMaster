package com.mixmaster.platform.modules.organization.services;

import com.mixmaster.platform.modules.organization.models.Tenant;
import com.mixmaster.platform.modules.organization.repositories.BrandRepository;
import com.mixmaster.platform.modules.organization.repositories.BranchRepository;
import com.mixmaster.platform.modules.organization.repositories.TenantRepository;
import java.util.Comparator;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class TenantOverviewService {

    private final TenantRepository tenantRepository;
    private final BrandRepository brandRepository;
    private final BranchRepository branchRepository;

    public TenantOverviewService(
        TenantRepository tenantRepository,
        BrandRepository brandRepository,
        BranchRepository branchRepository
    ) {
        this.tenantRepository = tenantRepository;
        this.brandRepository = brandRepository;
        this.branchRepository = branchRepository;
    }

    public List<TenantOverview> listTenants() {
        return tenantRepository.findAll().stream()
            .sorted(Comparator.comparing(Tenant::getCreatedAt).reversed())
            .map(this::toOverview)
            .toList();
    }

    public TenantOverview requireTenant(String tenantId) {
        Tenant tenant = tenantRepository.findById(tenantId)
            .orElseThrow(() -> new IllegalArgumentException("Tenant was not found"));
        return toOverview(tenant);
    }

    private TenantOverview toOverview(Tenant tenant) {
        return new TenantOverview(
            tenant.getId(),
            tenant.getCode(),
            tenant.getName(),
            tenant.getStatus(),
            tenant.getTimezone(),
            brandRepository.countByTenantIdAndDeletedAtIsNull(tenant.getId()),
            branchRepository.countByTenantIdAndDeletedAtIsNull(tenant.getId()),
            tenant.getCreatedAt()
        );
    }
}
