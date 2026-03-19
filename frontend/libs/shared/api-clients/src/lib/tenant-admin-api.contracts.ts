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

export interface MenuDraftSummaryDto {
  draftId: string;
  name: string;
  status: 'draft' | 'review' | 'published';
  updatedAt: string;
}

export interface AvailabilityBoardItemDto {
  productId: string;
  name: string;
  state: 'available' | 'low-stock' | 'paused' | 'unavailable';
  reasonCode?: string;
  updatedAt: string;
}

export interface AnalyticsSummaryDto {
  branchId?: string;
  influencedRevenue: string;
  recommendationAcceptance: string;
  repeatVisitRate: string;
}
