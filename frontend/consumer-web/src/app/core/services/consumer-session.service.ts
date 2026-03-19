import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ConsumerSessionService {
  readonly hasAnonymousProfile = signal(false);
  readonly activeQrCode = signal<string | null>(null);
}
