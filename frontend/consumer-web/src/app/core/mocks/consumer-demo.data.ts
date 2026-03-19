import {
  AnonymousSessionBootstrapResponse,
  LoyaltySnapshotDto,
  PublishedMenuDto,
  QrContextDto,
  RecommendationResultDto
} from '@mixmaster/shared/api-clients';

export const DEMO_QR_CONTEXT: QrContextDto = {
  qrToken: 'demo-negroni-table-12',
  tenantId: 'tenant-demo',
  branchId: 'branch-bellavista',
  branchName: 'Bellavista Night Bar',
  tableLabel: 'Mesa 12',
  valid: true,
  venueMode: 'table'
};

export const DEMO_ANONYMOUS_SESSION: AnonymousSessionBootstrapResponse = {
  sessionId: 'session-demo-001',
  anonymousProfileId: 'anon-demo-001',
  anonymousToken: 'anon-token-demo',
  tenantId: 'tenant-demo',
  branchId: 'branch-bellavista',
  branchName: 'Bellavista Night Bar',
  tableLabel: 'Mesa 12'
};

export const DEMO_PUBLISHED_MENU: PublishedMenuDto = {
  menuId: 'menu-demo-001',
  versionId: 'menu-version-demo-004',
  branchId: 'branch-bellavista',
  branchName: 'Bellavista Night Bar',
  updatedAt: '2026-03-19T20:45:00Z',
  sections: [
    { id: 'sec-signature', title: 'Signature Cocktails', subtitle: 'La barra de la casa', itemCount: 8 },
    { id: 'sec-classics', title: 'Clásicos', subtitle: 'Versiones impecables', itemCount: 12 },
    { id: 'sec-kitchen', title: 'Bocados y cocina', subtitle: 'Para maridar', itemCount: 9 }
  ]
};

export const DEMO_RECOMMENDATIONS: RecommendationResultDto = {
  resultId: 'reco-demo-001',
  generatedAt: '2026-03-19T20:46:00Z',
  mode: 'hybrid',
  headline: 'Partimos por algo fresco, aromático y fácil de disfrutar.',
  items: [
    {
      productId: 'prod-garden-spritz',
      name: 'Garden Spritz',
      productType: 'cocktail',
      priceLabel: '$8.900',
      score: 96,
      summary: 'Cítrico, herbal y ligero. Ideal para empezar sin saturar.',
      tags: ['fresco', 'cítrico', 'ligero'],
      availabilityState: 'available'
    },
    {
      productId: 'prod-yuzu-highball',
      name: 'Yuzu Highball',
      productType: 'cocktail',
      priceLabel: '$9.400',
      score: 92,
      summary: 'Seco, brillante y más atrevido, pero todavía muy fácil de tomar.',
      tags: ['seco', 'brillante', 'highball'],
      availabilityState: 'low-stock'
    },
    {
      productId: 'prod-oyster-mushroom-toast',
      name: 'Tostada de setas y mantequilla noisette',
      productType: 'food',
      priceLabel: '$7.500',
      score: 90,
      summary: 'Bocado umami que sostiene bien perfiles cítricos y herbales.',
      tags: ['umami', 'maridaje'],
      availabilityState: 'available'
    }
  ]
};

export const DEMO_LOYALTY_SNAPSHOT: LoyaltySnapshotDto = {
  levelName: 'Bronce',
  pointsBalance: 120,
  nextRewardLabel: '200 pts para desbloquear tu primer upgrade.'
};
