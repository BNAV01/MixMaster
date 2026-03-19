export interface TenantSummaryDto {
  tenantId: string;
  name: string;
  status: 'trial' | 'active' | 'past-due' | 'suspended';
  planName: string;
  branchCount: number;
  onboardingState: 'pending' | 'in-progress' | 'completed';
}

export interface TenantDetailDto extends TenantSummaryDto {
  brandCount: number;
  lastActivityAt?: string;
  supportTier?: string;
}

export interface TrialSummaryDto {
  tenantId: string;
  tenantName: string;
  endsAt: string;
  status: 'active' | 'expiring' | 'expired';
}

export interface SubscriptionSummaryDto {
  subscriptionId: string;
  tenantName: string;
  planName: string;
  status: 'active' | 'past-due' | 'canceled';
  renewalDate?: string;
}

export interface FeatureFlagDto {
  key: string;
  enabled: boolean;
  scope: 'global' | 'tenant';
}
