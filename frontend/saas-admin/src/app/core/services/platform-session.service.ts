import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PlatformSessionService {
  readonly isAuthenticated = signal(false);
}
