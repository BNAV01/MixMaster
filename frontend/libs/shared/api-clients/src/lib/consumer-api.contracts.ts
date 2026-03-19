export interface AnonymousSessionBootstrapRequest {
  qrToken: string;
  stableToken?: string;
}

export interface AnonymousSessionBootstrapResponse {
  sessionId: string;
  anonymousProfileId: string;
  anonymousToken: string;
  tenantId: string;
  branchId: string;
  branchName: string;
  tableLabel?: string;
}

export interface ConsumerPreferencePayload {
  intent: 'safe' | 'explore' | 'help-me-decide';
  tastes: string[];
  dislikes: string[];
  moods: string[];
  explorationLevel: number;
}

export interface RecommendationItemDto {
  productId: string;
  name: string;
  productType: 'cocktail' | 'mocktail' | 'wine' | 'beer' | 'food' | 'other';
  priceLabel: string;
  score: number;
  imageUrl?: string;
  summary: string;
  tags: string[];
  availabilityState: 'available' | 'low-stock' | 'paused' | 'unavailable';
}

export interface RecommendationResultDto {
  resultId: string;
  generatedAt: string;
  mode: 'safe' | 'explore' | 'hybrid';
  headline: string;
  items: RecommendationItemDto[];
}

export interface RecommendationFeedbackPayload {
  recommendationResultId: string;
  sentiment: 'yes' | 'mixed' | 'no';
  adjustments: string[];
}

export interface FavoriteProductDto {
  productId: string;
  name: string;
  reason: string;
}

export interface LoyaltySnapshotDto {
  consumerProfileId?: string;
  levelName: string;
  pointsBalance: number;
  nextRewardLabel?: string;
}
