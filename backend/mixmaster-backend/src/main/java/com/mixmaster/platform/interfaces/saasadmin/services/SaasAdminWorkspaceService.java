package com.mixmaster.platform.interfaces.saasadmin.services;

import com.mixmaster.platform.modules.identity.staff.models.Role;
import com.mixmaster.platform.modules.identity.staff.models.StaffRoleAssignment;
import com.mixmaster.platform.modules.identity.staff.models.StaffRoleAssignmentStatus;
import com.mixmaster.platform.modules.identity.staff.models.StaffUser;
import com.mixmaster.platform.modules.identity.staff.repositories.RoleRepository;
import com.mixmaster.platform.modules.identity.staff.repositories.StaffRoleAssignmentRepository;
import com.mixmaster.platform.modules.identity.staff.repositories.StaffUserRepository;
import com.mixmaster.platform.modules.organization.models.Branch;
import com.mixmaster.platform.modules.organization.models.Tenant;
import com.mixmaster.platform.modules.organization.models.TenantOnboardingStage;
import com.mixmaster.platform.modules.organization.models.TenantStatus;
import com.mixmaster.platform.modules.organization.models.TenantSubscriptionStatus;
import com.mixmaster.platform.modules.organization.repositories.BrandRepository;
import com.mixmaster.platform.modules.organization.repositories.BranchRepository;
import com.mixmaster.platform.modules.organization.repositories.TenantRepository;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class SaasAdminWorkspaceService {

    private static final List<FeatureFlagSnapshot> FEATURE_FLAGS = List.of(
        new FeatureFlagSnapshot(
            "advanced-rcv-reporting",
            "RCV Avanzado",
            "Habilita planillas ampliadas para conciliacion de Registro de Compras y Ventas y soporte F29.",
            false,
            "Rollout manual por tenant",
            List.of("PREMIUM", "ENTERPRISE")
        ),
        new FeatureFlagSnapshot(
            "multi-branch-menu-publishing",
            "Publicacion Multi-Sucursal",
            "Permite publicar operaciones y menus con variacion por sucursal.",
            true,
            "Default activo",
            List.of("FOUNDATION", "PREMIUM", "ENTERPRISE")
        ),
        new FeatureFlagSnapshot(
            "campaign-orchestration",
            "Campanas Orquestadas",
            "Desbloquea automatizacion comercial y disparadores segmentados.",
            false,
            "Habilitacion guiada por plan",
            List.of("PREMIUM", "ENTERPRISE")
        ),
        new FeatureFlagSnapshot(
            "loyalty-ledger-v2",
            "Loyalty Ledger V2",
            "Version endurecida del libro de movimientos de fidelizacion con trazabilidad extendida.",
            false,
            "Solo habilitacion enterprise",
            List.of("ENTERPRISE")
        )
    );

    private static final List<ReportCatalogItemSnapshot> REPORT_CATALOG = List.of(
        new ReportCatalogItemSnapshot(
            "tenant-registry",
            "Registro maestro de tenants",
            "Exporta tenants, estados operativos, owner inicial, plan, onboarding y perfil legal consolidado.",
            "PLATFORM",
            List.of("XLSX")
        ),
        new ReportCatalogItemSnapshot(
            "sii-readiness-pack",
            "Pack de readiness SII",
            "Resume perfil tributario, sucursales, verificacion de inicio de actividades y brechas para operacion 2026.",
            "TENANT",
            List.of("XLSX", "PDF")
        ),
        new ReportCatalogItemSnapshot(
            "f29-support-workbook",
            "Workbook de soporte F29",
            "Genera una hoja de apoyo para control mensual previa a la declaracion, con foco en RCV y datos maestros.",
            "TENANT",
            List.of("XLSX", "PDF")
        )
    );

    private final TenantRepository tenantRepository;
    private final BrandRepository brandRepository;
    private final BranchRepository branchRepository;
    private final StaffUserRepository staffUserRepository;
    private final RoleRepository roleRepository;
    private final StaffRoleAssignmentRepository staffRoleAssignmentRepository;

    public SaasAdminWorkspaceService(
        TenantRepository tenantRepository,
        BrandRepository brandRepository,
        BranchRepository branchRepository,
        StaffUserRepository staffUserRepository,
        RoleRepository roleRepository,
        StaffRoleAssignmentRepository staffRoleAssignmentRepository
    ) {
        this.tenantRepository = tenantRepository;
        this.brandRepository = brandRepository;
        this.branchRepository = branchRepository;
        this.staffUserRepository = staffUserRepository;
        this.roleRepository = roleRepository;
        this.staffRoleAssignmentRepository = staffRoleAssignmentRepository;
    }

    public WorkspaceSnapshot captureLiveWorkspace() {
        List<TenantSnapshot> tenants = listTenantsLive();
        long totalTenants = tenants.size();
        long activeTenants = tenants.stream().filter(tenant -> tenant.status() == TenantStatus.ACTIVE).count();
        long trialTenants = tenants.stream().filter(tenant -> tenant.subscriptionStatus() == TenantSubscriptionStatus.TRIAL).count();
        long suspendedTenants = tenants.stream().filter(tenant -> tenant.status() == TenantStatus.SUSPENDED).count();
        long legalReadyTenants = tenants.stream().filter(TenantSnapshot::legalReady).count();
        long onboardingPendingTenants = tenants.stream().filter(tenant -> tenant.onboardingStage() != TenantOnboardingStage.LIVE).count();
        long expiringTrials = tenants.stream().filter(this::isTrialExpiringSoon).count();
        long siiVerifiedTenants = tenants.stream().filter(TenantSnapshot::siiStartActivitiesVerified).count();

        OverviewSnapshot overview = new OverviewSnapshot(
            totalTenants,
            activeTenants,
            trialTenants,
            suspendedTenants,
            legalReadyTenants,
            onboardingPendingTenants,
            expiringTrials,
            siiVerifiedTenants
        );

        return new WorkspaceSnapshot(
            overview,
            summarizePlans(tenants),
            summarizeSubscriptions(tenants),
            summarizeOnboarding(tenants),
            summarizeSupportAlerts(tenants),
            FEATURE_FLAGS,
            REPORT_CATALOG
        );
    }

    public WorkspaceSnapshot captureWorkspace() {
        return captureLiveWorkspace();
    }

    public List<FeatureFlagSnapshot> featureFlags() {
        return FEATURE_FLAGS;
    }

    public List<ReportCatalogItemSnapshot> reportCatalog() {
        return REPORT_CATALOG;
    }

    public List<TenantSnapshot> listTenantsLive() {
        return tenantRepository.findAll().stream()
            .sorted(Comparator.comparing(Tenant::getCreatedAt).reversed())
            .map(this::toTenantSnapshot)
            .toList();
    }

    public List<TenantSnapshot> listTenants() {
        return listTenantsLive();
    }

    public TenantDetailSnapshot requireTenantDetail(String tenantId) {
        Tenant tenant = tenantRepository.findById(tenantId)
            .orElseThrow(() -> new IllegalArgumentException("Tenant was not found"));
        return toTenantDetailSnapshot(tenant);
    }

    public TenantDetailSnapshot requireTenantDetail(String tenantId, BootstrapCredentialSnapshot bootstrapCredential) {
        TenantDetailSnapshot detailSnapshot = requireTenantDetail(tenantId);
        return new TenantDetailSnapshot(
            detailSnapshot.tenantId(),
            detailSnapshot.code(),
            detailSnapshot.name(),
            detailSnapshot.legalName(),
            detailSnapshot.status(),
            detailSnapshot.timezone(),
            detailSnapshot.brandCount(),
            detailSnapshot.branchCount(),
            detailSnapshot.ownerEmail(),
            detailSnapshot.ownerFullName(),
            detailSnapshot.ownerPasswordResetRequired(),
            detailSnapshot.subscriptionPlanCode(),
            detailSnapshot.subscriptionStatus(),
            detailSnapshot.onboardingStage(),
            detailSnapshot.legalReady(),
            detailSnapshot.readinessScore(),
            detailSnapshot.siiStartActivitiesVerified(),
            detailSnapshot.taxId(),
            detailSnapshot.billingEmail(),
            detailSnapshot.billingPhone(),
            detailSnapshot.economicActivity(),
            detailSnapshot.siiActivityCode(),
            detailSnapshot.taxAddress(),
            detailSnapshot.taxCommune(),
            detailSnapshot.taxCity(),
            detailSnapshot.legalRepresentativeName(),
            detailSnapshot.legalRepresentativeTaxId(),
            detailSnapshot.trialEndsAt(),
            detailSnapshot.activatedAt(),
            detailSnapshot.suspendedAt(),
            detailSnapshot.createdAt(),
            detailSnapshot.missingComplianceItems(),
            detailSnapshot.branches(),
            bootstrapCredential
        );
    }

    private TenantSnapshot toTenantSnapshot(Tenant tenant) {
        ComplianceAssessment assessment = assessCompliance(tenant, branchRepository.findAllByTenantIdAndDeletedAtIsNullOrderByNameAsc(tenant.getId()));
        OwnerSnapshot owner = resolveOwner(tenant.getId());
        return new TenantSnapshot(
            tenant.getId(),
            tenant.getCode(),
            tenant.getName(),
            tenant.getLegalName(),
            tenant.getStatus(),
            tenant.getTimezone(),
            brandRepository.countByTenantIdAndDeletedAtIsNull(tenant.getId()),
            branchRepository.countByTenantIdAndDeletedAtIsNull(tenant.getId()),
            owner.email(),
            owner.fullName(),
            owner.passwordResetRequired(),
            tenant.getSubscriptionPlanCode(),
            tenant.getSubscriptionStatus(),
            tenant.getOnboardingStage(),
            assessment.ready(),
            assessment.score(),
            tenant.isSiiStartActivitiesVerified(),
            tenant.getCreatedAt(),
            tenant.getTrialEndsAt()
        );
    }

    private TenantDetailSnapshot toTenantDetailSnapshot(Tenant tenant) {
        List<Branch> branches = branchRepository.findAllByTenantIdAndDeletedAtIsNullOrderByNameAsc(tenant.getId());
        ComplianceAssessment assessment = assessCompliance(tenant, branches);
        OwnerSnapshot owner = resolveOwner(tenant.getId());
        List<TenantBranchSnapshot> branchSnapshots = branches.stream()
            .map(branch -> new TenantBranchSnapshot(
                branch.getId(),
                branch.getBrand().getId(),
                branch.getBrand().getName(),
                branch.getCode(),
                branch.getName(),
                branch.getTimezone(),
                branch.getCurrencyCode(),
                branch.getAddressLine1(),
                branch.getCommune(),
                branch.getCity(),
                branch.isActive()
            ))
            .toList();

        return new TenantDetailSnapshot(
            tenant.getId(),
            tenant.getCode(),
            tenant.getName(),
            tenant.getLegalName(),
            tenant.getStatus(),
            tenant.getTimezone(),
            brandRepository.countByTenantIdAndDeletedAtIsNull(tenant.getId()),
            branchSnapshots.size(),
            owner.email(),
            owner.fullName(),
            owner.passwordResetRequired(),
            tenant.getSubscriptionPlanCode(),
            tenant.getSubscriptionStatus(),
            tenant.getOnboardingStage(),
            assessment.ready(),
            assessment.score(),
            tenant.isSiiStartActivitiesVerified(),
            tenant.getTaxId(),
            tenant.getBillingEmail(),
            tenant.getBillingPhone(),
            tenant.getEconomicActivity(),
            tenant.getSiiActivityCode(),
            tenant.getTaxAddress(),
            tenant.getTaxCommune(),
            tenant.getTaxCity(),
            tenant.getLegalRepresentativeName(),
            tenant.getLegalRepresentativeTaxId(),
            tenant.getTrialEndsAt(),
            tenant.getActivatedAt(),
            tenant.getSuspendedAt(),
            tenant.getCreatedAt(),
            assessment.missingItems(),
            branchSnapshots,
            null
        );
    }

    private OwnerSnapshot resolveOwner(String tenantId) {
        Optional<Role> ownerRole = roleRepository.findByTenantIdAndCodeAndDeletedAtIsNull(tenantId, "TENANT_OWNER");
        if (ownerRole.isPresent()) {
            List<StaffRoleAssignment> assignments = staffRoleAssignmentRepository.findAllByTenantIdAndRole_IdAndStatus(
                tenantId,
                ownerRole.get().getId(),
                StaffRoleAssignmentStatus.ACTIVE
            );
            Optional<StaffUser> owner = assignments.stream().map(StaffRoleAssignment::getStaffUser).findFirst();
            if (owner.isPresent()) {
                return new OwnerSnapshot(owner.get().getEmail(), owner.get().getFullName(), owner.get().isPasswordResetRequired());
            }
        }

        return staffUserRepository.findAllByTenantIdAndDeletedAtIsNullOrderByFullNameAsc(tenantId).stream()
            .findFirst()
            .map(user -> new OwnerSnapshot(user.getEmail(), user.getFullName(), user.isPasswordResetRequired()))
            .orElse(new OwnerSnapshot(null, null, false));
    }

    private ComplianceAssessment assessCompliance(Tenant tenant, List<Branch> branches) {
        List<String> missingItems = new ArrayList<>();
        registerMissing(missingItems, tenant.getLegalName(), "Razon social");
        registerMissing(missingItems, tenant.getTaxId(), "RUT contribuyente");
        registerMissing(missingItems, tenant.getEconomicActivity(), "Giro o actividad economica");
        registerMissing(missingItems, tenant.getSiiActivityCode(), "Codigo de actividad SII");
        registerMissing(missingItems, tenant.getTaxAddress(), "Domicilio tributario");
        registerMissing(missingItems, tenant.getTaxCommune(), "Comuna tributaria");
        registerMissing(missingItems, tenant.getTaxCity(), "Ciudad tributaria");
        registerMissing(missingItems, tenant.getLegalRepresentativeName(), "Representante legal");
        registerMissing(missingItems, tenant.getLegalRepresentativeTaxId(), "RUT representante legal");
        registerMissing(missingItems, tenant.getBillingEmail(), "Correo de facturacion");
        if (!tenant.isSiiStartActivitiesVerified()) {
            missingItems.add("Inicio de actividades verificado");
        }
        if (branches.isEmpty()) {
            missingItems.add("Sucursal registrada");
        } else {
            Branch primaryBranch = branches.getFirst();
            registerMissing(missingItems, primaryBranch.getAddressLine1(), "Direccion de sucursal principal");
            registerMissing(missingItems, primaryBranch.getCommune(), "Comuna de sucursal principal");
            registerMissing(missingItems, primaryBranch.getCity(), "Ciudad de sucursal principal");
        }

        int totalChecks = 13;
        int completedChecks = totalChecks - missingItems.size();
        int score = Math.max(0, Math.min(100, (int) Math.round((completedChecks * 100.0) / totalChecks)));
        return new ComplianceAssessment(missingItems.isEmpty(), score, missingItems);
    }

    private void registerMissing(List<String> missingItems, String value, String label) {
        if (value == null || value.isBlank()) {
            missingItems.add(label);
        }
    }

    private List<PlanSummarySnapshot> summarizePlans(List<TenantSnapshot> tenants) {
        return tenants.stream()
            .collect(Collectors.groupingBy(
                tenant -> tenant.subscriptionPlanCode().toUpperCase(Locale.ROOT),
                Collectors.toList()
            ))
            .entrySet().stream()
            .map(entry -> new PlanSummarySnapshot(
                entry.getKey(),
                entry.getValue().size(),
                entry.getValue().stream().filter(tenant -> tenant.subscriptionStatus() == TenantSubscriptionStatus.ACTIVE).count(),
                entry.getValue().stream().filter(tenant -> tenant.subscriptionStatus() == TenantSubscriptionStatus.TRIAL).count(),
                entry.getValue().stream().filter(TenantSnapshot::legalReady).count()
            ))
            .sorted(Comparator.comparing(PlanSummarySnapshot::planCode))
            .toList();
    }

    private List<SubscriptionSnapshot> summarizeSubscriptions(List<TenantSnapshot> tenants) {
        return tenants.stream()
            .map(tenant -> new SubscriptionSnapshot(
                tenant.tenantId(),
                tenant.name(),
                tenant.subscriptionPlanCode(),
                tenant.subscriptionStatus(),
                tenant.trialEndsAt(),
                tenant.legalReady(),
                tenant.siiStartActivitiesVerified()
            ))
            .sorted(Comparator.comparing(SubscriptionSnapshot::tenantName))
            .toList();
    }

    private List<OnboardingSnapshot> summarizeOnboarding(List<TenantSnapshot> tenants) {
        return tenants.stream()
            .map(tenant -> new OnboardingSnapshot(
                tenant.tenantId(),
                tenant.name(),
                tenant.ownerEmail(),
                tenant.onboardingStage(),
                tenant.legalReady(),
                tenant.readinessScore(),
                nextActionFor(tenant)
            ))
            .sorted(Comparator.comparing(OnboardingSnapshot::tenantName))
            .toList();
    }

    private List<SupportAlertSnapshot> summarizeSupportAlerts(List<TenantSnapshot> tenants) {
        List<SupportAlertSnapshot> alerts = new ArrayList<>();

        for (TenantSnapshot tenant : tenants) {
            if (!tenant.siiStartActivitiesVerified()) {
                alerts.add(new SupportAlertSnapshot(
                    tenant.tenantId(),
                    tenant.name(),
                    "HIGH",
                    "Inicio de actividades pendiente",
                    "El tenant aun no registra verificacion del inicio de actividades exigible para operacion formal 2026."
                ));
            }

            if (!tenant.legalReady()) {
                alerts.add(new SupportAlertSnapshot(
                    tenant.tenantId(),
                    tenant.name(),
                    tenant.readinessScore() < 60 ? "HIGH" : "MEDIUM",
                    "Ficha tributaria incompleta",
                    "Faltan datos maestros del contribuyente para soporte SII, F29 y seguimiento operativo."
                ));
            }

            if (isTrialExpiringSoon(tenant)) {
                alerts.add(new SupportAlertSnapshot(
                    tenant.tenantId(),
                    tenant.name(),
                    "MEDIUM",
                    "Trial por vencer",
                    "La suscripcion trial vence dentro de los proximos 7 dias y requiere definicion comercial."
                ));
            }

            if (tenant.status() == TenantStatus.SUSPENDED) {
                alerts.add(new SupportAlertSnapshot(
                    tenant.tenantId(),
                    tenant.name(),
                    "HIGH",
                    "Tenant suspendido",
                    "El tenant se encuentra suspendido y debe revisarse billing, soporte o cumplimiento."
                ));
            }
        }

        return alerts;
    }

    private String nextActionFor(TenantSnapshot tenant) {
        if (!tenant.siiStartActivitiesVerified() || !tenant.legalReady()) {
            return "Cerrar brechas de formalizacion, RUT y perfil tributario";
        }

        return switch (tenant.onboardingStage()) {
            case OWNER_BOOTSTRAPPED -> "Validar razon social, plan y sucursal principal";
            case LEGAL_SETUP -> "Completar parametrizacion tributaria y verificacion SII";
            case MENU_BUILD -> "Cargar carta, precios y disponibilidad";
            case BILLING_REVIEW -> "Confirmar plan, trial o activacion comercial";
            case READY_TO_LAUNCH -> "Programar salida a produccion";
            case LIVE -> "Operando con monitoreo continuo";
        };
    }

    private boolean isTrialExpiringSoon(TenantSnapshot tenant) {
        if (tenant.subscriptionStatus() != TenantSubscriptionStatus.TRIAL || tenant.trialEndsAt() == null) {
            return false;
        }

        Duration remaining = Duration.between(OffsetDateTime.now(), tenant.trialEndsAt());
        return !remaining.isNegative() && remaining.toDays() <= 7;
    }

    public record WorkspaceSnapshot(
        OverviewSnapshot overview,
        List<PlanSummarySnapshot> planSummaries,
        List<SubscriptionSnapshot> subscriptionSummaries,
        List<OnboardingSnapshot> onboardingQueue,
        List<SupportAlertSnapshot> supportAlerts,
        List<FeatureFlagSnapshot> featureFlags,
        List<ReportCatalogItemSnapshot> reportCatalog
    ) {
    }

    public record OverviewSnapshot(
        long totalTenants,
        long activeTenants,
        long trialTenants,
        long suspendedTenants,
        long legalReadyTenants,
        long onboardingPendingTenants,
        long expiringTrials,
        long siiVerifiedTenants
    ) {
    }

    public record TenantSnapshot(
        String tenantId,
        String code,
        String name,
        String legalName,
        TenantStatus status,
        String timezone,
        long brandCount,
        long branchCount,
        String ownerEmail,
        String ownerFullName,
        boolean ownerPasswordResetRequired,
        String subscriptionPlanCode,
        TenantSubscriptionStatus subscriptionStatus,
        TenantOnboardingStage onboardingStage,
        boolean legalReady,
        int readinessScore,
        boolean siiStartActivitiesVerified,
        LocalDateTime createdAt,
        OffsetDateTime trialEndsAt
    ) {
    }

    public record TenantDetailSnapshot(
        String tenantId,
        String code,
        String name,
        String legalName,
        TenantStatus status,
        String timezone,
        long brandCount,
        long branchCount,
        String ownerEmail,
        String ownerFullName,
        boolean ownerPasswordResetRequired,
        String subscriptionPlanCode,
        TenantSubscriptionStatus subscriptionStatus,
        TenantOnboardingStage onboardingStage,
        boolean legalReady,
        int readinessScore,
        boolean siiStartActivitiesVerified,
        String taxId,
        String billingEmail,
        String billingPhone,
        String economicActivity,
        String siiActivityCode,
        String taxAddress,
        String taxCommune,
        String taxCity,
        String legalRepresentativeName,
        String legalRepresentativeTaxId,
        OffsetDateTime trialEndsAt,
        OffsetDateTime activatedAt,
        OffsetDateTime suspendedAt,
        LocalDateTime createdAt,
        List<String> missingComplianceItems,
        List<TenantBranchSnapshot> branches,
        BootstrapCredentialSnapshot bootstrapCredential
    ) {
    }

    public record TenantBranchSnapshot(
        String branchId,
        String brandId,
        String brandName,
        String code,
        String name,
        String timezone,
        String currencyCode,
        String addressLine1,
        String commune,
        String city,
        boolean active
    ) {
    }

    public record PlanSummarySnapshot(
        String planCode,
        long tenantCount,
        long activeCount,
        long trialCount,
        long legalReadyCount
    ) {
    }

    public record SubscriptionSnapshot(
        String tenantId,
        String tenantName,
        String planCode,
        TenantSubscriptionStatus subscriptionStatus,
        OffsetDateTime trialEndsAt,
        boolean legalReady,
        boolean siiStartActivitiesVerified
    ) {
    }

    public record OnboardingSnapshot(
        String tenantId,
        String tenantName,
        String ownerEmail,
        TenantOnboardingStage stage,
        boolean legalReady,
        int readinessScore,
        String nextAction
    ) {
    }

    public record SupportAlertSnapshot(
        String tenantId,
        String tenantName,
        String severity,
        String title,
        String description
    ) {
    }

    public record FeatureFlagSnapshot(
        String code,
        String name,
        String description,
        boolean enabledByDefault,
        String rolloutPolicy,
        List<String> eligiblePlans
    ) {
    }

    public record ReportCatalogItemSnapshot(
        String reportCode,
        String name,
        String description,
        String scope,
        List<String> formats
    ) {
    }

    public record BootstrapCredentialSnapshot(
        String email,
        String temporaryPassword,
        boolean generated,
        boolean passwordResetRequired
    ) {
    }

    private record OwnerSnapshot(
        String email,
        String fullName,
        boolean passwordResetRequired
    ) {
    }

    private record ComplianceAssessment(
        boolean ready,
        int score,
        List<String> missingItems
    ) {
        private ComplianceAssessment {
            missingItems = missingItems.stream().filter(Objects::nonNull).toList();
        }
    }
}
