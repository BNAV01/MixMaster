import { Injectable, signal } from '@angular/core';
import {
  FeatureFlagDto,
  PlatformAdminApiClient,
  SubscriptionSummaryDto,
  TenantDetailDto,
  TenantSummaryDto,
  TrialSummaryDto
} from '@mixmaster/shared/api-clients';
import { AsyncStatus } from '@mixmaster/shared/models';
import { catchError, of, take } from 'rxjs';
import {
  DEMO_FEATURE_FLAGS,
  DEMO_SUBSCRIPTIONS,
  DEMO_TENANT_DETAIL,
  DEMO_TENANTS,
  DEMO_TRIALS
} from '../mocks/platform-demo.data';

@Injectable({ providedIn: 'root' })
export class PlatformWorkspaceFacade {
  readonly tenants = signal<TenantSummaryDto[]>([]);
  readonly tenantDetail = signal<TenantDetailDto | null>(null);
  readonly trials = signal<TrialSummaryDto[]>([]);
  readonly subscriptions = signal<SubscriptionSummaryDto[]>([]);
  readonly featureFlags = signal<FeatureFlagDto[]>([]);

  readonly tenantsStatus = signal<AsyncStatus>('idle');
  readonly detailStatus = signal<AsyncStatus>('idle');

  constructor(private readonly platformAdminApiClient: PlatformAdminApiClient) {}

  loadTenants(): void {
    this.tenantsStatus.set('loading');

    this.platformAdminApiClient.listTenants().pipe(
      take(1),
      catchError(() => of(DEMO_TENANTS))
    ).subscribe((tenants: TenantSummaryDto[]) => {
      this.tenants.set(tenants);
      this.tenantsStatus.set('success');
    });
  }

  loadTenantDetail(tenantId: string): void {
    this.detailStatus.set('loading');

    this.platformAdminApiClient.getTenantDetail(tenantId).pipe(
      take(1),
      catchError(() => of({ ...DEMO_TENANT_DETAIL, tenantId }))
    ).subscribe((tenantDetail: TenantDetailDto) => {
      this.tenantDetail.set(tenantDetail);
      this.detailStatus.set('success');
    });
  }

  loadSupportData(): void {
    this.platformAdminApiClient.listTrials().pipe(
      take(1),
      catchError(() => of(DEMO_TRIALS))
    ).subscribe((trials: TrialSummaryDto[]) => this.trials.set(trials));

    this.platformAdminApiClient.listSubscriptions().pipe(
      take(1),
      catchError(() => of(DEMO_SUBSCRIPTIONS))
    ).subscribe((subscriptions: SubscriptionSummaryDto[]) => this.subscriptions.set(subscriptions));

    this.platformAdminApiClient.listFeatureFlags().pipe(
      take(1),
      catchError(() => of(DEMO_FEATURE_FLAGS))
    ).subscribe((featureFlags: FeatureFlagDto[]) => this.featureFlags.set(featureFlags));
  }
}
