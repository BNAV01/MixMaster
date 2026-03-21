package com.mixmaster.platform.interfaces.saasadmin.services;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import com.mixmaster.platform.modules.identity.staff.repositories.StaffUserRepository;
import com.mixmaster.platform.modules.platform.status.models.PlatformDailySnapshot;
import com.mixmaster.platform.modules.platform.status.repositories.PlatformDailySnapshotRepository;
import com.mixmaster.platform.modules.platform.status.repositories.TenantDailySnapshotRepository;
import com.mixmaster.platform.modules.support.services.SupportTicketService;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class SaasAdminTelemetryServiceTest {

    @Mock
    private SaasAdminWorkspaceService saasAdminWorkspaceService;

    @Mock
    private PlatformDailySnapshotRepository platformDailySnapshotRepository;

    @Mock
    private TenantDailySnapshotRepository tenantDailySnapshotRepository;

    @Mock
    private StaffUserRepository staffUserRepository;

    @Mock
    private SupportTicketService supportTicketService;

    @InjectMocks
    private SaasAdminTelemetryService saasAdminTelemetryService;

    @Test
    void loadWorkspaceReturnsEmptyViewWhenPersistedSnapshotHasNoTenants() {
        PlatformDailySnapshot snapshot = new PlatformDailySnapshot();
        snapshot.setCapturedAt(OffsetDateTime.parse("2026-03-21T00:00:00Z"));
        snapshot.setTotalTenants(0);

        when(platformDailySnapshotRepository.findTopByOrderByCapturedAtDesc()).thenReturn(Optional.of(snapshot));
        when(tenantDailySnapshotRepository.findLatestSnapshots()).thenReturn(List.of());

        SaasAdminTelemetryService.WorkspaceTelemetryView telemetryView = saasAdminTelemetryService.loadWorkspace();

        assertThat(telemetryView.tenants()).isEmpty();
        assertThat(telemetryView.overview().totalTenants()).isZero();
        verifyNoInteractions(saasAdminWorkspaceService);
    }

    @Test
    void loadWorkspaceCanBootstrapAnEmptyWorkspaceWithoutRecursing() {
        when(platformDailySnapshotRepository.findTopByOrderByCapturedAtDesc()).thenReturn(Optional.empty());
        when(saasAdminWorkspaceService.listTenantsLive()).thenReturn(List.of());
        when(platformDailySnapshotRepository.save(any(PlatformDailySnapshot.class)))
            .thenAnswer(invocation -> invocation.getArgument(0, PlatformDailySnapshot.class));
        when(supportTicketService.countOpenTickets()).thenReturn(0L);
        when(supportTicketService.countUrgentOpenTickets()).thenReturn(0L);

        SaasAdminTelemetryService.WorkspaceTelemetryView telemetryView = saasAdminTelemetryService.loadWorkspace();

        assertThat(telemetryView.tenants()).isEmpty();
        assertThat(telemetryView.overview().totalTenants()).isZero();
        assertThat(telemetryView.planSummaries()).isEmpty();
    }
}
