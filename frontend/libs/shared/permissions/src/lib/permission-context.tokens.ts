import { InjectionToken } from '@angular/core';

export const PERMISSION_CHECKER = new InjectionToken<(permission: string | string[]) => boolean>(
  'PERMISSION_CHECKER',
  {
    providedIn: 'root',
    factory: () => () => false
  }
);

export const TENANT_SCOPE_RESOLVER = new InjectionToken<() => boolean>('TENANT_SCOPE_RESOLVER', {
  providedIn: 'root',
  factory: () => () => false
});

export const BRANCH_SCOPE_RESOLVER = new InjectionToken<() => boolean>('BRANCH_SCOPE_RESOLVER', {
  providedIn: 'root',
  factory: () => () => false
});
