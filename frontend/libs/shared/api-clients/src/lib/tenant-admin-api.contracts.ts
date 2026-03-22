export type StaffAccessScopeTypeDto = 'TENANT' | 'BRAND' | 'BRANCH';
export type StaffUserStatusDto = 'INVITED' | 'ACTIVE' | 'LOCKED' | 'DISABLED';
export type MenuSourceTypeDto = 'STRUCTURED' | 'PDF';
export type TenantSupportTicketPriorityDto = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TenantSupportTicketStatusDto = 'OPEN' | 'WAITING_ON_PLATFORM' | 'WAITING_ON_TENANT' | 'RESOLVED' | 'CLOSED';

export interface TenantBranchAccessDto {
  branchId: string;
  branchName: string;
  brandId: string;
  brandName: string;
  timezone: string;
  currencyCode: string;
}

export interface TenantActorDto {
  userId: string;
  email: string;
  fullName: string;
  tenantId: string;
  tenantCode: string;
  tenantName: string;
  activeBranchId: string | null;
  passwordResetRequired: boolean;
  roleCodes: string[];
  permissions: string[];
  accessibleBranches: TenantBranchAccessDto[];
}

export interface TenantLoginRequestDto {
  tenantCode: string;
  email: string;
  password: string;
  activeBranchId?: string | null;
}

export interface TenantAuthSessionDto {
  accessToken: string;
  refreshToken: string;
  accessExpiresAt: string;
  refreshExpiresAt: string;
  actor: TenantActorDto;
}

export interface DashboardMetricDto {
  label: string;
  value: string;
  delta?: string;
}

export interface TenantDashboardDto {
  tenantId: string;
  branchId?: string;
  metrics: DashboardMetricDto[];
}

export interface TenantRoleDto {
  roleId: string;
  code: string;
  name: string;
  description: string;
  active: boolean;
  permissions: string[];
}

export interface TenantStaffAssignmentDto {
  assignmentId: string;
  roleCode: string;
  roleName: string;
  scopeType: StaffAccessScopeTypeDto;
  brandId?: string | null;
  brandName?: string | null;
  branchId?: string | null;
  branchName?: string | null;
}

export interface TenantStaffUserDto {
  userId: string;
  email: string;
  fullName: string;
  status: StaffUserStatusDto;
  bootstrapProtected: boolean;
  passwordResetRequired: boolean;
  lastLoginAt?: string | null;
  permissions: string[];
  accessibleBranches: TenantBranchAccessDto[];
  assignments: TenantStaffAssignmentDto[];
}

export interface TenantOrganizationBranchDto {
  branchId: string;
  brandId: string;
  brandName: string;
  code: string;
  name: string;
  timezone: string;
  currencyCode: string;
  active: boolean;
}

export interface TenantOrganizationBrandDto {
  brandId: string;
  code: string;
  name: string;
  active: boolean;
  totalBranchCount: number;
  visibleBranchCount: number;
  branches: TenantOrganizationBranchDto[];
}

export interface TenantOrganizationDto {
  tenantId: string;
  brandCount: number;
  totalBranchCount: number;
  visibleBranchCount: number;
  crossBranchAccess: boolean;
  canWrite: boolean;
  brands: TenantOrganizationBrandDto[];
}

export interface TenantMenuItemDto {
  categoryName: string;
  name: string;
  description?: string | null;
  price: number;
  currencyCode: string;
  productType: string;
  featured: boolean;
}

export interface TenantMenuVersionDto {
  versionId: string;
  menuName: string;
  versionNumber: number;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  sourceType: MenuSourceTypeDto;
  recommendationMode: 'INTEGRATED' | 'CATALOG_ONLY';
  description?: string | null;
  notes: string[];
  items: TenantMenuItemDto[];
  pdfFileName?: string | null;
  pdfContentType?: string | null;
  pdfSizeBytes?: number | null;
  publishedAt?: string | null;
  updatedAt: string;
}

export interface TenantMenuWorkspaceDto {
  menuId?: string | null;
  branchId: string;
  branchName: string;
  brandId: string;
  brandName: string;
  draftVersion?: TenantMenuVersionDto | null;
  publishedVersion?: TenantMenuVersionDto | null;
}

export interface TenantMenuPdfUploadRequestDto {
  fileName: string;
  contentType: string;
  base64: string;
}

export interface SaveTenantMenuWorkspaceRequestDto {
  branchId?: string | null;
  menuName: string;
  menuDescription?: string | null;
  sourceType: MenuSourceTypeDto;
  notes: string[];
  items: TenantMenuItemDto[];
  pdfUpload?: TenantMenuPdfUploadRequestDto | null;
}

export interface CreateTenantStaffAssignmentRequestDto {
  roleCode: string;
  scopeType: StaffAccessScopeTypeDto;
  brandIds?: string[];
  branchIds?: string[];
}

export interface CreateTenantStaffUserRequestDto {
  email: string;
  fullName: string;
  password: string;
  status: StaffUserStatusDto;
  passwordResetRequired: boolean;
  assignments: CreateTenantStaffAssignmentRequestDto[];
}

export interface UpdateTenantStaffUserStatusRequestDto {
  status: StaffUserStatusDto;
}

export interface UpdateTenantStaffUserAccessRequestDto {
  status: StaffUserStatusDto;
  passwordResetRequired: boolean;
  assignments: CreateTenantStaffAssignmentRequestDto[];
}

export interface ResetTenantStaffUserPasswordRequestDto {
  newPassword: string;
  requireReset: boolean;
}

export interface CreateTenantBrandRequestDto {
  code: string;
  name: string;
}

export interface CreateTenantBranchRequestDto {
  brandId: string;
  code: string;
  name: string;
  timezone: string;
  currencyCode: string;
}

export interface UpdateTenantBranchRequestDto {
  name: string;
  timezone: string;
  currencyCode: string;
  active: boolean;
}

export interface TenantSupportTicketSummaryDto {
  ticketId: string;
  tenantId: string;
  branchId: string | null;
  subject: string;
  category: string;
  priority: TenantSupportTicketPriorityDto;
  status: TenantSupportTicketStatusDto;
  requestedByEmail: string;
  requestedByName: string;
  lastReplyByAudience: 'PLATFORM' | 'STAFF';
  lastMessageAt: string;
  lastTenantMessageAt: string | null;
  lastPlatformReplyAt: string | null;
  resolvedAt: string | null;
  resolutionSummary: string | null;
}

export interface TenantSupportTicketMessageDto {
  messageId: string;
  authorAudience: 'PLATFORM' | 'STAFF';
  authorDisplayName: string;
  authorEmail: string | null;
  body: string;
  createdAt: string;
}

export interface TenantSupportTicketDetailDto {
  summary: TenantSupportTicketSummaryDto;
  messages: TenantSupportTicketMessageDto[];
}

export interface CreateTenantSupportTicketRequestDto {
  branchId: string | null;
  subject: string;
  category: 'BILLING' | 'ONBOARDING' | 'OPERATIONS' | 'LEGAL' | 'PRODUCT' | 'INCIDENT' | 'OTHER';
  priority: TenantSupportTicketPriorityDto;
  body: string;
}

export interface ReplyTenantSupportTicketRequestDto {
  body: string;
}

export interface ResolveTenantSupportTicketRequestDto {
  resolutionSummary: string | null;
}
