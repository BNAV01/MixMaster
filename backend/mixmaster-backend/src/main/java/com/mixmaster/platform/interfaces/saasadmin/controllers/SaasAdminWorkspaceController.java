package com.mixmaster.platform.interfaces.saasadmin.controllers;

import com.mixmaster.platform.interfaces.saasadmin.security.SaasAdminApiPaths;
import com.mixmaster.platform.interfaces.saasadmin.services.SaasAdminTelemetryService;
import com.mixmaster.platform.interfaces.saasadmin.services.SaasAdminWorkspaceService;
import com.mixmaster.platform.shared.security.ActorPermissionService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(SaasAdminApiPaths.ROOT)
public class SaasAdminWorkspaceController {

    private final ActorPermissionService actorPermissionService;
    private final SaasAdminTelemetryService saasAdminTelemetryService;
    private final SaasAdminWorkspaceService saasAdminWorkspaceService;

    public SaasAdminWorkspaceController(
        ActorPermissionService actorPermissionService,
        SaasAdminTelemetryService saasAdminTelemetryService,
        SaasAdminWorkspaceService saasAdminWorkspaceService
    ) {
        this.actorPermissionService = actorPermissionService;
        this.saasAdminTelemetryService = saasAdminTelemetryService;
        this.saasAdminWorkspaceService = saasAdminWorkspaceService;
    }

    @GetMapping("/workspace")
    public PlatformWorkspaceResponse workspace() {
        actorPermissionService.requirePlatformAnyPermission(
            "platform.tenants.read",
            "platform.onboarding.read",
            "platform.billing.read",
            "platform.support.read",
            "platform.flags.read",
            "platform.reports.read"
        );
        return toWorkspaceResponse(saasAdminTelemetryService.loadWorkspace());
    }

    @PostMapping("/workspace/refresh")
    public PlatformWorkspaceResponse refreshWorkspace() {
        actorPermissionService.requirePlatformPermission("platform.tenants.write");
        return toWorkspaceResponse(saasAdminTelemetryService.refreshAll());
    }

    private PlatformWorkspaceResponse toWorkspaceResponse(SaasAdminTelemetryService.WorkspaceTelemetryView workspace) {
        return new PlatformWorkspaceResponse(
            new PlatformOverviewResponse(
                workspace.overview().totalTenants(),
                workspace.overview().activeTenants(),
                workspace.overview().trialTenants(),
                workspace.overview().suspendedTenants(),
                workspace.overview().legalReadyTenants(),
                workspace.overview().onboardingPendingTenants(),
                workspace.overview().expiringTrials(),
                workspace.overview().siiVerifiedTenants(),
                workspace.overview().totalStaffUsers(),
                workspace.overview().activeStaffUsers(),
                workspace.overview().ownersPendingPasswordReset(),
                workspace.overview().openTickets(),
                workspace.overview().urgentTickets(),
                workspace.overview().averageReadinessScore(),
                workspace.overview().newTenantsLast24h(),
                workspace.overview().capturedAt()
            ),
            workspace.tenants().stream()
                .map(tenant -> new PlatformTenantSummaryResponse(
                    tenant.tenantId(),
                    tenant.snapshot().getCode(),
                    tenant.snapshot().getName(),
                    tenant.snapshot().getLegalName(),
                    tenant.snapshot().getStatus(),
                    tenant.snapshot().getTimezone(),
                    tenant.snapshot().getBrandCount(),
                    tenant.snapshot().getBranchCount(),
                    tenant.snapshot().getOwnerEmail(),
                    tenant.snapshot().getOwnerFullName(),
                    tenant.snapshot().isOwnerPasswordResetRequired(),
                    tenant.snapshot().getSubscriptionPlanCode(),
                    tenant.snapshot().getSubscriptionStatus(),
                    tenant.snapshot().getOnboardingStage(),
                    tenant.legalReady(),
                    tenant.readinessScore(),
                    tenant.snapshot().isSiiStartActivitiesVerified(),
                    tenant.openTicketCount(),
                    tenant.urgentTicketCount(),
                    tenant.staffUserCount(),
                    tenant.activeStaffUserCount(),
                    null,
                    tenant.snapshot().getTrialEndsAt(),
                    tenant.capturedAt()
                ))
                .toList(),
            workspace.planSummaries().stream()
                .map(plan -> new PlatformPlanSummaryResponse(
                    plan.planCode(),
                    plan.tenantCount(),
                    plan.activeCount(),
                    plan.trialCount(),
                    plan.legalReadyCount()
                ))
                .toList(),
            workspace.subscriptionSummaries().stream()
                .map(subscription -> new PlatformSubscriptionSummaryResponse(
                    subscription.tenantId(),
                    subscription.tenantName(),
                    subscription.planCode(),
                    subscription.subscriptionStatus(),
                    subscription.trialEndsAt(),
                    subscription.legalReady(),
                    subscription.siiStartActivitiesVerified()
                ))
                .toList(),
            workspace.onboardingQueue().stream()
                .map(item -> new PlatformOnboardingItemResponse(
                    item.tenantId(),
                    item.tenantName(),
                    item.ownerEmail(),
                    item.stage(),
                    item.legalReady(),
                    item.readinessScore(),
                    item.nextAction()
                ))
                .toList(),
            workspace.supportAlerts().stream()
                .map(alert -> new PlatformSupportAlertResponse(
                    alert.tenantId(),
                    alert.tenantName(),
                    alert.severity(),
                    alert.title(),
                    alert.description()
                ))
                .toList(),
            saasAdminWorkspaceService.featureFlags().stream()
                .map(flag -> new PlatformFeatureFlagResponse(
                    flag.code(),
                    flag.name(),
                    flag.description(),
                    flag.enabledByDefault(),
                    flag.rolloutPolicy(),
                    flag.eligiblePlans()
                ))
                .toList(),
            saasAdminWorkspaceService.reportCatalog().stream()
                .map(report -> new PlatformReportCatalogItemResponse(
                    report.reportCode(),
                    report.name(),
                    report.description(),
                    report.scope(),
                    report.formats()
                ))
                .toList()
        );
    }
}
