import { Injectable, computed, signal } from '@angular/core';
import { BrowserStorageService } from '@mixmaster/shared/util';

@Injectable({ providedIn: 'root' })
export class PlatformSessionService {
  private readonly storageKey = 'mixmaster.platform.session';

  readonly accessToken = signal<string | null>(null);
  readonly displayName = signal<string | null>(null);
  readonly permissions = signal<string[]>([]);
  readonly isAuthenticated = computed(() => !!this.accessToken());

  constructor(private readonly browserStorageService: BrowserStorageService) {
    this.restore();

    if (!this.accessToken()) {
      this.bootstrapDemoSession();
    }
  }

  markAuthenticated(payload: { accessToken: string; displayName: string; permissions: string[] }): void {
    this.accessToken.set(payload.accessToken);
    this.displayName.set(payload.displayName);
    this.permissions.set(payload.permissions);
    this.persist();
  }

  logout(): void {
    this.accessToken.set(null);
    this.displayName.set(null);
    this.permissions.set([]);
    this.browserStorageService.removeLocalItem(this.storageKey);
  }

  hasPermission(requiredPermission: string | string[]): boolean {
    const requiredPermissions = Array.isArray(requiredPermission) ? requiredPermission : [requiredPermission];
    return requiredPermissions.every((permission) => this.permissions().includes(permission));
  }

  private bootstrapDemoSession(): void {
    this.markAuthenticated({
      accessToken: 'platform-demo-token',
      displayName: 'MixMaster Ops',
      permissions: [
        'platform.tenants.read',
        'platform.tenants.write',
        'platform.plans.read',
        'platform.subscriptions.read',
        'platform.flags.write'
      ]
    });
  }

  private restore(): void {
    const rawValue = this.browserStorageService.getLocalItem(this.storageKey);

    if (!rawValue) {
      return;
    }

    try {
      const parsedValue = JSON.parse(rawValue) as { accessToken: string; displayName: string; permissions: string[] };
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
      permissions: this.permissions()
    }));
  }
}
