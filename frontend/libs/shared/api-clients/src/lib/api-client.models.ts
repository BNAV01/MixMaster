export type ApiAudience = 'public' | 'consumer' | 'tenant-admin' | 'platform-admin';

export interface ApiRequestContext {
  audience: ApiAudience;
  tenantId?: string;
  branchId?: string;
  accessToken?: string;
  anonymousToken?: string;
  correlationId?: string;
}

export interface ApiRouteConfig {
  baseUrl: string;
  audience: ApiAudience;
}
