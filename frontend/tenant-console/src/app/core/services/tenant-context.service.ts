import { Injectable, effect, signal } from '@angular/core';
import { BrowserStorageService } from '@mixmaster/shared/util';
import { StaffSessionService } from './staff-session.service';

@Injectable({ providedIn: 'root' })
export class TenantContextService {
  private readonly storageKey = 'mixmaster.tenant.context';

  readonly activeTenant = signal<string | null>(null);
  readonly activeTenantKey = signal<string | null>(null);
  readonly activeBranch = signal<string | null>(null);
  readonly availableBranches = signal<{ id: string; label: string }[]>([]);

  constructor(
    private readonly browserStorageService: BrowserStorageService,
    private readonly staffSessionService: StaffSessionService
  ) {
    this.restore();

    effect(() => {
      const actor = this.staffSessionService.actor();
      const branches = actor?.accessibleBranches ?? [];

      this.activeTenant.set(actor?.tenantId ?? null);
      this.activeTenantKey.set(actor?.tenantCode ?? null);
      this.availableBranches.set(branches.map((branch) => ({
        id: branch.branchId,
        label: `${branch.branchName} · ${branch.brandName}`
      })));

      const currentBranchId = this.activeBranch();
      const validCurrentBranch = currentBranchId && branches.some((branch) => branch.branchId === currentBranchId);
      const preferredBranchId = actor?.activeBranchId ?? branches[0]?.branchId ?? null;

      if (!validCurrentBranch) {
        this.activeBranch.set(preferredBranchId);
      }

      this.persist();
    }, { allowSignalWrites: true });
  }

  setActiveBranch(branchId: string): void {
    if (!this.availableBranches().some((branch) => branch.id === branchId)) {
      return;
    }

    this.activeBranch.set(branchId);
    this.persist();
  }

  ensureContext(): void {
    if (!this.activeTenant() && this.staffSessionService.tenantId()) {
      this.activeTenant.set(this.staffSessionService.tenantId());
    }

    if (!this.activeTenantKey() && this.staffSessionService.tenantCode()) {
      this.activeTenantKey.set(this.staffSessionService.tenantCode());
    }

    if (!this.activeBranch() && this.staffSessionService.branchId()) {
      this.activeBranch.set(this.staffSessionService.branchId());
    }

    this.persist();
  }

  private restore(): void {
    const rawValue = this.browserStorageService.getLocalItem(this.storageKey);

    if (!rawValue) {
      return;
    }

    try {
      const parsedValue = JSON.parse(rawValue) as {
        activeTenant?: string | null;
        activeTenantKey?: string | null;
        activeBranch?: string | null;
      };
      this.activeTenant.set(parsedValue.activeTenant ?? null);
      this.activeTenantKey.set(parsedValue.activeTenantKey ?? null);
      this.activeBranch.set(parsedValue.activeBranch ?? null);
    } catch {
      this.browserStorageService.removeLocalItem(this.storageKey);
    }
  }

  private persist(): void {
    this.browserStorageService.setLocalItem(this.storageKey, JSON.stringify({
      activeTenant: this.activeTenant(),
      activeTenantKey: this.activeTenantKey(),
      activeBranch: this.activeBranch()
    }));
  }
}
