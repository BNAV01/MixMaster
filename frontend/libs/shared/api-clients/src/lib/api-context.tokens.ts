import { InjectionToken } from '@angular/core';

export interface TenantContextHeaders {
  tenantKey?: string | null;
  tenantId?: string | null;
  branchId?: string | null;
}

export const ACCESS_TOKEN_RESOLVER = new InjectionToken<() => string | null>(
  'ACCESS_TOKEN_RESOLVER',
  {
    providedIn: 'root',
    factory: () => () => null
  }
);

export const ANONYMOUS_TOKEN_RESOLVER = new InjectionToken<() => string | null>(
  'ANONYMOUS_TOKEN_RESOLVER',
  {
    providedIn: 'root',
    factory: () => () => null
  }
);

export const TENANT_CONTEXT_RESOLVER = new InjectionToken<() => TenantContextHeaders>(
  'TENANT_CONTEXT_RESOLVER',
  {
    providedIn: 'root',
    factory: () => () => ({})
  }
);
