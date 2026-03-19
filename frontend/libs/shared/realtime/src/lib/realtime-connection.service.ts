import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, NgZone, PLATFORM_ID, signal } from '@angular/core';
import { RealtimeMessage } from './realtime.models';

export type RealtimeConnectionStatus = 'idle' | 'connecting' | 'connected' | 'reconnecting' | 'error';

@Injectable({ providedIn: 'root' })
export class RealtimeConnectionService {
  readonly status = signal<RealtimeConnectionStatus>('idle');
  readonly lastMessage = signal<RealtimeMessage | null>(null);

  private eventSource: EventSource | null = null;
  private reconnectHandle: ReturnType<typeof setTimeout> | null = null;
  private currentUrl: string | null = null;

  constructor(
    @Inject(DOCUMENT) private readonly document: Document,
    @Inject(PLATFORM_ID) private readonly platformId: object,
    private readonly ngZone: NgZone
  ) {}

  connect(url: string): void {
    if (!isPlatformBrowser(this.platformId) || typeof EventSource === 'undefined') {
      return;
    }

    this.disconnect();
    this.currentUrl = url;
    this.status.set('connecting');

    this.ngZone.runOutsideAngular(() => {
      this.eventSource = new EventSource(url, { withCredentials: true });

      this.eventSource.onopen = () => {
        this.ngZone.run(() => this.status.set('connected'));
      };

      this.eventSource.onmessage = (event) => {
        this.ngZone.run(() => {
          this.lastMessage.set(JSON.parse(event.data) as RealtimeMessage);
        });
      };

      this.eventSource.onerror = () => {
        this.ngZone.run(() => {
          this.status.set('reconnecting');
          this.scheduleReconnect();
        });
      };
    });
  }

  disconnect(): void {
    if (this.reconnectHandle) {
      clearTimeout(this.reconnectHandle);
      this.reconnectHandle = null;
    }

    this.eventSource?.close();
    this.eventSource = null;
    this.status.set('idle');
  }

  private scheduleReconnect(): void {
    if (!this.currentUrl || this.reconnectHandle) {
      return;
    }

    this.eventSource?.close();
    this.reconnectHandle = setTimeout(() => {
      this.reconnectHandle = null;
      this.connect(this.currentUrl!);
    }, 3_000);
  }
}
