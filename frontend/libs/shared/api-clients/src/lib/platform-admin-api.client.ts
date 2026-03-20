import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { FRONTEND_RUNTIME_CONFIG } from './frontend-runtime-config.token';
import {
  ChangePlatformPasswordRequestDto,
  CreateTenantRequestDto,
  CreatePlatformEmailTemplateRequestDto,
  CreatePlatformSupportTicketReplyRequestDto,
  DispatchPlatformEmailTemplateRequestDto,
  PlatformActorDto,
  PlatformAccountProfileDto,
  PlatformAuthSessionDto,
  PlatformEmailDispatchDto,
  PlatformEmailTemplateDetailDto,
  PlatformEmailTemplateSummaryDto,
  PlatformEmailTestResultDto,
  PlatformLoginRequestDto,
  PlatformMessagingWorkspaceDto,
  PlatformRenderedEmailPreviewDto,
  PlatformSupportTicketDetailDto,
  PlatformSupportTicketSummaryDto,
  PlatformWorkspaceDto,
  PreviewPlatformEmailTemplateRequestDto,
  SendPlatformTestEmailRequestDto,
  TenantDetailDto,
  TenantSummaryDto,
  UpdatePlatformEmailSettingsRequestDto,
  UpdatePlatformEmailTemplateRequestDto,
  UpdatePlatformSupportTicketRequestDto,
  UpdateTenantProfileRequestDto
} from './platform-admin-api.contracts';

@Injectable({ providedIn: 'root' })
export class PlatformAdminApiClient {
  private readonly httpClient = inject(HttpClient);
  private readonly runtimeConfig = inject(FRONTEND_RUNTIME_CONFIG);

  login(payload: PlatformLoginRequestDto): Observable<PlatformAuthSessionDto> {
    return this.httpClient.post<PlatformAuthSessionDto>(`${this.runtimeConfig.platformAdminApiBaseUrl}/public/auth/login`, payload);
  }

  refresh(refreshToken: string): Observable<PlatformAuthSessionDto> {
    return this.httpClient.post<PlatformAuthSessionDto>(`${this.runtimeConfig.platformAdminApiBaseUrl}/public/auth/refresh`, { refreshToken });
  }

  getMe(): Observable<PlatformActorDto> {
    return this.httpClient.get<PlatformActorDto>(`${this.runtimeConfig.platformAdminApiBaseUrl}/me`);
  }

  logout(): Observable<void> {
    return this.httpClient.post<void>(`${this.runtimeConfig.platformAdminApiBaseUrl}/auth/logout`, {});
  }

  loadWorkspace(): Observable<PlatformWorkspaceDto> {
    return this.httpClient.get<PlatformWorkspaceDto>(`${this.runtimeConfig.platformAdminApiBaseUrl}/workspace`);
  }

  refreshWorkspace(): Observable<PlatformWorkspaceDto> {
    return this.httpClient.post<PlatformWorkspaceDto>(`${this.runtimeConfig.platformAdminApiBaseUrl}/workspace/refresh`, {});
  }

  listTenants(): Observable<TenantSummaryDto[]> {
    return this.httpClient.get<TenantSummaryDto[]>(`${this.runtimeConfig.platformAdminApiBaseUrl}/tenants`);
  }

  getTenantDetail(tenantId: string): Observable<TenantDetailDto> {
    return this.httpClient.get<TenantDetailDto>(`${this.runtimeConfig.platformAdminApiBaseUrl}/tenants/${tenantId}`);
  }

  refreshTenant(tenantId: string): Observable<TenantDetailDto> {
    return this.httpClient.post<TenantDetailDto>(`${this.runtimeConfig.platformAdminApiBaseUrl}/tenants/${tenantId}/refresh`, {});
  }

  createTenant(payload: CreateTenantRequestDto): Observable<TenantDetailDto> {
    return this.httpClient.post<TenantDetailDto>(`${this.runtimeConfig.platformAdminApiBaseUrl}/tenants`, payload);
  }

  updateTenantProfile(tenantId: string, payload: UpdateTenantProfileRequestDto): Observable<TenantDetailDto> {
    return this.httpClient.patch<TenantDetailDto>(`${this.runtimeConfig.platformAdminApiBaseUrl}/tenants/${tenantId}/profile`, payload);
  }

  getAccountProfile(): Observable<PlatformAccountProfileDto> {
    return this.httpClient.get<PlatformAccountProfileDto>(`${this.runtimeConfig.platformAdminApiBaseUrl}/account/profile`);
  }

  changePassword(payload: ChangePlatformPasswordRequestDto): Observable<PlatformAccountProfileDto> {
    return this.httpClient.post<PlatformAccountProfileDto>(`${this.runtimeConfig.platformAdminApiBaseUrl}/account/password`, payload);
  }

  loadMessagingWorkspace(): Observable<PlatformMessagingWorkspaceDto> {
    return this.httpClient.get<PlatformMessagingWorkspaceDto>(`${this.runtimeConfig.platformAdminApiBaseUrl}/messaging/workspace`);
  }

  updateEmailSettings(payload: UpdatePlatformEmailSettingsRequestDto): Observable<PlatformMessagingWorkspaceDto['settings']> {
    return this.httpClient.put<PlatformMessagingWorkspaceDto['settings']>(`${this.runtimeConfig.platformAdminApiBaseUrl}/messaging/settings`, payload);
  }

  sendEmailSettingsTest(payload: SendPlatformTestEmailRequestDto): Observable<PlatformEmailTestResultDto> {
    return this.httpClient.post<PlatformEmailTestResultDto>(`${this.runtimeConfig.platformAdminApiBaseUrl}/messaging/settings/test`, payload);
  }

  listEmailTemplates(): Observable<PlatformEmailTemplateSummaryDto[]> {
    return this.httpClient.get<PlatformEmailTemplateSummaryDto[]>(`${this.runtimeConfig.platformAdminApiBaseUrl}/messaging/templates`);
  }

  getEmailTemplate(templateId: string): Observable<PlatformEmailTemplateDetailDto> {
    return this.httpClient.get<PlatformEmailTemplateDetailDto>(`${this.runtimeConfig.platformAdminApiBaseUrl}/messaging/templates/${templateId}`);
  }

  createEmailTemplate(payload: CreatePlatformEmailTemplateRequestDto): Observable<PlatformEmailTemplateDetailDto> {
    return this.httpClient.post<PlatformEmailTemplateDetailDto>(`${this.runtimeConfig.platformAdminApiBaseUrl}/messaging/templates`, payload);
  }

  updateEmailTemplate(templateId: string, payload: UpdatePlatformEmailTemplateRequestDto): Observable<PlatformEmailTemplateDetailDto> {
    return this.httpClient.put<PlatformEmailTemplateDetailDto>(`${this.runtimeConfig.platformAdminApiBaseUrl}/messaging/templates/${templateId}`, payload);
  }

  deleteEmailTemplate(templateId: string): Observable<void> {
    return this.httpClient.delete<void>(`${this.runtimeConfig.platformAdminApiBaseUrl}/messaging/templates/${templateId}`);
  }

  previewEmailTemplate(templateId: string, payload: PreviewPlatformEmailTemplateRequestDto): Observable<PlatformRenderedEmailPreviewDto> {
    return this.httpClient.post<PlatformRenderedEmailPreviewDto>(
      `${this.runtimeConfig.platformAdminApiBaseUrl}/messaging/templates/${templateId}/preview`,
      payload
    );
  }

  dispatchEmailTemplate(templateId: string, payload: DispatchPlatformEmailTemplateRequestDto): Observable<PlatformEmailDispatchDto> {
    return this.httpClient.post<PlatformEmailDispatchDto>(
      `${this.runtimeConfig.platformAdminApiBaseUrl}/messaging/templates/${templateId}/dispatch`,
      payload
    );
  }

  listSupportTickets(): Observable<PlatformSupportTicketSummaryDto[]> {
    return this.httpClient.get<PlatformSupportTicketSummaryDto[]>(`${this.runtimeConfig.platformAdminApiBaseUrl}/support/tickets`);
  }

  getSupportTicket(ticketId: string): Observable<PlatformSupportTicketDetailDto> {
    return this.httpClient.get<PlatformSupportTicketDetailDto>(`${this.runtimeConfig.platformAdminApiBaseUrl}/support/tickets/${ticketId}`);
  }

  replySupportTicket(ticketId: string, payload: CreatePlatformSupportTicketReplyRequestDto): Observable<PlatformSupportTicketDetailDto> {
    return this.httpClient.post<PlatformSupportTicketDetailDto>(`${this.runtimeConfig.platformAdminApiBaseUrl}/support/tickets/${ticketId}/messages`, payload);
  }

  updateSupportTicket(ticketId: string, payload: UpdatePlatformSupportTicketRequestDto): Observable<PlatformSupportTicketDetailDto> {
    return this.httpClient.patch<PlatformSupportTicketDetailDto>(`${this.runtimeConfig.platformAdminApiBaseUrl}/support/tickets/${ticketId}`, payload);
  }

  exportTenantRegistryWorkbook(): Observable<Blob> {
    return this.httpClient.get(`${this.runtimeConfig.platformAdminApiBaseUrl}/reports/exports/tenant-registry.xlsx`, {
      responseType: 'blob'
    });
  }

  exportTenantReadinessWorkbook(tenantId: string): Observable<Blob> {
    return this.httpClient.get(`${this.runtimeConfig.platformAdminApiBaseUrl}/reports/tenants/${tenantId}/sii-readiness.xlsx`, {
      responseType: 'blob'
    });
  }

  exportTenantReadinessPdf(tenantId: string): Observable<Blob> {
    return this.httpClient.get(`${this.runtimeConfig.platformAdminApiBaseUrl}/reports/tenants/${tenantId}/sii-readiness.pdf`, {
      responseType: 'blob'
    });
  }

  exportTenantF29Workbook(tenantId: string): Observable<Blob> {
    return this.httpClient.get(`${this.runtimeConfig.platformAdminApiBaseUrl}/reports/tenants/${tenantId}/f29-support.xlsx`, {
      responseType: 'blob'
    });
  }

  exportTenantF29Pdf(tenantId: string): Observable<Blob> {
    return this.httpClient.get(`${this.runtimeConfig.platformAdminApiBaseUrl}/reports/tenants/${tenantId}/f29-support.pdf`, {
      responseType: 'blob'
    });
  }
}
