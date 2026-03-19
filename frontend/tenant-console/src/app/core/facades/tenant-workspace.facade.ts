import { Injectable, inject, signal } from '@angular/core';
import {
  AnalyticsSummaryDto,
  AvailabilityBoardItemDto,
  FRONTEND_RUNTIME_CONFIG,
  FrontendRuntimeConfig,
  MenuDraftSummaryDto,
  TenantAdminApiClient,
  TenantDashboardDto
} from '@mixmaster/shared/api-clients';
import { AsyncStatus } from '@mixmaster/shared/models';
import { RealtimeConnectionService } from '@mixmaster/shared/realtime';
import { catchError, of, take } from 'rxjs';
import {
  DEMO_ANALYTICS_SUMMARY,
  DEMO_AVAILABILITY_BOARD,
  DEMO_MENU_DRAFTS,
  DEMO_TENANT_DASHBOARD
} from '../mocks/tenant-demo.data';
import { TenantContextService } from '../services/tenant-context.service';

@Injectable({ providedIn: 'root' })
export class TenantWorkspaceFacade {
  private readonly runtimeConfig = inject<FrontendRuntimeConfig>(FRONTEND_RUNTIME_CONFIG);
  readonly dashboard = signal<TenantDashboardDto | null>(null);
  readonly analytics = signal<AnalyticsSummaryDto | null>(null);
  readonly availability = signal<AvailabilityBoardItemDto[]>([]);
  readonly menuDrafts = signal<MenuDraftSummaryDto[]>([]);

  readonly dashboardStatus = signal<AsyncStatus>('idle');
  readonly analyticsStatus = signal<AsyncStatus>('idle');
  readonly availabilityStatus = signal<AsyncStatus>('idle');
  readonly menuDraftsStatus = signal<AsyncStatus>('idle');

  constructor(
    private readonly tenantAdminApiClient: TenantAdminApiClient,
    private readonly tenantContextService: TenantContextService,
    private readonly realtimeConnectionService: RealtimeConnectionService
  ) {}

  loadDashboard(): void {
    this.dashboardStatus.set('loading');
    const branchId = this.tenantContextService.activeBranch() ?? undefined;

    this.tenantAdminApiClient.getDashboard(branchId).pipe(
      take(1),
      catchError(() => of(DEMO_TENANT_DASHBOARD))
    ).subscribe((dashboard: TenantDashboardDto) => {
      this.dashboard.set(dashboard);
      this.dashboardStatus.set('success');
    });
  }

  loadAvailability(): void {
    this.availabilityStatus.set('loading');
    const branchId = this.tenantContextService.activeBranch();

    if (branchId) {
      this.realtimeConnectionService.connect(
        `${this.runtimeConfig.realtimeBaseUrl}/tenant/availability?branchId=${branchId}`
      );
    }

    this.tenantAdminApiClient.getAvailabilityBoard(branchId ?? undefined).pipe(
      take(1),
      catchError(() => of(DEMO_AVAILABILITY_BOARD))
    ).subscribe((availabilityItems: AvailabilityBoardItemDto[]) => {
      this.availability.set(availabilityItems);
      this.availabilityStatus.set('success');
    });
  }

  loadAnalytics(): void {
    this.analyticsStatus.set('loading');
    const branchId = this.tenantContextService.activeBranch() ?? undefined;

    this.tenantAdminApiClient.getAnalyticsSummary(branchId).pipe(
      take(1),
      catchError(() => of(DEMO_ANALYTICS_SUMMARY))
    ).subscribe((analyticsSummary: AnalyticsSummaryDto) => {
      this.analytics.set(analyticsSummary);
      this.analyticsStatus.set('success');
    });
  }

  loadMenuDrafts(): void {
    this.menuDraftsStatus.set('loading');

    this.tenantAdminApiClient.listMenuDrafts().pipe(
      take(1),
      catchError(() => of(DEMO_MENU_DRAFTS))
    ).subscribe((drafts: MenuDraftSummaryDto[]) => {
      this.menuDrafts.set(drafts);
      this.menuDraftsStatus.set('success');
    });
  }
}
