package com.mixmaster.platform.interfaces.saasadmin.controllers;

import com.mixmaster.platform.interfaces.saasadmin.security.SaasAdminApiPaths;
import com.mixmaster.platform.interfaces.saasadmin.services.SaasAdminTelemetryService;
import com.mixmaster.platform.interfaces.saasadmin.services.SaasAdminWorkspaceService;
import com.mixmaster.platform.modules.organization.services.TenantProvisioningService;
import com.mixmaster.platform.shared.security.ActorPermissionService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(SaasAdminApiPaths.ROOT)
public class SaasAdminTenantController {

    private final ActorPermissionService actorPermissionService;
    private final SaasAdminTelemetryService saasAdminTelemetryService;
    private final SaasAdminWorkspaceService saasAdminWorkspaceService;
    private final TenantProvisioningService tenantProvisioningService;

    public SaasAdminTenantController(
        ActorPermissionService actorPermissionService,
        SaasAdminTelemetryService saasAdminTelemetryService,
        SaasAdminWorkspaceService saasAdminWorkspaceService,
        TenantProvisioningService tenantProvisioningService
    ) {
        this.actorPermissionService = actorPermissionService;
        this.saasAdminTelemetryService = saasAdminTelemetryService;
        this.saasAdminWorkspaceService = saasAdminWorkspaceService;
        this.tenantProvisioningService = tenantProvisioningService;
    }

    @GetMapping("/tenants")
    public List<PlatformTenantSummaryResponse> listTenants() {
        actorPermissionService.requirePlatformPermission("platform.tenants.read");
        return saasAdminTelemetryService.loadWorkspace().tenants().stream()
            .map(this::toSummaryResponse)
            .toList();
    }

    @GetMapping("/tenants/{tenantId}")
    public PlatformTenantDetailResponse getTenant(@PathVariable String tenantId) {
        actorPermissionService.requirePlatformPermission("platform.tenants.read");
        return toDetailResponse(
            saasAdminWorkspaceService.requireTenantDetail(tenantId),
            saasAdminTelemetryService.requireTenantTelemetry(tenantId)
        );
    }

    @PostMapping("/tenants")
    public PlatformTenantDetailResponse createTenant(@Valid @RequestBody CreateTenantRequest request) {
        actorPermissionService.requirePlatformPermission("platform.tenants.write");
        TenantProvisioningService.TenantProvisioningResult provisioningResult = tenantProvisioningService.createTenant(
            new TenantProvisioningService.CreateTenantCommand(
                request.name(),
                request.code(),
                request.timezone(),
                request.status(),
                request.primaryBrandName(),
                request.primaryBrandCode(),
                request.primaryBranchName(),
                request.primaryBranchCode(),
                request.currencyCode(),
                request.primaryBranchAddressLine1(),
                request.primaryBranchCommune(),
                request.primaryBranchCity(),
                request.ownerEmail(),
                request.ownerFullName(),
                request.ownerPassword(),
                request.legalName(),
                request.taxId(),
                request.billingEmail(),
                request.billingPhone(),
                request.economicActivity(),
                request.siiActivityCode(),
                request.taxAddress(),
                request.taxCommune(),
                request.taxCity(),
                request.legalRepresentativeName(),
                request.legalRepresentativeTaxId(),
                request.subscriptionPlanCode(),
                request.onboardingStage(),
                request.siiStartActivitiesVerified()
            )
        );
        saasAdminTelemetryService.refreshAll();

        return toDetailResponse(
            saasAdminWorkspaceService.requireTenantDetail(
                provisioningResult.tenantId(),
                new SaasAdminWorkspaceService.BootstrapCredentialSnapshot(
                    provisioningResult.ownerEmail(),
                    provisioningResult.bootstrapPassword(),
                    provisioningResult.bootstrapPasswordGenerated(),
                    provisioningResult.passwordResetRequired()
                )
            ),
            saasAdminTelemetryService.requireTenantTelemetry(provisioningResult.tenantId())
        );
    }

    @PatchMapping("/tenants/{tenantId}/profile")
    public PlatformTenantDetailResponse updateTenantProfile(
        @PathVariable String tenantId,
        @Valid @RequestBody UpdateTenantProfileRequest request
    ) {
        actorPermissionService.requirePlatformPermission("platform.tenants.write");
        tenantProvisioningService.updateTenantProfile(
            tenantId,
            new TenantProvisioningService.UpdateTenantCommand(
                request.name(),
                request.code(),
                request.timezone(),
                request.status(),
                request.legalName(),
                request.taxId(),
                request.billingEmail(),
                request.billingPhone(),
                request.economicActivity(),
                request.siiActivityCode(),
                request.taxAddress(),
                request.taxCommune(),
                request.taxCity(),
                request.legalRepresentativeName(),
                request.legalRepresentativeTaxId(),
                request.subscriptionPlanCode(),
                request.subscriptionStatus(),
                request.trialEndsAt(),
                request.onboardingStage(),
                request.siiStartActivitiesVerified(),
                request.primaryBranchId(),
                request.primaryBranchName(),
                request.primaryBranchCode(),
                request.currencyCode(),
                request.primaryBranchAddressLine1(),
                request.primaryBranchCommune(),
                request.primaryBranchCity()
            )
        );
        saasAdminTelemetryService.refreshTenant(tenantId);
        return toDetailResponse(
            saasAdminWorkspaceService.requireTenantDetail(tenantId),
            saasAdminTelemetryService.requireTenantTelemetry(tenantId)
        );
    }

    @PostMapping("/tenants/{tenantId}/refresh")
    public PlatformTenantDetailResponse refreshTenant(@PathVariable String tenantId) {
        actorPermissionService.requirePlatformPermission("platform.tenants.write");
        saasAdminTelemetryService.refreshTenant(tenantId);
        return toDetailResponse(
            saasAdminWorkspaceService.requireTenantDetail(tenantId),
            saasAdminTelemetryService.requireTenantTelemetry(tenantId)
        );
    }

    @PostMapping("/tenants/{tenantId}/owner-credential/reset")
    public PlatformTenantDetailResponse resetTenantOwnerCredential(@PathVariable String tenantId) {
        actorPermissionService.requirePlatformPermission("platform.tenants.write");
        TenantProvisioningService.TenantProvisioningResult credentialReset = tenantProvisioningService.resetTenantOwnerCredential(tenantId);
        saasAdminTelemetryService.refreshTenant(tenantId);
        return toDetailResponse(
            saasAdminWorkspaceService.requireTenantDetail(
                tenantId,
                new SaasAdminWorkspaceService.BootstrapCredentialSnapshot(
                    credentialReset.ownerEmail(),
                    credentialReset.bootstrapPassword(),
                    credentialReset.bootstrapPasswordGenerated(),
                    credentialReset.passwordResetRequired()
                )
            ),
            saasAdminTelemetryService.requireTenantTelemetry(tenantId)
        );
    }

    private PlatformTenantSummaryResponse toSummaryResponse(SaasAdminTelemetryService.TenantTelemetryView tenantSnapshot) {
        return new PlatformTenantSummaryResponse(
            tenantSnapshot.tenantId(),
            tenantSnapshot.snapshot().getCode(),
            tenantSnapshot.snapshot().getName(),
            tenantSnapshot.snapshot().getLegalName(),
            tenantSnapshot.snapshot().getStatus(),
            tenantSnapshot.snapshot().getTimezone(),
            tenantSnapshot.snapshot().getBrandCount(),
            tenantSnapshot.snapshot().getBranchCount(),
            tenantSnapshot.snapshot().getOwnerEmail(),
            tenantSnapshot.snapshot().getOwnerFullName(),
            tenantSnapshot.snapshot().isOwnerPasswordResetRequired(),
            tenantSnapshot.snapshot().getSubscriptionPlanCode(),
            tenantSnapshot.snapshot().getSubscriptionStatus(),
            tenantSnapshot.snapshot().getOnboardingStage(),
            tenantSnapshot.legalReady(),
            tenantSnapshot.readinessScore(),
            tenantSnapshot.snapshot().isSiiStartActivitiesVerified(),
            tenantSnapshot.openTicketCount(),
            tenantSnapshot.urgentTicketCount(),
            tenantSnapshot.staffUserCount(),
            tenantSnapshot.activeStaffUserCount(),
            null,
            tenantSnapshot.snapshot().getTrialEndsAt(),
            tenantSnapshot.capturedAt()
        );
    }

    private PlatformTenantDetailResponse toDetailResponse(
        SaasAdminWorkspaceService.TenantDetailSnapshot tenantDetailSnapshot,
        SaasAdminTelemetryService.TenantTelemetryView telemetryView
    ) {
        return new PlatformTenantDetailResponse(
            tenantDetailSnapshot.tenantId(),
            tenantDetailSnapshot.code(),
            tenantDetailSnapshot.name(),
            tenantDetailSnapshot.legalName(),
            tenantDetailSnapshot.status().name(),
            tenantDetailSnapshot.timezone(),
            tenantDetailSnapshot.brandCount(),
            tenantDetailSnapshot.branchCount(),
            tenantDetailSnapshot.ownerEmail(),
            tenantDetailSnapshot.ownerFullName(),
            tenantDetailSnapshot.ownerPasswordResetRequired(),
            tenantDetailSnapshot.subscriptionPlanCode(),
            tenantDetailSnapshot.subscriptionStatus().name(),
            tenantDetailSnapshot.onboardingStage().name(),
            tenantDetailSnapshot.legalReady(),
            tenantDetailSnapshot.readinessScore(),
            tenantDetailSnapshot.siiStartActivitiesVerified(),
            telemetryView.openTicketCount(),
            telemetryView.urgentTicketCount(),
            telemetryView.staffUserCount(),
            telemetryView.activeStaffUserCount(),
            tenantDetailSnapshot.taxId(),
            tenantDetailSnapshot.billingEmail(),
            tenantDetailSnapshot.billingPhone(),
            tenantDetailSnapshot.economicActivity(),
            tenantDetailSnapshot.siiActivityCode(),
            tenantDetailSnapshot.taxAddress(),
            tenantDetailSnapshot.taxCommune(),
            tenantDetailSnapshot.taxCity(),
            tenantDetailSnapshot.legalRepresentativeName(),
            tenantDetailSnapshot.legalRepresentativeTaxId(),
            tenantDetailSnapshot.trialEndsAt(),
            tenantDetailSnapshot.activatedAt(),
            tenantDetailSnapshot.suspendedAt(),
            tenantDetailSnapshot.createdAt(),
            telemetryView.capturedAt(),
            tenantDetailSnapshot.missingComplianceItems(),
            tenantDetailSnapshot.branches().stream()
                .map(branch -> new PlatformTenantBranchResponse(
                    branch.branchId(),
                    branch.brandId(),
                    branch.brandName(),
                    branch.code(),
                    branch.name(),
                    branch.timezone(),
                    branch.currencyCode(),
                    branch.addressLine1(),
                    branch.commune(),
                    branch.city(),
                    branch.active()
                ))
                .toList(),
            tenantDetailSnapshot.bootstrapCredential() == null
                ? null
                : new PlatformBootstrapCredentialResponse(
                    tenantDetailSnapshot.bootstrapCredential().email(),
                    tenantDetailSnapshot.bootstrapCredential().temporaryPassword(),
                    tenantDetailSnapshot.bootstrapCredential().generated(),
                    tenantDetailSnapshot.bootstrapCredential().passwordResetRequired()
                )
        );
    }
}
