import { Injectable, computed, signal } from '@angular/core';
import { BrowserStorageService } from '@mixmaster/shared/util';

@Injectable({ providedIn: 'root' })
export class ConsumerAuthService {
  private readonly storageKey = 'mixmaster.consumer.auth';

  readonly accessToken = signal<string | null>(null);
  readonly consumerAccountId = signal<string | null>(null);
  readonly consumerProfileId = signal<string | null>(null);
  readonly displayName = signal<string | null>(null);
  readonly isAuthenticated = computed(() => !!this.accessToken());

  constructor(private readonly browserStorageService: BrowserStorageService) {
    this.restore();
  }

  markAuthenticated(payload: {
    accessToken: string;
    consumerAccountId: string;
    consumerProfileId: string;
    displayName?: string | null;
  }): void {
    this.accessToken.set(payload.accessToken);
    this.consumerAccountId.set(payload.consumerAccountId);
    this.consumerProfileId.set(payload.consumerProfileId);
    this.displayName.set(payload.displayName ?? null);
    this.persist();
  }

  logout(): void {
    this.accessToken.set(null);
    this.consumerAccountId.set(null);
    this.consumerProfileId.set(null);
    this.displayName.set(null);
    this.browserStorageService.removeLocalItem(this.storageKey);
  }

  private restore(): void {
    const rawValue = this.browserStorageService.getLocalItem(this.storageKey);

    if (!rawValue) {
      return;
    }

    try {
      const parsedValue = JSON.parse(rawValue) as {
        accessToken: string;
        consumerAccountId: string;
        consumerProfileId: string;
        displayName?: string | null;
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
      consumerAccountId: this.consumerAccountId(),
      consumerProfileId: this.consumerProfileId(),
      displayName: this.displayName()
    }));
  }
}
