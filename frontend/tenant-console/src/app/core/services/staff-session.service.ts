import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class StaffSessionService {
  readonly isAuthenticated = signal(false);
}
