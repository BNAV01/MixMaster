import { FrontendRuntimeConfig } from '@mixmaster/shared/api-clients';

export const CONSUMER_FRONTEND_RUNTIME_CONFIG: FrontendRuntimeConfig = {
  appId: 'consumer-web',
  publicApiBaseUrl: '/api/consumer/public',
  consumerApiBaseUrl: '/api/consumer',
  tenantAdminApiBaseUrl: '/api/tenant-admin',
  platformAdminApiBaseUrl: '/api/platform-admin',
  realtimeBaseUrl: '/api/realtime',
  realtimeEnabled: false
};
