import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TenantContextService {
  readonly activeTenant = signal<string | null>('demo-tenant');
  readonly activeBranch = signal<string | null>('main-branch');
}
