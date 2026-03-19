import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { FRONTEND_RUNTIME_CONFIG } from './frontend-runtime-config.token';
import {
  AnalyticsSummaryDto,
  AvailabilityBoardItemDto,
  MenuDraftSummaryDto,
  TenantDashboardDto
} from './tenant-admin-api.contracts';

@Injectable({ providedIn: 'root' })
export class TenantAdminApiClient {
  private readonly httpClient = inject(HttpClient);
  private readonly runtimeConfig = inject(FRONTEND_RUNTIME_CONFIG);

  getDashboard(branchId?: string): Observable<TenantDashboardDto> {
    return this.httpClient.get<TenantDashboardDto>(`${this.runtimeConfig.tenantAdminApiBaseUrl}/dashboard`, {
      params: branchId ? { branchId } : {}
    });
  }

  listMenuDrafts(): Observable<MenuDraftSummaryDto[]> {
    return this.httpClient.get<MenuDraftSummaryDto[]>(`${this.runtimeConfig.tenantAdminApiBaseUrl}/menu/drafts`);
  }

  getAvailabilityBoard(branchId?: string): Observable<AvailabilityBoardItemDto[]> {
    return this.httpClient.get<AvailabilityBoardItemDto[]>(
      `${this.runtimeConfig.tenantAdminApiBaseUrl}/availability`,
      { params: branchId ? { branchId } : {} }
    );
  }

  getAnalyticsSummary(branchId?: string): Observable<AnalyticsSummaryDto> {
    return this.httpClient.get<AnalyticsSummaryDto>(`${this.runtimeConfig.tenantAdminApiBaseUrl}/analytics/summary`, {
      params: branchId ? { branchId } : {}
    });
  }
}
