import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { FRONTEND_RUNTIME_CONFIG } from './frontend-runtime-config.token';
import {
  CreateTenantSupportTicketRequestDto,
  CreateTenantBranchRequestDto,
  CreateTenantBrandRequestDto,
  CreateTenantStaffUserRequestDto,
  ReplyTenantSupportTicketRequestDto,
  ResetTenantStaffUserPasswordRequestDto,
  TenantActorDto,
  TenantAuthSessionDto,
  TenantDashboardDto,
  TenantLoginRequestDto,
  TenantOrganizationDto,
  TenantRoleDto,
  TenantStaffUserDto,
  TenantSupportTicketDetailDto,
  TenantSupportTicketSummaryDto,
  ResolveTenantSupportTicketRequestDto,
  UpdateTenantBranchRequestDto,
  UpdateTenantStaffUserStatusRequestDto
} from './tenant-admin-api.contracts';

@Injectable({ providedIn: 'root' })
export class TenantAdminApiClient {
  private readonly httpClient = inject(HttpClient);
  private readonly runtimeConfig = inject(FRONTEND_RUNTIME_CONFIG);

  login(payload: TenantLoginRequestDto): Observable<TenantAuthSessionDto> {
    return this.httpClient.post<TenantAuthSessionDto>(`${this.runtimeConfig.tenantAdminApiBaseUrl}/public/auth/login`, payload);
  }

  refresh(refreshToken: string): Observable<TenantAuthSessionDto> {
    return this.httpClient.post<TenantAuthSessionDto>(`${this.runtimeConfig.tenantAdminApiBaseUrl}/public/auth/refresh`, { refreshToken });
  }

  getMe(): Observable<TenantActorDto> {
    return this.httpClient.get<TenantActorDto>(`${this.runtimeConfig.tenantAdminApiBaseUrl}/me`);
  }

  logout(): Observable<void> {
    return this.httpClient.post<void>(`${this.runtimeConfig.tenantAdminApiBaseUrl}/auth/logout`, {});
  }

  getDashboard(branchId?: string): Observable<TenantDashboardDto> {
    return this.httpClient.get<TenantDashboardDto>(`${this.runtimeConfig.tenantAdminApiBaseUrl}/dashboard`, {
      params: branchId ? { branchId } : {}
    });
  }

  listRoles(): Observable<TenantRoleDto[]> {
    return this.httpClient.get<TenantRoleDto[]>(`${this.runtimeConfig.tenantAdminApiBaseUrl}/staff/roles`);
  }

  getOrganization(): Observable<TenantOrganizationDto> {
    return this.httpClient.get<TenantOrganizationDto>(`${this.runtimeConfig.tenantAdminApiBaseUrl}/organization`);
  }

  listStaffUsers(): Observable<TenantStaffUserDto[]> {
    return this.httpClient.get<TenantStaffUserDto[]>(`${this.runtimeConfig.tenantAdminApiBaseUrl}/staff/users`);
  }

  createBrand(payload: CreateTenantBrandRequestDto): Observable<void> {
    return this.httpClient.post<void>(`${this.runtimeConfig.tenantAdminApiBaseUrl}/organization/brands`, payload);
  }

  createBranch(payload: CreateTenantBranchRequestDto): Observable<void> {
    return this.httpClient.post<void>(`${this.runtimeConfig.tenantAdminApiBaseUrl}/organization/branches`, payload);
  }

  updateBranch(branchId: string, payload: UpdateTenantBranchRequestDto): Observable<void> {
    return this.httpClient.patch<void>(`${this.runtimeConfig.tenantAdminApiBaseUrl}/organization/branches/${branchId}`, payload);
  }

  createStaffUser(payload: CreateTenantStaffUserRequestDto): Observable<TenantStaffUserDto> {
    return this.httpClient.post<TenantStaffUserDto>(`${this.runtimeConfig.tenantAdminApiBaseUrl}/staff/users`, payload);
  }

  updateStaffUserStatus(userId: string, payload: UpdateTenantStaffUserStatusRequestDto): Observable<TenantStaffUserDto> {
    return this.httpClient.patch<TenantStaffUserDto>(`${this.runtimeConfig.tenantAdminApiBaseUrl}/staff/users/${userId}/status`, payload);
  }

  resetStaffUserPassword(userId: string, payload: ResetTenantStaffUserPasswordRequestDto): Observable<TenantStaffUserDto> {
    return this.httpClient.post<TenantStaffUserDto>(`${this.runtimeConfig.tenantAdminApiBaseUrl}/staff/users/${userId}/reset-password`, payload);
  }

  listSupportTickets(): Observable<TenantSupportTicketSummaryDto[]> {
    return this.httpClient.get<TenantSupportTicketSummaryDto[]>(`${this.runtimeConfig.tenantAdminApiBaseUrl}/support/tickets`);
  }

  getSupportTicket(ticketId: string): Observable<TenantSupportTicketDetailDto> {
    return this.httpClient.get<TenantSupportTicketDetailDto>(`${this.runtimeConfig.tenantAdminApiBaseUrl}/support/tickets/${ticketId}`);
  }

  createSupportTicket(payload: CreateTenantSupportTicketRequestDto): Observable<TenantSupportTicketDetailDto> {
    return this.httpClient.post<TenantSupportTicketDetailDto>(`${this.runtimeConfig.tenantAdminApiBaseUrl}/support/tickets`, payload);
  }

  replySupportTicket(ticketId: string, payload: ReplyTenantSupportTicketRequestDto): Observable<TenantSupportTicketDetailDto> {
    return this.httpClient.post<TenantSupportTicketDetailDto>(`${this.runtimeConfig.tenantAdminApiBaseUrl}/support/tickets/${ticketId}/messages`, payload);
  }

  resolveSupportTicket(ticketId: string, payload: ResolveTenantSupportTicketRequestDto): Observable<TenantSupportTicketDetailDto> {
    return this.httpClient.post<TenantSupportTicketDetailDto>(`${this.runtimeConfig.tenantAdminApiBaseUrl}/support/tickets/${ticketId}/resolve`, payload);
  }
}
