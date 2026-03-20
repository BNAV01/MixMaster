package com.mixmaster.platform.modules.organization.services;

import com.mixmaster.platform.modules.organization.models.Brand;
import com.mixmaster.platform.modules.organization.models.Branch;
import com.mixmaster.platform.modules.organization.repositories.BrandRepository;
import com.mixmaster.platform.modules.organization.repositories.BranchRepository;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TenantOrganizationService {

    private final BrandRepository brandRepository;
    private final BranchRepository branchRepository;

    public TenantOrganizationService(
        BrandRepository brandRepository,
        BranchRepository branchRepository
    ) {
        this.brandRepository = brandRepository;
        this.branchRepository = branchRepository;
    }

    @Transactional(readOnly = true)
    public OrganizationView getOrganization(String tenantId, Set<String> actorAccessibleBranchIds, boolean canWrite) {
        List<Brand> brands = brandRepository.findAllByTenantIdAndDeletedAtIsNullOrderByNameAsc(tenantId);
        List<Branch> branches = branchRepository.findAllByTenantIdAndDeletedAtIsNullOrderByNameAsc(tenantId);
        Set<String> visibleBranchIds = actorAccessibleBranchIds == null || actorAccessibleBranchIds.isEmpty()
            ? branches.stream().map(Branch::getId).collect(Collectors.toCollection(LinkedHashSet::new))
            : actorAccessibleBranchIds;

        Map<String, List<Branch>> branchesByBrandId = branches.stream()
            .collect(Collectors.groupingBy(branch -> branch.getBrand().getId(), LinkedHashMap::new, Collectors.toList()));

        List<BrandView> brandViews = brands.stream()
            .map(brand -> {
                List<Branch> brandBranches = branchesByBrandId.getOrDefault(brand.getId(), List.of());
                List<BranchView> visibleBranches = brandBranches.stream()
                    .filter(branch -> visibleBranchIds.contains(branch.getId()))
                    .map(this::toBranchView)
                    .toList();

                return new BrandView(
                    brand.getId(),
                    brand.getCode(),
                    brand.getName(),
                    brand.isActive(),
                    brandBranches.size(),
                    visibleBranches.size(),
                    visibleBranches
                );
            })
            .filter(brand -> canWrite || brand.visibleBranchCount() > 0)
            .toList();

        return new OrganizationView(
            tenantId,
            brands.size(),
            branches.size(),
            (int) branches.stream().filter(branch -> visibleBranchIds.contains(branch.getId())).count(),
            visibleBranchIds.size() > 1,
            canWrite,
            brandViews
        );
    }

    @Transactional
    public BrandView createBrand(String tenantId, CreateBrandCommand command) {
        String normalizedCode = normalizeCode(command.code());
        if (brandRepository.existsByTenantIdAndCodeIgnoreCaseAndDeletedAtIsNull(tenantId, normalizedCode)) {
            throw new IllegalArgumentException("Brand code is already in use for this tenant");
        }

        Brand brand = new Brand();
        brand.setTenantId(tenantId);
        brand.setCode(normalizedCode);
        brand.setName(command.name().trim());
        brand.setActive(true);
        brandRepository.save(brand);

        return new BrandView(brand.getId(), brand.getCode(), brand.getName(), brand.isActive(), 0, 0, List.of());
    }

    @Transactional
    public BranchView createBranch(String tenantId, CreateBranchCommand command) {
        String normalizedCode = normalizeCode(command.code());
        if (branchRepository.existsByTenantIdAndCodeIgnoreCaseAndDeletedAtIsNull(tenantId, normalizedCode)) {
            throw new IllegalArgumentException("Branch code is already in use for this tenant");
        }

        Brand brand = brandRepository.findByIdAndTenantIdAndDeletedAtIsNull(command.brandId(), tenantId)
            .orElseThrow(() -> new IllegalArgumentException("Brand was not found"));

        Branch branch = new Branch();
        branch.setTenantId(tenantId);
        branch.setBrand(brand);
        branch.setCode(normalizedCode);
        branch.setName(command.name().trim());
        branch.setTimezone(command.timezone().trim());
        branch.setCurrencyCode(command.currencyCode().trim().toUpperCase(Locale.ROOT));
        branch.setActive(true);
        branchRepository.save(branch);

        return toBranchView(branch);
    }

    @Transactional
    public BranchView updateBranch(String tenantId, String branchId, UpdateBranchCommand command) {
        Branch branch = branchRepository.findByIdAndTenantIdAndDeletedAtIsNull(branchId, tenantId)
            .orElseThrow(() -> new IllegalArgumentException("Branch was not found"));

        branch.setName(command.name().trim());
        branch.setTimezone(command.timezone().trim());
        branch.setCurrencyCode(command.currencyCode().trim().toUpperCase(Locale.ROOT));
        branch.setActive(command.active());
        branchRepository.save(branch);

        return toBranchView(branch);
    }

    private BranchView toBranchView(Branch branch) {
        return new BranchView(
            branch.getId(),
            branch.getBrand().getId(),
            branch.getBrand().getName(),
            branch.getCode(),
            branch.getName(),
            branch.getTimezone(),
            branch.getCurrencyCode(),
            branch.isActive()
        );
    }

    private String normalizeCode(String code) {
        return code.trim().toLowerCase(Locale.ROOT)
            .replace(' ', '-')
            .replaceAll("[^a-z0-9-]", "-")
            .replaceAll("-{2,}", "-");
    }

    public record OrganizationView(
        String tenantId,
        int brandCount,
        int totalBranchCount,
        int visibleBranchCount,
        boolean crossBranchAccess,
        boolean canWrite,
        List<BrandView> brands
    ) {
    }

    public record BrandView(
        String brandId,
        String code,
        String name,
        boolean active,
        int totalBranchCount,
        int visibleBranchCount,
        List<BranchView> branches
    ) {
    }

    public record BranchView(
        String branchId,
        String brandId,
        String brandName,
        String code,
        String name,
        String timezone,
        String currencyCode,
        boolean active
    ) {
    }

    public record CreateBrandCommand(
        String code,
        String name
    ) {
    }

    public record CreateBranchCommand(
        String brandId,
        String code,
        String name,
        String timezone,
        String currencyCode
    ) {
    }

    public record UpdateBranchCommand(
        String name,
        String timezone,
        String currencyCode,
        boolean active
    ) {
    }
}
