import {
  AnalyticsSummaryDto,
  AvailabilityBoardItemDto,
  MenuDraftSummaryDto,
  TenantDashboardDto
} from '@mixmaster/shared/api-clients';

export const DEMO_TENANT_DASHBOARD: TenantDashboardDto = {
  tenantId: 'tenant-demo',
  branchId: 'branch-bellavista',
  metrics: [
    { label: 'Revenue influido', value: '$1.8M', delta: '+12%' },
    { label: 'Aceptación recomendación', value: '42%', delta: '+4 pts' },
    { label: 'Productos pausados', value: '6', delta: '-2' },
    { label: 'Tickets con maridaje', value: '28%', delta: '+6 pts' }
  ]
};

export const DEMO_MENU_DRAFTS: MenuDraftSummaryDto[] = [
  { draftId: 'draft-weekend-01', name: 'Carta weekend sessions', status: 'draft', updatedAt: '2026-03-19T18:15:00Z' },
  { draftId: 'draft-signatures-02', name: 'Spring signatures', status: 'review', updatedAt: '2026-03-18T21:40:00Z' }
];

export const DEMO_AVAILABILITY_BOARD: AvailabilityBoardItemDto[] = [
  { productId: 'prod-001', name: 'Garden Spritz', state: 'available', updatedAt: '2026-03-19T20:30:00Z' },
  { productId: 'prod-002', name: 'Yuzu Highball', state: 'low-stock', reasonCode: 'LAST_PORTIONS', updatedAt: '2026-03-19T20:28:00Z' },
  { productId: 'prod-003', name: 'Clarified Milk Punch', state: 'paused', reasonCode: 'BAR_PREP', updatedAt: '2026-03-19T20:12:00Z' }
];

export const DEMO_ANALYTICS_SUMMARY: AnalyticsSummaryDto = {
  branchId: 'branch-bellavista',
  influencedRevenue: '$1.8M',
  recommendationAcceptance: '42%',
  repeatVisitRate: '18%'
};
