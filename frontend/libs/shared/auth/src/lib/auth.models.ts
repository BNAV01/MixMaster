export type AuthAudience = 'consumer' | 'staff' | 'platform';

export interface AuthSession {
  audience: AuthAudience;
  accessToken: string;
  refreshToken?: string;
  expiresAt: string;
}

export interface ConsumerIdentity {
  consumerAccountId: string;
  consumerProfileId: string;
  displayName?: string;
}

export interface StaffIdentity {
  staffUserId: string;
  tenantId: string;
  branchId?: string;
  permissions: string[];
}
