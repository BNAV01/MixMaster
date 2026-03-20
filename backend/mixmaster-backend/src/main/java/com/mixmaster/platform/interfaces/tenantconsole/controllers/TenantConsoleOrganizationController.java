package com.mixmaster.platform.interfaces.tenantconsole.controllers;

import com.mixmaster.platform.interfaces.tenantconsole.security.TenantConsoleApiPaths;
import com.mixmaster.platform.modules.organization.services.TenantOrganizationService;
import com.mixmaster.platform.shared.security.ActorPermissionService;
import com.mixmaster.platform.shared.security.AuthenticatedActor;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(TenantConsoleApiPaths.ROOT)
public class TenantConsoleOrganizationController {

    private final ActorPermissionService actorPermissionService;
    private final TenantOrganizationService tenantOrganizationService;

    public TenantConsoleOrganizationController(
        ActorPermissionService actorPermissionService,
        TenantOrganizationService tenantOrganizationService
    ) {
        this.actorPermissionService = actorPermissionService;
        this.tenantOrganizationService = tenantOrganizationService;
    }

    @GetMapping("/organization")
    public TenantOrganizationResponse organization() {
        AuthenticatedActor actor = actorPermissionService.requireTenantPermission("tenant.branches.read");
        TenantOrganizationService.OrganizationView organization = tenantOrganizationService.getOrganization(
            actor.tenantId(),
            actor.accessibleBranchIds(),
            actor.hasPermission("tenant.branches.write")
        );
        return toOrganizationResponse(organization);
    }

    @PostMapping("/organization/brands")
    public TenantOrganizationBrandResponse createBrand(@Valid @RequestBody CreateTenantBrandRequest request) {
        AuthenticatedActor actor = actorPermissionService.requireTenantPermission("tenant.branches.write");
        return toBrandResponse(tenantOrganizationService.createBrand(
            actor.tenantId(),
            new TenantOrganizationService.CreateBrandCommand(request.code(), request.name())
        ));
    }

    @PostMapping("/organization/branches")
    public TenantOrganizationBranchResponse createBranch(@Valid @RequestBody CreateTenantBranchRequest request) {
        AuthenticatedActor actor = actorPermissionService.requireTenantPermission("tenant.branches.write");
        return toBranchResponse(tenantOrganizationService.createBranch(
            actor.tenantId(),
            new TenantOrganizationService.CreateBranchCommand(
                request.brandId(),
                request.code(),
                request.name(),
                request.timezone(),
                request.currencyCode()
            )
        ));
    }

    @PatchMapping("/organization/branches/{branchId}")
    public TenantOrganizationBranchResponse updateBranch(
        @PathVariable String branchId,
        @Valid @RequestBody UpdateTenantBranchRequest request
    ) {
        AuthenticatedActor actor = actorPermissionService.requireTenantPermission("tenant.branches.write");
        actorPermissionService.requireBranchAccess(actor, branchId);
        return toBranchResponse(tenantOrganizationService.updateBranch(
            actor.tenantId(),
            branchId,
            new TenantOrganizationService.UpdateBranchCommand(
                request.name(),
                request.timezone(),
                request.currencyCode(),
                request.active()
            )
        ));
    }

    private TenantOrganizationResponse toOrganizationResponse(TenantOrganizationService.OrganizationView organization) {
        return new TenantOrganizationResponse(
            organization.tenantId(),
            organization.brandCount(),
            organization.totalBranchCount(),
            organization.visibleBranchCount(),
            organization.crossBranchAccess(),
            organization.canWrite(),
            organization.brands().stream().map(this::toBrandResponse).toList()
        );
    }

    private TenantOrganizationBrandResponse toBrandResponse(TenantOrganizationService.BrandView brand) {
        return new TenantOrganizationBrandResponse(
            brand.brandId(),
            brand.code(),
            brand.name(),
            brand.active(),
            brand.totalBranchCount(),
            brand.visibleBranchCount(),
            brand.branches().stream().map(this::toBranchResponse).toList()
        );
    }

    private TenantOrganizationBranchResponse toBranchResponse(TenantOrganizationService.BranchView branch) {
        return new TenantOrganizationBranchResponse(
            branch.branchId(),
            branch.brandId(),
            branch.brandName(),
            branch.code(),
            branch.name(),
            branch.timezone(),
            branch.currencyCode(),
            branch.active()
        );
    }
}
