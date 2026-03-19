import { FrontendRuntimeConfig } from '@mixmaster/shared/api-clients';

export const PLATFORM_FRONTEND_RUNTIME_CONFIG: FrontendRuntimeConfig = {
  appId: 'saas-admin',
  publicApiBaseUrl: '/api/public',
  consumerApiBaseUrl: '/api/consumer',
  tenantAdminApiBaseUrl: '/api/tenant-admin',
  platformAdminApiBaseUrl: '/api/platform-admin',
  realtimeBaseUrl: '/api/realtime'
};
