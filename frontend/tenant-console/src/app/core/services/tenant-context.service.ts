import { Injectable, computed, signal } from '@angular/core';
import { BrowserStorageService } from '@mixmaster/shared/util';
import { StaffSessionService } from './staff-session.service';

@Injectable({ providedIn: 'root' })
export class TenantContextService {
  private readonly storageKey = 'mixmaster.tenant.context';

  readonly activeTenant = signal<string | null>(null);
  readonly activeBranch = signal<string | null>(null);
  readonly availableBranches = signal<{ id: string; label: string }[]>([
    { id: 'branch-bellavista', label: 'Bellavista' },
    { id: 'branch-providencia', label: 'Providencia' }
  ]);
  readonly isBranchScoped = computed(() => !!this.activeBranch());

  constructor(
    private readonly browserStorageService: BrowserStorageService,
    private readonly staffSessionService: StaffSessionService
  ) {
    this.restore();
    this.ensureContext();
  }

  setActiveTenant(tenantId: string): void {
    this.activeTenant.set(tenantId);
    this.persist();
  }

  setActiveBranch(branchId: string): void {
    this.activeBranch.set(branchId);
    this.persist();
  }

  ensureContext(): void {
    if (!this.activeTenant()) {
      this.activeTenant.set(this.staffSessionService.tenantId() ?? 'tenant-demo');
    }

    if (!this.activeBranch()) {
      this.activeBranch.set(this.staffSessionService.branchId() ?? this.availableBranches()[0]?.id ?? null);
    }

    this.persist();
  }

  private restore(): void {
    const rawValue = this.browserStorageService.getLocalItem(this.storageKey);

    if (!rawValue) {
      return;
    }

    try {
      const parsedValue = JSON.parse(rawValue) as { activeTenant?: string | null; activeBranch?: string | null };
      this.activeTenant.set(parsedValue.activeTenant ?? null);
      this.activeBranch.set(parsedValue.activeBranch ?? null);
    } catch {
      this.browserStorageService.removeLocalItem(this.storageKey);
    }
  }

  private persist(): void {
    this.browserStorageService.setLocalItem(this.storageKey, JSON.stringify({
      activeTenant: this.activeTenant(),
      activeBranch: this.activeBranch()
    }));
  }
}
