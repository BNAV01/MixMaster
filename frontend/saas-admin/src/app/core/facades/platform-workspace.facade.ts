import { Injectable, signal } from '@angular/core';
import {
  ChangePlatformPasswordRequestDto,
  CreateTenantRequestDto,
  CreatePlatformSupportTicketReplyRequestDto,
  PlatformAdminApiClient,
  PlatformAccountProfileDto,
  PlatformTenantMenuWorkspaceDto,
  PlatformTenantRoleDto,
  PlatformTenantStaffUserDto,
  PlatformSupportTicketDetailDto,
  PlatformSupportTicketSummaryDto,
  PlatformWorkspaceDto,
  ResetPlatformTenantStaffPasswordRequestDto,
  SavePlatformTenantMenuWorkspaceRequestDto,
  TenantDetailDto,
  TenantSummaryDto,
  UpdatePlatformTenantStaffAccessRequestDto,
  UpdatePlatformSupportTicketRequestDto,
  UpdateTenantProfileRequestDto
} from '@mixmaster/shared/api-clients';
import { AsyncStatus, NormalizedApiError } from '@mixmaster/shared/models';
import { finalize, take } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PlatformWorkspaceFacade {
  private tenantDetailRequestId: string | null = null;
  private supportTicketRequestId: string | null = null;
  private tenantStaffRolesRequestId: string | null = null;
  private tenantStaffUsersRequestId: string | null = null;

  readonly workspace = signal<PlatformWorkspaceDto | null>(null);
  readonly tenants = signal<TenantSummaryDto[]>([]);
  readonly tenantDetail = signal<TenantDetailDto | null>(null);
  readonly tenantMenuWorkspace = signal<PlatformTenantMenuWorkspaceDto | null>(null);
  readonly tenantStaffRoles = signal<PlatformTenantRoleDto[]>([]);
  readonly tenantStaffUsers = signal<PlatformTenantStaffUserDto[]>([]);
  readonly lastProvisionedTenant = signal<TenantDetailDto | null>(null);
  readonly accountProfile = signal<PlatformAccountProfileDto | null>(null);
  readonly supportTickets = signal<PlatformSupportTicketSummaryDto[]>([]);
  readonly supportTicketDetail = signal<PlatformSupportTicketDetailDto | null>(null);
  readonly workspaceStatus = signal<AsyncStatus>('idle');
  readonly tenantsStatus = signal<AsyncStatus>('idle');
  readonly detailStatus = signal<AsyncStatus>('idle');
  readonly tenantMenuStatus = signal<AsyncStatus>('idle');
  readonly tenantStaffRolesStatus = signal<AsyncStatus>('idle');
  readonly tenantStaffUsersStatus = signal<AsyncStatus>('idle');
  readonly tenantStaffSaveStatus = signal<AsyncStatus>('idle');
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
    if (this.workspaceStatus() === 'loading') {
      return;
    }

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
    if (this.tenantsStatus() === 'loading') {
      return;
    }

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
    if (this.detailStatus() === 'loading' && this.tenantDetailRequestId === tenantId) {
      return;
    }

    this.tenantDetailRequestId = tenantId;
    this.detailStatus.set('loading');
    this.errorMessage.set(null);

    this.platformAdminApiClient.getTenantDetail(tenantId).pipe(
      take(1),
      finalize(() => {
        if (this.tenantDetailRequestId === tenantId) {
          this.tenantDetailRequestId = null;
        }
      })
    ).subscribe({
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

  resetTenantOwnerCredential(tenantId: string): void {
    this.detailStatus.set('loading');
    this.errorMessage.set(null);

    this.platformAdminApiClient.resetTenantOwnerCredential(tenantId).pipe(take(1)).subscribe({
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

  loadTenantMenuWorkspace(tenantId: string, branchId: string): void {
    this.tenantMenuStatus.set('loading');
    this.errorMessage.set(null);

    this.platformAdminApiClient.getTenantMenuWorkspace(tenantId, branchId).pipe(take(1)).subscribe({
      next: (menuWorkspace) => {
        this.tenantMenuWorkspace.set(menuWorkspace);
        this.tenantMenuStatus.set('success');
      },
      error: (error: NormalizedApiError) => {
        this.tenantMenuWorkspace.set(null);
        this.tenantMenuStatus.set('error');
        this.errorMessage.set(error.message);
      }
    });
  }

  saveTenantMenuWorkspace(tenantId: string, payload: SavePlatformTenantMenuWorkspaceRequestDto): void {
    this.updateStatus.set('loading');
    this.errorMessage.set(null);

    this.platformAdminApiClient.saveTenantMenuWorkspace(tenantId, payload).pipe(take(1)).subscribe({
      next: (menuWorkspace) => {
        this.tenantMenuWorkspace.set(menuWorkspace);
        this.tenantMenuStatus.set('success');
        this.updateStatus.set('success');
      },
      error: (error: NormalizedApiError) => {
        this.updateStatus.set('error');
        this.errorMessage.set(error.message);
      }
    });
  }

  publishTenantMenuWorkspace(tenantId: string, branchId: string): void {
    this.updateStatus.set('loading');
    this.errorMessage.set(null);

    this.platformAdminApiClient.publishTenantMenuWorkspace(tenantId, branchId).pipe(take(1)).subscribe({
      next: (menuWorkspace) => {
        this.tenantMenuWorkspace.set(menuWorkspace);
        this.tenantMenuStatus.set('success');
        this.updateStatus.set('success');
      },
      error: (error: NormalizedApiError) => {
        this.updateStatus.set('error');
        this.errorMessage.set(error.message);
      }
    });
  }

  loadTenantStaffRoles(tenantId: string, force = false): void {
    if (!force && this.tenantStaffRolesStatus() !== 'error' && this.tenantStaffRolesRequestId === tenantId) {
      return;
    }

    this.tenantStaffRolesRequestId = tenantId;
    this.tenantStaffRolesStatus.set('loading');
    this.errorMessage.set(null);

    this.platformAdminApiClient.listTenantStaffRoles(tenantId).pipe(take(1)).subscribe({
      next: (roles) => {
        this.tenantStaffRoles.set(roles);
        this.tenantStaffRolesStatus.set('success');
      },
      error: (error: NormalizedApiError) => {
        this.tenantStaffRoles.set([]);
        this.tenantStaffRolesStatus.set('error');
        this.errorMessage.set(error.message);
      }
    });
  }

  loadTenantStaffUsers(tenantId: string, force = false): void {
    if (!force && this.tenantStaffUsersStatus() !== 'error' && this.tenantStaffUsersRequestId === tenantId) {
      return;
    }

    this.tenantStaffUsersRequestId = tenantId;
    this.tenantStaffUsersStatus.set('loading');
    this.errorMessage.set(null);

    this.platformAdminApiClient.listTenantStaffUsers(tenantId).pipe(take(1)).subscribe({
      next: (staffUsers) => {
        this.tenantStaffUsers.set(staffUsers);
        this.tenantStaffUsersStatus.set('success');
      },
      error: (error: NormalizedApiError) => {
        this.tenantStaffUsers.set([]);
        this.tenantStaffUsersStatus.set('error');
        this.errorMessage.set(error.message);
      }
    });
  }

  updateTenantStaffUserAccess(
    tenantId: string,
    userId: string,
    payload: UpdatePlatformTenantStaffAccessRequestDto
  ): void {
    this.tenantStaffSaveStatus.set('loading');
    this.errorMessage.set(null);

    this.platformAdminApiClient.updateTenantStaffUserAccess(tenantId, userId, payload).pipe(take(1)).subscribe({
      next: (staffUser) => {
        this.syncTenantStaffUser(staffUser);
        this.tenantStaffSaveStatus.set('success');
      },
      error: (error: NormalizedApiError) => {
        this.tenantStaffSaveStatus.set('error');
        this.errorMessage.set(error.message);
      }
    });
  }

  resetTenantStaffUserPassword(
    tenantId: string,
    userId: string,
    payload: ResetPlatformTenantStaffPasswordRequestDto
  ): void {
    this.tenantStaffSaveStatus.set('loading');
    this.errorMessage.set(null);

    this.platformAdminApiClient.resetTenantStaffUserPassword(tenantId, userId, payload).pipe(take(1)).subscribe({
      next: (staffUser) => {
        this.syncTenantStaffUser(staffUser);
        this.tenantStaffSaveStatus.set('success');
      },
      error: (error: NormalizedApiError) => {
        this.tenantStaffSaveStatus.set('error');
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
    if (this.accountStatus() === 'loading') {
      return;
    }

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
    if (this.supportTicketsStatus() === 'loading') {
      return;
    }

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
    if (this.supportTicketDetailStatus() === 'loading' && this.supportTicketRequestId === ticketId) {
      return;
    }

    this.supportTicketRequestId = ticketId;
    this.supportTicketDetailStatus.set('loading');
    this.errorMessage.set(null);

    this.platformAdminApiClient.getSupportTicket(ticketId).pipe(
      take(1),
      finalize(() => {
        if (this.supportTicketRequestId === ticketId) {
          this.supportTicketRequestId = null;
        }
      })
    ).subscribe({
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

  private syncTenantStaffUser(staffUser: PlatformTenantStaffUserDto): void {
    this.tenantStaffUsers.update((staffUsers) => {
      const exists = staffUsers.some((currentUser) => currentUser.userId === staffUser.userId);
      const next = exists
        ? staffUsers.map((currentUser) => currentUser.userId === staffUser.userId ? staffUser : currentUser)
        : [...staffUsers, staffUser];
      return [...next].sort((left, right) => left.fullName.localeCompare(right.fullName));
    });
  }
}
