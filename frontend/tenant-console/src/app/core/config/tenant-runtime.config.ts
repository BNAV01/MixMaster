import { FrontendRuntimeConfig } from '@mixmaster/shared/api-clients';

export const TENANT_FRONTEND_RUNTIME_CONFIG: FrontendRuntimeConfig = {
  appId: 'tenant-console',
  publicApiBaseUrl: '/api/public',
  consumerApiBaseUrl: '/api/consumer',
  tenantAdminApiBaseUrl: '/api/tenant-admin',
  platformAdminApiBaseUrl: '/api/platform-admin',
  realtimeBaseUrl: '/api/realtime'
};
