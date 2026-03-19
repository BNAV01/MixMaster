import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { FRONTEND_RUNTIME_CONFIG } from './frontend-runtime-config.token';
import {
  FeatureFlagDto,
  SubscriptionSummaryDto,
  TenantDetailDto,
  TenantSummaryDto,
  TrialSummaryDto
} from './platform-admin-api.contracts';

@Injectable({ providedIn: 'root' })
export class PlatformAdminApiClient {
  private readonly httpClient = inject(HttpClient);
  private readonly runtimeConfig = inject(FRONTEND_RUNTIME_CONFIG);

  listTenants(): Observable<TenantSummaryDto[]> {
    return this.httpClient.get<TenantSummaryDto[]>(`${this.runtimeConfig.platformAdminApiBaseUrl}/tenants`);
  }

  getTenantDetail(tenantId: string): Observable<TenantDetailDto> {
    return this.httpClient.get<TenantDetailDto>(`${this.runtimeConfig.platformAdminApiBaseUrl}/tenants/${tenantId}`);
  }

  listTrials(): Observable<TrialSummaryDto[]> {
    return this.httpClient.get<TrialSummaryDto[]>(`${this.runtimeConfig.platformAdminApiBaseUrl}/trials`);
  }

  listSubscriptions(): Observable<SubscriptionSummaryDto[]> {
    return this.httpClient.get<SubscriptionSummaryDto[]>(`${this.runtimeConfig.platformAdminApiBaseUrl}/subscriptions`);
  }

  listFeatureFlags(): Observable<FeatureFlagDto[]> {
    return this.httpClient.get<FeatureFlagDto[]>(`${this.runtimeConfig.platformAdminApiBaseUrl}/feature-flags`);
  }
}
