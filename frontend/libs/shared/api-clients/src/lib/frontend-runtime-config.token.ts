import { InjectionToken } from '@angular/core';

export interface FrontendRuntimeConfig {
  appId: 'consumer-web' | 'tenant-console' | 'saas-admin';
  publicApiBaseUrl: string;
  consumerApiBaseUrl: string;
  tenantAdminApiBaseUrl: string;
  platformAdminApiBaseUrl: string;
  realtimeBaseUrl: string;
}

export const FRONTEND_RUNTIME_CONFIG = new InjectionToken<FrontendRuntimeConfig>('FRONTEND_RUNTIME_CONFIG');
