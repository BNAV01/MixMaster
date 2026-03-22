import { Injectable, signal } from '@angular/core';
import {
  CreateTenantSupportTicketRequestDto,
  CreateTenantBranchRequestDto,
  CreateTenantBrandRequestDto,
  SaveTenantMenuWorkspaceRequestDto,
  CreateTenantStaffUserRequestDto,
  ReplyTenantSupportTicketRequestDto,
  ResolveTenantSupportTicketRequestDto,
  TenantAdminApiClient,
  TenantDashboardDto,
  TenantMenuWorkspaceDto,
  TenantOrganizationDto,
  TenantRoleDto,
  TenantStaffUserDto,
  TenantSupportTicketDetailDto,
  TenantSupportTicketSummaryDto,
  UpdateTenantBranchRequestDto,
  UpdateTenantStaffUserAccessRequestDto,
  UpdateTenantStaffUserStatusRequestDto
} from '@mixmaster/shared/api-clients';
import { AsyncStatus, NormalizedApiError } from '@mixmaster/shared/models';
import { take } from 'rxjs';
import { TenantContextService } from '../services/tenant-context.service';

@Injectable({ providedIn: 'root' })
export class TenantWorkspaceFacade {
  readonly dashboard = signal<TenantDashboardDto | null>(null);
  readonly organization = signal<TenantOrganizationDto | null>(null);
  readonly menuWorkspace = signal<TenantMenuWorkspaceDto | null>(null);
  readonly roles = signal<TenantRoleDto[]>([]);
  readonly staffUsers = signal<TenantStaffUserDto[]>([]);
  readonly supportTickets = signal<TenantSupportTicketSummaryDto[]>([]);
  readonly supportTicketDetail = signal<TenantSupportTicketDetailDto | null>(null);

  readonly dashboardStatus = signal<AsyncStatus>('idle');
  readonly organizationStatus = signal<AsyncStatus>('idle');
  readonly menuWorkspaceStatus = signal<AsyncStatus>('idle');
  readonly rolesStatus = signal<AsyncStatus>('idle');
  readonly staffUsersStatus = signal<AsyncStatus>('idle');
  readonly supportTicketsStatus = signal<AsyncStatus>('idle');
  readonly supportTicketDetailStatus = signal<AsyncStatus>('idle');
  readonly saveStatus = signal<AsyncStatus>('idle');
  readonly errorMessage = signal<string | null>(null);

  constructor(
    private readonly tenantAdminApiClient: TenantAdminApiClient,
    private readonly tenantContextService: TenantContextService
  ) {}

  loadDashboard(): void {
    this.dashboardStatus.set('loading');
    this.errorMessage.set(null);
    const branchId = this.tenantContextService.activeBranch() ?? undefined;

    this.tenantAdminApiClient.getDashboard(branchId).pipe(take(1)).subscribe({
      next: (dashboard) => {
        this.dashboard.set(dashboard);
        this.dashboardStatus.set('success');
      },
      error: (error: NormalizedApiError) => {
        this.dashboard.set(null);
        this.dashboardStatus.set('error');
        this.errorMessage.set(error.message);
      }
    });
  }

  loadRoles(): void {
    this.rolesStatus.set('loading');
    this.errorMessage.set(null);

    this.tenantAdminApiClient.listRoles().pipe(take(1)).subscribe({
      next: (roles) => {
        this.roles.set(roles);
        this.rolesStatus.set('success');
      },
      error: (error: NormalizedApiError) => {
        this.roles.set([]);
        this.rolesStatus.set('error');
        this.errorMessage.set(error.message);
      }
    });
  }

  loadOrganization(): void {
    this.organizationStatus.set('loading');
    this.errorMessage.set(null);

    this.tenantAdminApiClient.getOrganization().pipe(take(1)).subscribe({
      next: (organization) => {
        this.organization.set(organization);
        this.organizationStatus.set('success');
      },
      error: (error: NormalizedApiError) => {
        this.organization.set(null);
        this.organizationStatus.set('error');
        this.errorMessage.set(error.message);
      }
    });
  }

  loadMenuWorkspace(): void {
    this.menuWorkspaceStatus.set('loading');
    this.errorMessage.set(null);
    const branchId = this.tenantContextService.activeBranch() ?? undefined;

    this.tenantAdminApiClient.getMenuWorkspace(branchId).pipe(take(1)).subscribe({
      next: (menuWorkspace) => {
        this.menuWorkspace.set(menuWorkspace);
        this.menuWorkspaceStatus.set('success');
      },
      error: (error: NormalizedApiError) => {
        this.menuWorkspace.set(null);
        this.menuWorkspaceStatus.set('error');
        this.errorMessage.set(error.message);
      }
    });
  }

  saveMenuWorkspace(payload: SaveTenantMenuWorkspaceRequestDto): void {
    this.saveStatus.set('loading');
    this.errorMessage.set(null);

    this.tenantAdminApiClient.saveMenuWorkspace(payload).pipe(take(1)).subscribe({
      next: (menuWorkspace) => {
        this.menuWorkspace.set(menuWorkspace);
        this.menuWorkspaceStatus.set('success');
        this.saveStatus.set('success');
      },
      error: (error: NormalizedApiError) => {
        this.saveStatus.set('error');
        this.errorMessage.set(error.message);
      }
    });
  }

  publishMenuWorkspace(): void {
    this.saveStatus.set('loading');
    this.errorMessage.set(null);
    const branchId = this.tenantContextService.activeBranch() ?? undefined;

    this.tenantAdminApiClient.publishMenuWorkspace(branchId).pipe(take(1)).subscribe({
      next: (menuWorkspace) => {
        this.menuWorkspace.set(menuWorkspace);
        this.menuWorkspaceStatus.set('success');
        this.saveStatus.set('success');
      },
      error: (error: NormalizedApiError) => {
        this.saveStatus.set('error');
        this.errorMessage.set(error.message);
      }
    });
  }

  loadStaffUsers(): void {
    this.staffUsersStatus.set('loading');
    this.errorMessage.set(null);

    this.tenantAdminApiClient.listStaffUsers().pipe(take(1)).subscribe({
      next: (staffUsers) => {
        this.staffUsers.set(staffUsers);
        this.staffUsersStatus.set('success');
      },
      error: (error: NormalizedApiError) => {
        this.staffUsers.set([]);
        this.staffUsersStatus.set('error');
        this.errorMessage.set(error.message);
      }
    });
  }

  createStaffUser(payload: CreateTenantStaffUserRequestDto): void {
    this.saveStatus.set('loading');
    this.errorMessage.set(null);

    this.tenantAdminApiClient.createStaffUser(payload).pipe(take(1)).subscribe({
      next: (staffUser) => {
        this.staffUsers.update((currentUsers) => [...currentUsers, staffUser].sort((left, right) => left.fullName.localeCompare(right.fullName)));
        this.saveStatus.set('success');
      },
      error: (error: NormalizedApiError) => {
        this.saveStatus.set('error');
        this.errorMessage.set(error.message);
      }
    });
  }

  createBrand(payload: CreateTenantBrandRequestDto): void {
    this.saveStatus.set('loading');
    this.errorMessage.set(null);

    this.tenantAdminApiClient.createBrand(payload).pipe(take(1)).subscribe({
      next: () => {
        this.saveStatus.set('success');
        this.loadOrganization();
      },
      error: (error: NormalizedApiError) => {
        this.saveStatus.set('error');
        this.errorMessage.set(error.message);
      }
    });
  }

  createBranch(payload: CreateTenantBranchRequestDto): void {
    this.saveStatus.set('loading');
    this.errorMessage.set(null);

    this.tenantAdminApiClient.createBranch(payload).pipe(take(1)).subscribe({
      next: () => {
        this.saveStatus.set('success');
        this.loadOrganization();
      },
      error: (error: NormalizedApiError) => {
        this.saveStatus.set('error');
        this.errorMessage.set(error.message);
      }
    });
  }

  updateBranch(branchId: string, payload: UpdateTenantBranchRequestDto): void {
    this.saveStatus.set('loading');
    this.errorMessage.set(null);

    this.tenantAdminApiClient.updateBranch(branchId, payload).pipe(take(1)).subscribe({
      next: () => {
        this.saveStatus.set('success');
        this.loadOrganization();
      },
      error: (error: NormalizedApiError) => {
        this.saveStatus.set('error');
        this.errorMessage.set(error.message);
      }
    });
  }

  updateStaffUserStatus(userId: string, payload: UpdateTenantStaffUserStatusRequestDto): void {
    this.saveStatus.set('loading');
    this.errorMessage.set(null);

    this.tenantAdminApiClient.updateStaffUserStatus(userId, payload).pipe(take(1)).subscribe({
      next: (staffUser) => {
        this.staffUsers.update((currentUsers) => currentUsers.map((currentUser) => currentUser.userId === userId ? staffUser : currentUser));
        this.saveStatus.set('success');
      },
      error: (error: NormalizedApiError) => {
        this.saveStatus.set('error');
        this.errorMessage.set(error.message);
      }
    });
  }

  updateStaffUserAccess(userId: string, payload: UpdateTenantStaffUserAccessRequestDto): void {
    this.saveStatus.set('loading');
    this.errorMessage.set(null);

    this.tenantAdminApiClient.updateStaffUserAccess(userId, payload).pipe(take(1)).subscribe({
      next: (staffUser) => {
        this.staffUsers.update((currentUsers) => currentUsers.map((currentUser) => currentUser.userId === userId ? staffUser : currentUser));
        this.saveStatus.set('success');
      },
      error: (error: NormalizedApiError) => {
        this.saveStatus.set('error');
        this.errorMessage.set(error.message);
      }
    });
  }

  resetStaffPassword(userId: string, temporaryPassword: string, requireReset: boolean): void {
    this.saveStatus.set('loading');
    this.errorMessage.set(null);

    this.tenantAdminApiClient.resetStaffUserPassword(userId, {
      newPassword: temporaryPassword,
      requireReset
    }).pipe(take(1)).subscribe({
      next: (staffUser) => {
        this.staffUsers.update((currentUsers) => currentUsers.map((currentUser) => currentUser.userId === userId ? staffUser : currentUser));
        this.saveStatus.set('success');
      },
      error: (error: NormalizedApiError) => {
        this.saveStatus.set('error');
        this.errorMessage.set(error.message);
      }
    });
  }

  loadSupportTickets(): void {
    this.supportTicketsStatus.set('loading');
    this.errorMessage.set(null);

    this.tenantAdminApiClient.listSupportTickets().pipe(take(1)).subscribe({
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

    this.tenantAdminApiClient.getSupportTicket(ticketId).pipe(take(1)).subscribe({
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

  createSupportTicket(payload: CreateTenantSupportTicketRequestDto): void {
    this.saveStatus.set('loading');
    this.errorMessage.set(null);

    this.tenantAdminApiClient.createSupportTicket(payload).pipe(take(1)).subscribe({
      next: (ticket) => {
        this.supportTicketDetail.set(ticket);
        this.syncSupportTicketSummary(ticket.summary);
        this.saveStatus.set('success');
      },
      error: (error: NormalizedApiError) => {
        this.saveStatus.set('error');
        this.errorMessage.set(error.message);
      }
    });
  }

  replySupportTicket(ticketId: string, payload: ReplyTenantSupportTicketRequestDto): void {
    this.saveStatus.set('loading');
    this.errorMessage.set(null);

    this.tenantAdminApiClient.replySupportTicket(ticketId, payload).pipe(take(1)).subscribe({
      next: (ticket) => {
        this.supportTicketDetail.set(ticket);
        this.syncSupportTicketSummary(ticket.summary);
        this.saveStatus.set('success');
      },
      error: (error: NormalizedApiError) => {
        this.saveStatus.set('error');
        this.errorMessage.set(error.message);
      }
    });
  }

  resolveSupportTicket(ticketId: string, payload: ResolveTenantSupportTicketRequestDto): void {
    this.saveStatus.set('loading');
    this.errorMessage.set(null);

    this.tenantAdminApiClient.resolveSupportTicket(ticketId, payload).pipe(take(1)).subscribe({
      next: (ticket) => {
        this.supportTicketDetail.set(ticket);
        this.syncSupportTicketSummary(ticket.summary);
        this.saveStatus.set('success');
      },
      error: (error: NormalizedApiError) => {
        this.saveStatus.set('error');
        this.errorMessage.set(error.message);
      }
    });
  }

  private syncSupportTicketSummary(summary: TenantSupportTicketSummaryDto): void {
    this.supportTickets.update((tickets) => {
      const exists = tickets.some((ticket) => ticket.ticketId === summary.ticketId);
      const next = exists
        ? tickets.map((ticket) => ticket.ticketId === summary.ticketId ? summary : ticket)
        : [summary, ...tickets];
      return [...next].sort((left, right) => right.lastMessageAt.localeCompare(left.lastMessageAt));
    });
  }
}
