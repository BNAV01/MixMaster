import { FeatureFlagDto, SubscriptionSummaryDto, TenantDetailDto, TenantSummaryDto, TrialSummaryDto } from '@mixmaster/shared/api-clients';

export const DEMO_TENANTS: TenantSummaryDto[] = [
  {
    tenantId: 'tenant-demo',
    name: 'Grupo Bellavista',
    status: 'active',
    planName: 'Pro',
    branchCount: 3,
    onboardingState: 'completed'
  },
  {
    tenantId: 'tenant-riverside',
    name: 'Riverside Bars',
    status: 'trial',
    planName: 'Trial',
    branchCount: 1,
    onboardingState: 'in-progress'
  }
];

export const DEMO_TENANT_DETAIL: TenantDetailDto = {
  tenantId: 'tenant-demo',
  name: 'Grupo Bellavista',
  status: 'active',
  planName: 'Pro',
  branchCount: 3,
  onboardingState: 'completed',
  brandCount: 2,
  lastActivityAt: '2026-03-19T20:30:00Z',
  supportTier: 'Priority'
};

export const DEMO_TRIALS: TrialSummaryDto[] = [
  {
    tenantId: 'tenant-riverside',
    tenantName: 'Riverside Bars',
    endsAt: '2026-03-28T00:00:00Z',
    status: 'expiring'
  }
];

export const DEMO_SUBSCRIPTIONS: SubscriptionSummaryDto[] = [
  {
    subscriptionId: 'sub-001',
    tenantName: 'Grupo Bellavista',
    planName: 'Pro',
    status: 'active',
    renewalDate: '2026-04-01T00:00:00Z'
  }
];

export const DEMO_FEATURE_FLAGS: FeatureFlagDto[] = [
  { key: 'consumer.history-merge', enabled: true, scope: 'global' },
  { key: 'tenant.advanced-analytics', enabled: true, scope: 'tenant' }
];
