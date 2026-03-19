import { Injectable, computed, signal } from '@angular/core';
import { BrowserStorageService } from '@mixmaster/shared/util';

@Injectable({ providedIn: 'root' })
export class StaffSessionService {
  private readonly storageKey = 'mixmaster.tenant.staff-session';

  readonly accessToken = signal<string | null>(null);
  readonly displayName = signal<string | null>(null);
  readonly tenantId = signal<string | null>(null);
  readonly branchId = signal<string | null>(null);
  readonly permissions = signal<string[]>([]);
  readonly isAuthenticated = computed(() => !!this.accessToken());

  constructor(private readonly browserStorageService: BrowserStorageService) {
    this.restore();

    if (!this.accessToken()) {
      this.bootstrapDemoSession();
    }
  }

  markAuthenticated(payload: {
    accessToken: string;
    displayName: string;
    tenantId: string;
    branchId?: string | null;
    permissions: string[];
  }): void {
    this.accessToken.set(payload.accessToken);
    this.displayName.set(payload.displayName);
    this.tenantId.set(payload.tenantId);
    this.branchId.set(payload.branchId ?? null);
    this.permissions.set(payload.permissions);
    this.persist();
  }

  logout(): void {
    this.accessToken.set(null);
    this.displayName.set(null);
    this.tenantId.set(null);
    this.branchId.set(null);
    this.permissions.set([]);
    this.browserStorageService.removeLocalItem(this.storageKey);
  }

  hasPermission(requiredPermission: string | string[]): boolean {
    const requiredPermissions = Array.isArray(requiredPermission) ? requiredPermission : [requiredPermission];
    return requiredPermissions.every((permission) => this.permissions().includes(permission));
  }

  private bootstrapDemoSession(): void {
    this.markAuthenticated({
      accessToken: 'tenant-demo-token',
      displayName: 'Camila Barra',
      tenantId: 'tenant-demo',
      branchId: 'branch-bellavista',
      permissions: [
        'tenant.dashboard.read',
        'tenant.menu.write',
        'tenant.availability.write',
        'tenant.analytics.read',
        'tenant.campaigns.write',
        'tenant.staff.read'
      ]
    });
  }

  private restore(): void {
    const rawValue = this.browserStorageService.getLocalItem(this.storageKey);

    if (!rawValue) {
      return;
    }

    try {
      const parsedValue = JSON.parse(rawValue) as {
        accessToken: string;
        displayName: string;
        tenantId: string;
        branchId?: string | null;
        permissions: string[];
      };

      this.markAuthenticated(parsedValue);
    } catch {
      this.browserStorageService.removeLocalItem(this.storageKey);
    }
  }

  private persist(): void {
    if (!this.accessToken()) {
      return;
    }

    this.browserStorageService.setLocalItem(this.storageKey, JSON.stringify({
      accessToken: this.accessToken(),
      displayName: this.displayName(),
      tenantId: this.tenantId(),
      branchId: this.branchId(),
      permissions: this.permissions()
    }));
  }
}
