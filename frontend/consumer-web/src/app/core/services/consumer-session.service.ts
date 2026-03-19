import { Injectable, computed, signal } from '@angular/core';
import { AnonymousSessionBootstrapResponse, QrContextDto } from '@mixmaster/shared/api-clients';
import { BrowserStorageService } from '@mixmaster/shared/util';

@Injectable({ providedIn: 'root' })
export class ConsumerSessionService {
  private readonly storageKey = 'mixmaster.consumer.session';

  readonly activeQrCode = signal<string | null>(null);
  readonly sessionId = signal<string | null>(null);
  readonly anonymousProfileId = signal<string | null>(null);
  readonly anonymousToken = signal<string | null>(null);
  readonly activeTenantId = signal<string | null>(null);
  readonly activeBranchId = signal<string | null>(null);
  readonly activeBranchName = signal<string | null>(null);
  readonly activeTableLabel = signal<string | null>(null);
  readonly hasAnonymousProfile = computed(() => !!this.anonymousProfileId());

  constructor(private readonly browserStorageService: BrowserStorageService) {
    this.restore();
  }

  startQrSession(qrCode: string | null): void {
    this.activeQrCode.set(qrCode);
    this.persist();
  }

  hydrateQrContext(context: QrContextDto): void {
    this.activeQrCode.set(context.qrToken);
    this.activeTenantId.set(context.tenantId);
    this.activeBranchId.set(context.branchId);
    this.activeBranchName.set(context.branchName);
    this.activeTableLabel.set(context.tableLabel ?? null);
    this.persist();
  }

  hydrateAnonymousSession(bootstrap: AnonymousSessionBootstrapResponse): void {
    this.sessionId.set(bootstrap.sessionId);
    this.anonymousProfileId.set(bootstrap.anonymousProfileId);
    this.anonymousToken.set(bootstrap.anonymousToken);
    this.activeTenantId.set(bootstrap.tenantId);
    this.activeBranchId.set(bootstrap.branchId);
    this.activeBranchName.set(bootstrap.branchName);
    this.activeTableLabel.set(bootstrap.tableLabel ?? null);
    this.persist();
  }

  restoreAnonymousProfile(): void {
    this.restore();
  }

  hasActiveSession(): boolean {
    return !!this.sessionId() && !!this.anonymousToken();
  }

  clear(): void {
    this.activeQrCode.set(null);
    this.sessionId.set(null);
    this.anonymousProfileId.set(null);
    this.anonymousToken.set(null);
    this.activeTenantId.set(null);
    this.activeBranchId.set(null);
    this.activeBranchName.set(null);
    this.activeTableLabel.set(null);
    this.browserStorageService.removeLocalItem(this.storageKey);
  }

  private restore(): void {
    const rawValue = this.browserStorageService.getLocalItem(this.storageKey);

    if (!rawValue) {
      return;
    }

    try {
      const parsedValue = JSON.parse(rawValue) as {
        activeQrCode?: string | null;
        sessionId?: string | null;
        anonymousProfileId?: string | null;
        anonymousToken?: string | null;
        activeTenantId?: string | null;
        activeBranchId?: string | null;
        activeBranchName?: string | null;
        activeTableLabel?: string | null;
      };

      this.activeQrCode.set(parsedValue.activeQrCode ?? null);
      this.sessionId.set(parsedValue.sessionId ?? null);
      this.anonymousProfileId.set(parsedValue.anonymousProfileId ?? null);
      this.anonymousToken.set(parsedValue.anonymousToken ?? null);
      this.activeTenantId.set(parsedValue.activeTenantId ?? null);
      this.activeBranchId.set(parsedValue.activeBranchId ?? null);
      this.activeBranchName.set(parsedValue.activeBranchName ?? null);
      this.activeTableLabel.set(parsedValue.activeTableLabel ?? null);
    } catch {
      this.browserStorageService.removeLocalItem(this.storageKey);
    }
  }

  private persist(): void {
    this.browserStorageService.setLocalItem(this.storageKey, JSON.stringify({
      activeQrCode: this.activeQrCode(),
      sessionId: this.sessionId(),
      anonymousProfileId: this.anonymousProfileId(),
      anonymousToken: this.anonymousToken(),
      activeTenantId: this.activeTenantId(),
      activeBranchId: this.activeBranchId(),
      activeBranchName: this.activeBranchName(),
      activeTableLabel: this.activeTableLabel()
    }));
  }
}
