import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ConsumerAuthService {
  readonly isAuthenticated = signal(false);
}
