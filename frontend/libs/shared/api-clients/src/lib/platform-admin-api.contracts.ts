export type PlatformTenantStatusDto = 'TRIAL' | 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED';
export type PlatformTenantOnboardingStageDto =
  | 'OWNER_BOOTSTRAPPED'
  | 'LEGAL_SETUP'
  | 'MENU_BUILD'
  | 'BILLING_REVIEW'
  | 'READY_TO_LAUNCH'
  | 'LIVE';
export type PlatformSubscriptionStatusDto = 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'SUSPENDED' | 'ARCHIVED';
export type PlatformSupportTicketPriorityDto = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type PlatformSupportTicketStatusDto = 'OPEN' | 'WAITING_ON_PLATFORM' | 'WAITING_ON_TENANT' | 'RESOLVED' | 'CLOSED';
export type PlatformEmailProviderDto = 'GOOGLE_WORKSPACE' | 'CUSTOM_SMTP';
export type PlatformEmailTemplateCategoryDto = 'INFORMATIONAL' | 'ONBOARDING' | 'BILLING' | 'SUPPORT' | 'LEGAL' | 'CAMPAIGN' | 'SECURITY';
export type PlatformEmailRecipientModeDto = 'OWNER' | 'BILLING' | 'CUSTOM';

export interface PlatformActorDto {
  userId: string;
  email: string;
  fullName: string;
  roleCode: 'SAAS_SUPER_ADMIN' | 'SAAS_SUPPORT';
  permissions: string[];
}

export interface PlatformLoginRequestDto {
  email: string;
  password: string;
}

export interface PlatformAuthSessionDto {
  accessToken: string;
  refreshToken: string;
  accessExpiresAt: string;
  refreshExpiresAt: string;
  actor: PlatformActorDto;
}

export interface CreateTenantRequestDto {
  name: string;
  code: string;
  timezone: string;
  primaryBrandName: string;
  primaryBrandCode: string;
  primaryBranchName: string;
  primaryBranchCode: string;
  currencyCode: string;
  primaryBranchAddressLine1: string | null;
  primaryBranchCommune: string | null;
  primaryBranchCity: string | null;
  ownerEmail: string;
  ownerFullName: string;
  ownerPassword: string | null;
  legalName: string | null;
  taxId: string | null;
  billingEmail: string | null;
  billingPhone: string | null;
  economicActivity: string | null;
  siiActivityCode: string | null;
  taxAddress: string | null;
  taxCommune: string | null;
  taxCity: string | null;
  legalRepresentativeName: string | null;
  legalRepresentativeTaxId: string | null;
  subscriptionPlanCode: string | null;
  onboardingStage: PlatformTenantOnboardingStageDto | null;
  siiStartActivitiesVerified: boolean;
  status: PlatformTenantStatusDto;
}

export interface UpdateTenantProfileRequestDto {
  name: string | null;
  code: string | null;
  timezone: string | null;
  status: PlatformTenantStatusDto | null;
  legalName: string | null;
  taxId: string | null;
  billingEmail: string | null;
  billingPhone: string | null;
  economicActivity: string | null;
  siiActivityCode: string | null;
  taxAddress: string | null;
  taxCommune: string | null;
  taxCity: string | null;
  legalRepresentativeName: string | null;
  legalRepresentativeTaxId: string | null;
  subscriptionPlanCode: string | null;
  subscriptionStatus: PlatformSubscriptionStatusDto | null;
  trialEndsAt: string | null;
  onboardingStage: PlatformTenantOnboardingStageDto | null;
  siiStartActivitiesVerified: boolean | null;
  primaryBranchId: string | null;
  primaryBranchName: string | null;
  primaryBranchCode: string | null;
  currencyCode: string | null;
  primaryBranchAddressLine1: string | null;
  primaryBranchCommune: string | null;
  primaryBranchCity: string | null;
}

export interface PlatformOverviewDto {
  totalTenants: number;
  activeTenants: number;
  trialTenants: number;
  suspendedTenants: number;
  legalReadyTenants: number;
  onboardingPendingTenants: number;
  expiringTrials: number;
  siiVerifiedTenants: number;
  totalStaffUsers: number;
  activeStaffUsers: number;
  ownersPendingPasswordReset: number;
  openTickets: number;
  urgentTickets: number;
  averageReadinessScore: number;
  newTenantsLast24h: number;
  capturedAt: string;
}

export interface PlatformPlanSummaryDto {
  planCode: string;
  tenantCount: number;
  activeCount: number;
  trialCount: number;
  legalReadyCount: number;
}

export interface PlatformSubscriptionSummaryDto {
  tenantId: string;
  tenantName: string;
  planCode: string;
  subscriptionStatus: PlatformSubscriptionStatusDto;
  trialEndsAt: string | null;
  legalReady: boolean;
  siiStartActivitiesVerified: boolean;
}

export interface PlatformOnboardingItemDto {
  tenantId: string;
  tenantName: string;
  ownerEmail: string | null;
  stage: PlatformTenantOnboardingStageDto;
  legalReady: boolean;
  readinessScore: number;
  nextAction: string;
}

export interface PlatformSupportAlertDto {
  tenantId: string;
  tenantName: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
}

export interface PlatformFeatureFlagDto {
  code: string;
  name: string;
  description: string;
  enabledByDefault: boolean;
  rolloutPolicy: string;
  eligiblePlans: string[];
}

export interface PlatformReportCatalogItemDto {
  reportCode: string;
  name: string;
  description: string;
  scope: 'PLATFORM' | 'TENANT';
  formats: Array<'XLSX' | 'PDF'>;
}

export interface PlatformWorkspaceDto {
  overview: PlatformOverviewDto;
  tenants: TenantSummaryDto[];
  planSummaries: PlatformPlanSummaryDto[];
  subscriptionSummaries: PlatformSubscriptionSummaryDto[];
  onboardingQueue: PlatformOnboardingItemDto[];
  supportAlerts: PlatformSupportAlertDto[];
  featureFlags: PlatformFeatureFlagDto[];
  reportCatalog: PlatformReportCatalogItemDto[];
}

export interface PlatformBootstrapCredentialDto {
  email: string;
  temporaryPassword: string;
  generated: boolean;
  passwordResetRequired: boolean;
}

export interface PlatformTenantBranchDto {
  branchId: string;
  code: string;
  name: string;
  timezone: string;
  currencyCode: string;
  addressLine1: string | null;
  commune: string | null;
  city: string | null;
  active: boolean;
}

export interface TenantSummaryDto {
  tenantId: string;
  code: string;
  name: string;
  legalName: string;
  status: PlatformTenantStatusDto;
  timezone: string;
  brandCount: number;
  branchCount: number;
  ownerEmail: string | null;
  ownerFullName: string | null;
  ownerPasswordResetRequired: boolean;
  subscriptionPlanCode: string;
  subscriptionStatus: PlatformSubscriptionStatusDto;
  onboardingStage: PlatformTenantOnboardingStageDto;
  legalReady: boolean;
  readinessScore: number;
  siiStartActivitiesVerified: boolean;
  openTicketCount: number;
  urgentTicketCount: number;
  staffUserCount: number;
  activeStaffUserCount: number;
  createdAt: string;
  trialEndsAt: string | null;
  telemetryCapturedAt: string | null;
}

export interface TenantDetailDto extends TenantSummaryDto {
  openTicketCount: number;
  urgentTicketCount: number;
  staffUserCount: number;
  activeStaffUserCount: number;
  taxId: string | null;
  billingEmail: string | null;
  billingPhone: string | null;
  economicActivity: string | null;
  siiActivityCode: string | null;
  taxAddress: string | null;
  taxCommune: string | null;
  taxCity: string | null;
  legalRepresentativeName: string | null;
  legalRepresentativeTaxId: string | null;
  activatedAt: string | null;
  suspendedAt: string | null;
  telemetryCapturedAt: string | null;
  missingComplianceItems: string[];
  branches: PlatformTenantBranchDto[];
  bootstrapCredential: PlatformBootstrapCredentialDto | null;
}

export interface PlatformAccountProfileDto {
  userId: string;
  email: string;
  fullName: string;
  roleCode: 'SAAS_SUPER_ADMIN' | 'SAAS_SUPPORT';
  status: 'ACTIVE' | 'LOCKED' | 'DISABLED';
  passwordSetAt: string | null;
  lastLoginAt: string | null;
  activeSessions: number;
}

export interface ChangePlatformPasswordRequestDto {
  currentPassword: string;
  newPassword: string;
}

export interface PlatformEmailSettingsDto {
  settingsId: string | null;
  providerCode: PlatformEmailProviderDto;
  host: string;
  port: number;
  protocol: string;
  authRequired: boolean;
  starttlsEnabled: boolean;
  sslEnabled: boolean;
  username: string | null;
  passwordConfigured: boolean;
  fromName: string;
  fromEmail: string;
  replyToEmail: string | null;
  connectionTimeoutMs: number;
  readTimeoutMs: number;
  writeTimeoutMs: number;
  lastTestSentAt: string | null;
  lastTestStatus: string | null;
  lastTestError: string | null;
}

export interface UpdatePlatformEmailSettingsRequestDto {
  providerCode: PlatformEmailProviderDto;
  host: string;
  port: number;
  protocol: string;
  authRequired: boolean;
  starttlsEnabled: boolean;
  sslEnabled: boolean;
  username: string | null;
  password: string | null;
  fromName: string;
  fromEmail: string;
  replyToEmail: string | null;
  connectionTimeoutMs: number;
  readTimeoutMs: number;
  writeTimeoutMs: number;
}

export interface SendPlatformTestEmailRequestDto {
  recipientEmail: string;
  recipientName: string | null;
}

export interface PlatformEmailTestResultDto {
  recipientEmail: string;
  recipientName: string | null;
  sentAt: string;
  status: string;
}

export interface PlatformEmailPlaceholderDto {
  key: string;
  label: string;
  description: string;
  exampleValue: string;
}

export interface PlatformEmailTemplateSummaryDto {
  templateId: string;
  code: string;
  name: string;
  category: PlatformEmailTemplateCategoryDto;
  active: boolean;
  updatedAt: string;
}

export interface PlatformEmailTemplateDetailDto {
  templateId: string;
  code: string;
  name: string;
  category: PlatformEmailTemplateCategoryDto;
  description: string | null;
  subjectTemplate: string;
  htmlTemplate: string;
  textTemplate: string | null;
  active: boolean;
  placeholderKeys: string[];
  updatedAt: string;
}

export interface CreatePlatformEmailTemplateRequestDto {
  code: string;
  name: string;
  category: PlatformEmailTemplateCategoryDto;
  description: string | null;
  subjectTemplate: string;
  htmlTemplate: string;
  textTemplate: string | null;
  active: boolean;
}

export interface UpdatePlatformEmailTemplateRequestDto extends CreatePlatformEmailTemplateRequestDto {}

export interface PreviewPlatformEmailTemplateRequestDto {
  tenantId: string | null;
  supportTicketId: string | null;
}

export interface PlatformRenderedEmailPreviewDto {
  subject: string;
  htmlBody: string;
  textBody: string;
  unresolvedPlaceholders: string[];
  resolvedPlaceholders: Record<string, string>;
  tenantId: string | null;
  supportTicketId: string | null;
}

export interface DispatchPlatformEmailTemplateRequestDto {
  tenantId: string;
  recipientMode: PlatformEmailRecipientModeDto;
  customRecipientEmail: string | null;
  customRecipientName: string | null;
  supportTicketId: string | null;
}

export interface PlatformEmailDispatchDto {
  templateId: string;
  tenantId: string;
  recipientEmail: string;
  recipientName: string | null;
  sentAt: string;
}

export interface PlatformMessagingWorkspaceDto {
  settings: PlatformEmailSettingsDto;
  placeholders: PlatformEmailPlaceholderDto[];
  templates: PlatformEmailTemplateSummaryDto[];
}

export interface PlatformSupportTicketSummaryDto {
  ticketId: string;
  tenantId: string;
  tenantName: string | null;
  subject: string;
  category: string;
  priority: PlatformSupportTicketPriorityDto;
  status: PlatformSupportTicketStatusDto;
  requestedByEmail: string;
  requestedByName: string;
  assignedPlatformUserId: string | null;
  lastReplyByAudience: 'PLATFORM' | 'STAFF';
  lastMessageAt: string;
  lastTenantMessageAt: string | null;
  lastPlatformReplyAt: string | null;
  resolvedAt: string | null;
  resolutionSummary: string | null;
}

export interface PlatformSupportTicketMessageDto {
  messageId: string;
  authorAudience: 'PLATFORM' | 'STAFF';
  authorDisplayName: string;
  authorEmail: string | null;
  body: string;
  internalNote: boolean;
  createdAt: string;
}

export interface PlatformSupportTicketDetailDto {
  summary: PlatformSupportTicketSummaryDto;
  messages: PlatformSupportTicketMessageDto[];
}

export interface CreatePlatformSupportTicketReplyRequestDto {
  body: string;
  internalNote: boolean;
}

export interface UpdatePlatformSupportTicketRequestDto {
  status: PlatformSupportTicketStatusDto | null;
  priority: PlatformSupportTicketPriorityDto | null;
  assignedPlatformUserId: string | null;
  resolutionSummary: string | null;
}
