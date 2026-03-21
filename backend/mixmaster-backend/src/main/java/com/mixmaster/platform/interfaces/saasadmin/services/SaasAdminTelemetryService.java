package com.mixmaster.platform.interfaces.saasadmin.services;

import com.mixmaster.platform.modules.identity.staff.models.StaffUserStatus;
import com.mixmaster.platform.modules.identity.staff.repositories.StaffUserRepository;
import com.mixmaster.platform.modules.platform.status.models.PlatformDailySnapshot;
import com.mixmaster.platform.modules.platform.status.models.TenantDailySnapshot;
import com.mixmaster.platform.modules.platform.status.repositories.PlatformDailySnapshotRepository;
import com.mixmaster.platform.modules.platform.status.repositories.TenantDailySnapshotRepository;
import com.mixmaster.platform.modules.organization.models.TenantOnboardingStage;
import com.mixmaster.platform.modules.organization.models.TenantStatus;
import com.mixmaster.platform.modules.organization.models.TenantSubscriptionStatus;
import com.mixmaster.platform.modules.support.services.SupportTicketService;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SaasAdminTelemetryService {

    private static final ZoneId SANTIAGO_ZONE = ZoneId.of("America/Santiago");

    private final SaasAdminWorkspaceService saasAdminWorkspaceService;
    private final PlatformDailySnapshotRepository platformDailySnapshotRepository;
    private final TenantDailySnapshotRepository tenantDailySnapshotRepository;
    private final StaffUserRepository staffUserRepository;
    private final SupportTicketService supportTicketService;

    public SaasAdminTelemetryService(
        SaasAdminWorkspaceService saasAdminWorkspaceService,
        PlatformDailySnapshotRepository platformDailySnapshotRepository,
        TenantDailySnapshotRepository tenantDailySnapshotRepository,
        StaffUserRepository staffUserRepository,
        SupportTicketService supportTicketService
    ) {
        this.saasAdminWorkspaceService = saasAdminWorkspaceService;
        this.platformDailySnapshotRepository = platformDailySnapshotRepository;
        this.tenantDailySnapshotRepository = tenantDailySnapshotRepository;
        this.staffUserRepository = staffUserRepository;
        this.supportTicketService = supportTicketService;
    }

    @Scheduled(cron = "0 10 3 * * *", zone = "America/Santiago")
    @Transactional
    public void scheduledRefresh() {
        refreshAll();
    }

    @Transactional
    public WorkspaceTelemetryView refreshAll() {
        List<SaasAdminWorkspaceService.TenantSnapshot> liveTenants = saasAdminWorkspaceService.listTenantsLive();
        List<TenantDailySnapshot> tenantSnapshots = liveTenants.stream()
            .map(this::persistTenantSnapshot)
            .toList();
        PlatformDailySnapshot platformSnapshot = persistPlatformSnapshot(liveTenants);
        return buildWorkspaceTelemetryView(platformSnapshot, tenantSnapshots);
    }

    @Transactional
    public TenantTelemetryView refreshTenant(String tenantId) {
        SaasAdminWorkspaceService.TenantSnapshot liveTenant = saasAdminWorkspaceService.listTenantsLive().stream()
            .filter(tenant -> tenant.tenantId().equals(tenantId))
            .findFirst()
            .orElseThrow(() -> new IllegalArgumentException("Tenant was not found"));
        TenantDailySnapshot snapshot = persistTenantSnapshot(liveTenant);
        return toTenantTelemetryView(snapshot);
    }

    @Transactional
    public WorkspaceTelemetryView loadWorkspace() {
        PlatformDailySnapshot platformSnapshot = platformDailySnapshotRepository.findTopByOrderByCapturedAtDesc()
            .orElse(null);
        if (platformSnapshot == null) {
            return refreshAll();
        }

        List<TenantDailySnapshot> latestTenantSnapshots = tenantDailySnapshotRepository.findLatestSnapshots();
        if (latestTenantSnapshots.isEmpty() && platformSnapshot.getTotalTenants() > 0) {
            return refreshAll();
        }

        return buildWorkspaceTelemetryView(platformSnapshot, latestTenantSnapshots);
    }

    private WorkspaceTelemetryView buildWorkspaceTelemetryView(
        PlatformDailySnapshot platformSnapshot,
        List<TenantDailySnapshot> latestTenantSnapshots
    ) {
        List<TenantDailySnapshot> orderedTenantSnapshots = latestTenantSnapshots.stream()
            .sorted(Comparator.comparing(TenantDailySnapshot::getName, String.CASE_INSENSITIVE_ORDER))
            .toList();

        return new WorkspaceTelemetryView(
            toOverviewView(platformSnapshot),
            orderedTenantSnapshots.stream().map(this::toTenantTelemetryView).toList(),
            summarizePlans(orderedTenantSnapshots),
            summarizeSubscriptions(orderedTenantSnapshots),
            summarizeOnboarding(orderedTenantSnapshots),
            summarizeSupportAlerts(orderedTenantSnapshots),
            platformSnapshot
        );
    }

    @Transactional
    public TenantTelemetryView requireTenantTelemetry(String tenantId) {
        TenantDailySnapshot snapshot = tenantDailySnapshotRepository.findTopByTenantIdOrderByCapturedAtDesc(tenantId)
            .orElseGet(() -> refreshTenant(tenantId).snapshot());
        return toTenantTelemetryView(snapshot);
    }

    private PlatformDailySnapshot persistPlatformSnapshot(List<SaasAdminWorkspaceService.TenantSnapshot> liveTenants) {
        PlatformDailySnapshot snapshot = new PlatformDailySnapshot();
        snapshot.setCapturedForDate(LocalDate.now(SANTIAGO_ZONE));
        snapshot.setCapturedAt(OffsetDateTime.now(SANTIAGO_ZONE));
        snapshot.setTotalTenants(liveTenants.size());
        snapshot.setActiveTenants(liveTenants.stream().filter(tenant -> tenant.status() == TenantStatus.ACTIVE).count());
        snapshot.setTrialTenants(liveTenants.stream().filter(tenant -> tenant.subscriptionStatus() == TenantSubscriptionStatus.TRIAL).count());
        snapshot.setSuspendedTenants(liveTenants.stream().filter(tenant -> tenant.status() == TenantStatus.SUSPENDED).count());
        snapshot.setLegalReadyTenants(liveTenants.stream().filter(SaasAdminWorkspaceService.TenantSnapshot::legalReady).count());
        snapshot.setOnboardingPendingTenants(liveTenants.stream().filter(tenant -> tenant.onboardingStage() != TenantOnboardingStage.LIVE).count());
        snapshot.setExpiringTrials(liveTenants.stream().filter(this::isTrialExpiringSoon).count());
        snapshot.setSiiVerifiedTenants(liveTenants.stream().filter(SaasAdminWorkspaceService.TenantSnapshot::siiStartActivitiesVerified).count());
        snapshot.setTotalStaffUsers(liveTenants.stream().mapToLong(tenant -> countStaffUsers(tenant.tenantId())).sum());
        snapshot.setActiveStaffUsers(liveTenants.stream().mapToLong(tenant -> countActiveStaffUsers(tenant.tenantId())).sum());
        snapshot.setOwnersPendingPasswordReset(liveTenants.stream().filter(SaasAdminWorkspaceService.TenantSnapshot::ownerPasswordResetRequired).count());
        snapshot.setOpenTickets(supportTicketService.countOpenTickets());
        snapshot.setUrgentTickets(supportTicketService.countUrgentOpenTickets());
        snapshot.setAverageReadinessScore(liveTenants.isEmpty()
            ? 0
            : (int) Math.round(liveTenants.stream().mapToInt(SaasAdminWorkspaceService.TenantSnapshot::readinessScore).average().orElse(0)));
        OffsetDateTime cutoff = OffsetDateTime.now(SANTIAGO_ZONE).minusHours(24);
        snapshot.setNewTenantsLast24h(liveTenants.stream()
            .filter(tenant -> tenant.createdAt() != null)
            .filter(tenant -> tenant.createdAt().atZone(SANTIAGO_ZONE).toOffsetDateTime().isAfter(cutoff))
            .count());
        return platformDailySnapshotRepository.save(snapshot);
    }

    private boolean isTrialExpiringSoon(SaasAdminWorkspaceService.TenantSnapshot tenant) {
        if (tenant.subscriptionStatus() != TenantSubscriptionStatus.TRIAL || tenant.trialEndsAt() == null) {
            return false;
        }

        OffsetDateTime remainingCutoff = OffsetDateTime.now(SANTIAGO_ZONE).plusDays(7);
        return !tenant.trialEndsAt().isBefore(OffsetDateTime.now(SANTIAGO_ZONE))
            && !tenant.trialEndsAt().isAfter(remainingCutoff);
    }

    private TenantDailySnapshot persistTenantSnapshot(SaasAdminWorkspaceService.TenantSnapshot liveTenant) {
        TenantDailySnapshot snapshot = new TenantDailySnapshot();
        snapshot.setTenantId(liveTenant.tenantId());
        snapshot.setCapturedForDate(LocalDate.now(SANTIAGO_ZONE));
        snapshot.setCapturedAt(OffsetDateTime.now(SANTIAGO_ZONE));
        snapshot.setCode(liveTenant.code());
        snapshot.setName(liveTenant.name());
        snapshot.setLegalName(liveTenant.legalName());
        snapshot.setTimezone(liveTenant.timezone());
        snapshot.setStatus(liveTenant.status().name());
        snapshot.setSubscriptionPlanCode(normalizeText(liveTenant.subscriptionPlanCode(), "FOUNDATION"));
        snapshot.setSubscriptionStatus(liveTenant.subscriptionStatus().name());
        snapshot.setOnboardingStage(liveTenant.onboardingStage().name());
        snapshot.setOwnerEmail(liveTenant.ownerEmail());
        snapshot.setOwnerFullName(liveTenant.ownerFullName());
        snapshot.setOwnerPasswordResetRequired(liveTenant.ownerPasswordResetRequired());
        snapshot.setBrandCount(liveTenant.brandCount());
        snapshot.setBranchCount(liveTenant.branchCount());
        snapshot.setStaffUserCount(countStaffUsers(liveTenant.tenantId()));
        snapshot.setActiveStaffUserCount(countActiveStaffUsers(liveTenant.tenantId()));
        snapshot.setLegalReady(liveTenant.legalReady());
        snapshot.setReadinessScore(liveTenant.readinessScore());
        snapshot.setSiiStartActivitiesVerified(liveTenant.siiStartActivitiesVerified());
        snapshot.setOpenTicketCount(supportTicketService.countOpenTicketsByTenant(liveTenant.tenantId()));
        snapshot.setUrgentTicketCount(supportTicketService.countUrgentOpenTicketsByTenant(liveTenant.tenantId()));
        snapshot.setTrialEndsAt(liveTenant.trialEndsAt());
        return tenantDailySnapshotRepository.save(snapshot);
    }

    private long countStaffUsers(String tenantId) {
        return staffUserRepository.countByTenantIdAndDeletedAtIsNull(tenantId);
    }

    private long countActiveStaffUsers(String tenantId) {
        return staffUserRepository.countByTenantIdAndStatusAndDeletedAtIsNull(tenantId, StaffUserStatus.ACTIVE);
    }

    private WorkspaceOverviewView toOverviewView(PlatformDailySnapshot snapshot) {
        return new WorkspaceOverviewView(
            snapshot.getTotalTenants(),
            snapshot.getActiveTenants(),
            snapshot.getTrialTenants(),
            snapshot.getSuspendedTenants(),
            snapshot.getLegalReadyTenants(),
            snapshot.getOnboardingPendingTenants(),
            snapshot.getExpiringTrials(),
            snapshot.getSiiVerifiedTenants(),
            snapshot.getTotalStaffUsers(),
            snapshot.getActiveStaffUsers(),
            snapshot.getOwnersPendingPasswordReset(),
            snapshot.getOpenTickets(),
            snapshot.getUrgentTickets(),
            snapshot.getAverageReadinessScore(),
            snapshot.getNewTenantsLast24h(),
            snapshot.getCapturedAt()
        );
    }

    private TenantTelemetryView toTenantTelemetryView(TenantDailySnapshot snapshot) {
        return new TenantTelemetryView(
            snapshot.getTenantId(),
            snapshot.getCapturedAt(),
            snapshot.getOpenTicketCount(),
            snapshot.getUrgentTicketCount(),
            snapshot.getStaffUserCount(),
            snapshot.getActiveStaffUserCount(),
            snapshot.isLegalReady(),
            snapshot.getReadinessScore(),
            snapshot
        );
    }

    private List<PlanSummaryView> summarizePlans(List<TenantDailySnapshot> tenantSnapshots) {
        return tenantSnapshots.stream()
            .collect(Collectors.groupingBy(snapshot -> normalizeText(snapshot.getSubscriptionPlanCode(), "FOUNDATION").toUpperCase(Locale.ROOT)))
            .entrySet().stream()
            .map(entry -> new PlanSummaryView(
                entry.getKey(),
                entry.getValue().size(),
                entry.getValue().stream().filter(snapshot -> "ACTIVE".equals(snapshot.getSubscriptionStatus())).count(),
                entry.getValue().stream().filter(snapshot -> "TRIAL".equals(snapshot.getSubscriptionStatus())).count(),
                entry.getValue().stream().filter(TenantDailySnapshot::isLegalReady).count()
            ))
            .sorted(Comparator.comparing(PlanSummaryView::planCode))
            .toList();
    }

    private List<SubscriptionView> summarizeSubscriptions(List<TenantDailySnapshot> tenantSnapshots) {
        return tenantSnapshots.stream()
            .map(snapshot -> new SubscriptionView(
                snapshot.getTenantId(),
                snapshot.getName(),
                snapshot.getSubscriptionPlanCode(),
                snapshot.getSubscriptionStatus(),
                snapshot.getTrialEndsAt(),
                snapshot.isLegalReady(),
                snapshot.isSiiStartActivitiesVerified()
            ))
            .sorted(Comparator.comparing(SubscriptionView::tenantName, String.CASE_INSENSITIVE_ORDER))
            .toList();
    }

    private List<OnboardingView> summarizeOnboarding(List<TenantDailySnapshot> tenantSnapshots) {
        return tenantSnapshots.stream()
            .map(snapshot -> new OnboardingView(
                snapshot.getTenantId(),
                snapshot.getName(),
                snapshot.getOwnerEmail(),
                snapshot.getOnboardingStage(),
                snapshot.isLegalReady(),
                snapshot.getReadinessScore(),
                nextActionFor(snapshot)
            ))
            .sorted(Comparator.comparing(OnboardingView::tenantName, String.CASE_INSENSITIVE_ORDER))
            .toList();
    }

    private List<SupportAlertView> summarizeSupportAlerts(List<TenantDailySnapshot> tenantSnapshots) {
        return tenantSnapshots.stream()
            .flatMap(snapshot -> buildSupportAlerts(snapshot).stream())
            .filter(Objects::nonNull)
            .toList();
    }

    private List<SupportAlertView> buildSupportAlerts(TenantDailySnapshot snapshot) {
        List<SupportAlertView> alerts = new java.util.ArrayList<>();
        if (!snapshot.isSiiStartActivitiesVerified()) {
            alerts.add(new SupportAlertView(
                snapshot.getTenantId(),
                snapshot.getName(),
                "HIGH",
                "Inicio de actividades pendiente",
                "El tenant sigue sin verificación SII consolidada en la última captura."
            ));
        }
        if (!snapshot.isLegalReady()) {
            alerts.add(new SupportAlertView(
                snapshot.getTenantId(),
                snapshot.getName(),
                snapshot.getReadinessScore() < 60 ? "HIGH" : "MEDIUM",
                "Ficha legal incompleta",
                "La consolidación diaria sigue marcando brechas legales o tributarias."
            ));
        }
        if (snapshot.getUrgentTicketCount() > 0) {
            alerts.add(new SupportAlertView(
                snapshot.getTenantId(),
                snapshot.getName(),
                "HIGH",
                "Tickets urgentes abiertos",
                "Existen tickets de alta prioridad pendientes en la última captura."
            ));
        } else if (snapshot.getOpenTicketCount() > 0) {
            alerts.add(new SupportAlertView(
                snapshot.getTenantId(),
                snapshot.getName(),
                "MEDIUM",
                "Backlog de soporte abierto",
                "El tenant mantiene tickets abiertos que requieren seguimiento."
            ));
        }
        return alerts;
    }

    private String nextActionFor(TenantDailySnapshot snapshot) {
        if (!snapshot.isLegalReady() || !snapshot.isSiiStartActivitiesVerified()) {
            return "Completar legalización y verificación tributaria antes de escalar operación.";
        }

        return switch (snapshot.getOnboardingStage()) {
            case "OWNER_BOOTSTRAPPED" -> "Validar credenciales iniciales y parametrización base del negocio.";
            case "LEGAL_SETUP" -> "Cerrar perfil tributario, billing y plan comercial.";
            case "MENU_BUILD" -> "Cargar catálogo operativo y revisar sucursales.";
            case "BILLING_REVIEW" -> "Aprobar plan, trial y condiciones comerciales.";
            case "READY_TO_LAUNCH" -> "Coordinar salida productiva y checklist final.";
            default -> "Operación consolidada; monitorear tickets y compliance.";
        };
    }

    private String normalizeText(String rawValue, String fallback) {
        if (rawValue == null || rawValue.isBlank()) {
            return fallback;
        }
        return rawValue.trim();
    }

    public record WorkspaceOverviewView(
        long totalTenants,
        long activeTenants,
        long trialTenants,
        long suspendedTenants,
        long legalReadyTenants,
        long onboardingPendingTenants,
        long expiringTrials,
        long siiVerifiedTenants,
        long totalStaffUsers,
        long activeStaffUsers,
        long ownersPendingPasswordReset,
        long openTickets,
        long urgentTickets,
        int averageReadinessScore,
        long newTenantsLast24h,
        OffsetDateTime capturedAt
    ) {
    }

    public record TenantTelemetryView(
        String tenantId,
        OffsetDateTime capturedAt,
        long openTicketCount,
        long urgentTicketCount,
        long staffUserCount,
        long activeStaffUserCount,
        boolean legalReady,
        int readinessScore,
        TenantDailySnapshot snapshot
    ) {
    }

    public record PlanSummaryView(
        String planCode,
        long tenantCount,
        long activeCount,
        long trialCount,
        long legalReadyCount
    ) {
    }

    public record SubscriptionView(
        String tenantId,
        String tenantName,
        String planCode,
        String subscriptionStatus,
        OffsetDateTime trialEndsAt,
        boolean legalReady,
        boolean siiStartActivitiesVerified
    ) {
    }

    public record OnboardingView(
        String tenantId,
        String tenantName,
        String ownerEmail,
        String stage,
        boolean legalReady,
        int readinessScore,
        String nextAction
    ) {
    }

    public record SupportAlertView(
        String tenantId,
        String tenantName,
        String severity,
        String title,
        String description
    ) {
    }

    public record WorkspaceTelemetryView(
        WorkspaceOverviewView overview,
        List<TenantTelemetryView> tenants,
        List<PlanSummaryView> planSummaries,
        List<SubscriptionView> subscriptionSummaries,
        List<OnboardingView> onboardingQueue,
        List<SupportAlertView> supportAlerts,
        PlatformDailySnapshot overviewSnapshot
    ) {
    }
}
