import { Injectable, signal } from '@angular/core';
import {
  ChangePlatformPasswordRequestDto,
  CreateTenantRequestDto,
  CreatePlatformSupportTicketReplyRequestDto,
  PlatformAdminApiClient,
  PlatformAccountProfileDto,
  PlatformSupportTicketDetailDto,
  PlatformSupportTicketSummaryDto,
  PlatformWorkspaceDto,
  TenantDetailDto,
  TenantSummaryDto,
  UpdatePlatformSupportTicketRequestDto,
  UpdateTenantProfileRequestDto
} from '@mixmaster/shared/api-clients';
import { AsyncStatus, NormalizedApiError } from '@mixmaster/shared/models';
import { take } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PlatformWorkspaceFacade {
  readonly workspace = signal<PlatformWorkspaceDto | null>(null);
  readonly tenants = signal<TenantSummaryDto[]>([]);
  readonly tenantDetail = signal<TenantDetailDto | null>(null);
  readonly lastProvisionedTenant = signal<TenantDetailDto | null>(null);
  readonly accountProfile = signal<PlatformAccountProfileDto | null>(null);
  readonly supportTickets = signal<PlatformSupportTicketSummaryDto[]>([]);
  readonly supportTicketDetail = signal<PlatformSupportTicketDetailDto | null>(null);
  readonly workspaceStatus = signal<AsyncStatus>('idle');
  readonly tenantsStatus = signal<AsyncStatus>('idle');
  readonly detailStatus = signal<AsyncStatus>('idle');
  readonly createStatus = signal<AsyncStatus>('idle');
  readonly updateStatus = signal<AsyncStatus>('idle');
  readonly accountStatus = signal<AsyncStatus>('idle');
  readonly passwordStatus = signal<AsyncStatus>('idle');
  readonly supportTicketsStatus = signal<AsyncStatus>('idle');
  readonly supportTicketDetailStatus = signal<AsyncStatus>('idle');
  readonly supportTicketSaveStatus = signal<AsyncStatus>('idle');
  readonly errorMessage = signal<string | null>(null);

  constructor(private readonly platformAdminApiClient: PlatformAdminApiClient) {}

  loadWorkspace(): void {
    this.workspaceStatus.set('loading');
    this.errorMessage.set(null);

    this.platformAdminApiClient.loadWorkspace().pipe(take(1)).subscribe({
      next: (workspace) => {
        this.workspace.set(workspace);
        this.tenants.set(workspace.tenants);
        this.workspaceStatus.set('success');
      },
      error: (error: NormalizedApiError) => {
        this.workspace.set(null);
        this.workspaceStatus.set('error');
        this.errorMessage.set(error.message);
      }
    });
  }

  refreshWorkspace(): void {
    this.workspaceStatus.set('loading');
    this.errorMessage.set(null);

    this.platformAdminApiClient.refreshWorkspace().pipe(take(1)).subscribe({
      next: (workspace) => {
        this.workspace.set(workspace);
        this.tenants.set(workspace.tenants);
        this.workspaceStatus.set('success');
        this.tenantsStatus.set('success');
      },
      error: (error: NormalizedApiError) => {
        this.workspaceStatus.set('error');
        this.errorMessage.set(error.message);
      }
    });
  }

  loadTenants(): void {
    this.tenantsStatus.set('loading');
    this.errorMessage.set(null);

    this.platformAdminApiClient.listTenants().pipe(take(1)).subscribe({
      next: (tenants) => {
        this.tenants.set(tenants);
        this.tenantsStatus.set('success');
      },
      error: (error: NormalizedApiError) => {
        this.tenants.set([]);
        this.tenantsStatus.set('error');
        this.errorMessage.set(error.message);
      }
    });
  }

  loadTenantDetail(tenantId: string): void {
    this.detailStatus.set('loading');
    this.errorMessage.set(null);

    this.platformAdminApiClient.getTenantDetail(tenantId).pipe(take(1)).subscribe({
      next: (tenantDetail) => {
        this.tenantDetail.set(tenantDetail);
        this.detailStatus.set('success');
      },
      error: (error: NormalizedApiError) => {
        this.tenantDetail.set(null);
        this.detailStatus.set('error');
        this.errorMessage.set(error.message);
      }
    });
  }

  refreshTenant(tenantId: string): void {
    this.detailStatus.set('loading');
    this.errorMessage.set(null);

    this.platformAdminApiClient.refreshTenant(tenantId).pipe(take(1)).subscribe({
      next: (tenantDetail) => {
        this.tenantDetail.set(tenantDetail);
        this.syncTenantSummary(tenantDetail);
        this.detailStatus.set('success');
      },
      error: (error: NormalizedApiError) => {
        this.detailStatus.set('error');
        this.errorMessage.set(error.message);
      }
    });
  }

  createTenant(payload: CreateTenantRequestDto): void {
    this.createStatus.set('loading');
    this.errorMessage.set(null);

    this.platformAdminApiClient.createTenant(payload).pipe(take(1)).subscribe({
      next: (tenant) => {
        this.tenantDetail.set(tenant);
        this.lastProvisionedTenant.set(tenant);
        this.createStatus.set('success');
        this.refreshWorkspace();
      },
      error: (error: NormalizedApiError) => {
        this.createStatus.set('error');
        this.errorMessage.set(error.message);
      }
    });
  }

  updateTenantProfile(tenantId: string, payload: UpdateTenantProfileRequestDto): void {
    this.updateStatus.set('loading');
    this.errorMessage.set(null);

    this.platformAdminApiClient.updateTenantProfile(tenantId, payload).pipe(take(1)).subscribe({
      next: (tenantDetail) => {
        this.tenantDetail.set(tenantDetail);
        this.syncTenantSummary(tenantDetail);
        this.updateStatus.set('success');
        this.loadWorkspace();
      },
      error: (error: NormalizedApiError) => {
        this.updateStatus.set('error');
        this.errorMessage.set(error.message);
      }
    });
  }

  loadAccountProfile(): void {
    this.accountStatus.set('loading');
    this.errorMessage.set(null);

    this.platformAdminApiClient.getAccountProfile().pipe(take(1)).subscribe({
      next: (profile) => {
        this.accountProfile.set(profile);
        this.accountStatus.set('success');
      },
      error: (error: NormalizedApiError) => {
        this.accountProfile.set(null);
        this.accountStatus.set('error');
        this.errorMessage.set(error.message);
      }
    });
  }

  changePassword(payload: ChangePlatformPasswordRequestDto): void {
    this.passwordStatus.set('loading');
    this.errorMessage.set(null);

    this.platformAdminApiClient.changePassword(payload).pipe(take(1)).subscribe({
      next: (profile) => {
        this.accountProfile.set(profile);
        this.passwordStatus.set('success');
      },
      error: (error: NormalizedApiError) => {
        this.passwordStatus.set('error');
        this.errorMessage.set(error.message);
      }
    });
  }

  loadSupportTickets(): void {
    this.supportTicketsStatus.set('loading');
    this.errorMessage.set(null);

    this.platformAdminApiClient.listSupportTickets().pipe(take(1)).subscribe({
      next: (tickets) => {
        this.supportTickets.set(tickets);
        this.supportTicketsStatus.set('success');
      },
      error: (error: NormalizedApiError) => {
        this.supportTickets.set([]);
        this.supportTicketsStatus.set('error');
        this.errorMessage.set(error.message);
      }
    });
  }

  loadSupportTicket(ticketId: string): void {
    this.supportTicketDetailStatus.set('loading');
    this.errorMessage.set(null);

    this.platformAdminApiClient.getSupportTicket(ticketId).pipe(take(1)).subscribe({
      next: (ticket) => {
        this.supportTicketDetail.set(ticket);
        this.supportTicketDetailStatus.set('success');
      },
      error: (error: NormalizedApiError) => {
        this.supportTicketDetail.set(null);
        this.supportTicketDetailStatus.set('error');
        this.errorMessage.set(error.message);
      }
    });
  }

  replySupportTicket(ticketId: string, payload: CreatePlatformSupportTicketReplyRequestDto): void {
    this.supportTicketSaveStatus.set('loading');
    this.errorMessage.set(null);

    this.platformAdminApiClient.replySupportTicket(ticketId, payload).pipe(take(1)).subscribe({
      next: (ticket) => {
        this.supportTicketDetail.set(ticket);
        this.syncSupportTicketSummary(ticket.summary);
        this.supportTicketSaveStatus.set('success');
      },
      error: (error: NormalizedApiError) => {
        this.supportTicketSaveStatus.set('error');
        this.errorMessage.set(error.message);
      }
    });
  }

  updateSupportTicket(ticketId: string, payload: UpdatePlatformSupportTicketRequestDto): void {
    this.supportTicketSaveStatus.set('loading');
    this.errorMessage.set(null);

    this.platformAdminApiClient.updateSupportTicket(ticketId, payload).pipe(take(1)).subscribe({
      next: (ticket) => {
        this.supportTicketDetail.set(ticket);
        this.syncSupportTicketSummary(ticket.summary);
        this.supportTicketSaveStatus.set('success');
      },
      error: (error: NormalizedApiError) => {
        this.supportTicketSaveStatus.set('error');
        this.errorMessage.set(error.message);
      }
    });
  }

  private syncTenantSummary(detail: TenantDetailDto): void {
    const summary: TenantSummaryDto = {
      tenantId: detail.tenantId,
      code: detail.code,
      name: detail.name,
      legalName: detail.legalName,
      status: detail.status,
      timezone: detail.timezone,
      brandCount: detail.brandCount,
      branchCount: detail.branchCount,
      ownerEmail: detail.ownerEmail,
      ownerFullName: detail.ownerFullName,
      ownerPasswordResetRequired: detail.ownerPasswordResetRequired,
      subscriptionPlanCode: detail.subscriptionPlanCode,
      subscriptionStatus: detail.subscriptionStatus,
      onboardingStage: detail.onboardingStage,
      legalReady: detail.legalReady,
      readinessScore: detail.readinessScore,
      siiStartActivitiesVerified: detail.siiStartActivitiesVerified,
      openTicketCount: detail.openTicketCount,
      urgentTicketCount: detail.urgentTicketCount,
      staffUserCount: detail.staffUserCount,
      activeStaffUserCount: detail.activeStaffUserCount,
      createdAt: detail.createdAt,
      trialEndsAt: detail.trialEndsAt,
      telemetryCapturedAt: detail.telemetryCapturedAt
    };

    this.tenants.update((tenants) => {
      const exists = tenants.some((tenant) => tenant.tenantId === detail.tenantId);
      const next = exists
        ? tenants.map((tenant) => tenant.tenantId === detail.tenantId ? summary : tenant)
        : [...tenants, summary];
      return next.sort((left, right) => left.name.localeCompare(right.name));
    });
  }

  private syncSupportTicketSummary(summary: PlatformSupportTicketSummaryDto): void {
    this.supportTickets.update((tickets) => {
      const exists = tickets.some((ticket) => ticket.ticketId === summary.ticketId);
      const next = exists
        ? tickets.map((ticket) => ticket.ticketId === summary.ticketId ? summary : ticket)
        : [summary, ...tickets];
      return [...next].sort((left, right) => right.lastMessageAt.localeCompare(left.lastMessageAt));
    });
  }
}
