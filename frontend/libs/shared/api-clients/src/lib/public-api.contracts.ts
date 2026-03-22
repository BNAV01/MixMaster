export interface QrContextDto {
  qrToken: string;
  tenantId: string;
  branchId: string;
  branchName: string;
  tableLabel?: string;
  valid: boolean;
  venueMode: 'table' | 'bar' | 'counter';
}

export interface PublishedMenuSectionDto {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  itemCount: number;
  displayOrder?: number;
  subsections?: PublishedMenuSubsectionDto[];
}

export interface PublishedMenuSocialLinkDto {
  id: string;
  type: 'instagram' | 'tiktok' | 'whatsapp' | 'facebook' | 'web';
  label: string;
  handle?: string;
  url: string;
}

export interface PublishedMenuBrandingDto {
  venueName: string;
  descriptor: string;
  logoUrl?: string;
  heroImageUrl?: string;
  address?: string;
  serviceHoursLabel?: string;
  ambienceNote?: string;
  serviceModeLabel?: string;
  heroTags?: string[];
  socialLinks?: PublishedMenuSocialLinkDto[];
}

export interface PublishedMenuHighlightDto {
  id: string;
  title: string;
  description: string;
}

export interface PublishedMenuModifierOptionDto {
  id: string;
  label: string;
  priceDeltaLabel?: string;
}

export interface PublishedMenuModifierGroupDto {
  id: string;
  title: string;
  selectionRule: string;
  options: PublishedMenuModifierOptionDto[];
}

export interface PublishedMenuItemDto {
  id: string;
  name: string;
  productType: 'cocktail' | 'mocktail' | 'wine' | 'beer' | 'food' | 'dessert' | 'other';
  description: string;
  priceLabel: string;
  imageUrl?: string;
  availabilityState: 'available' | 'low-stock' | 'paused' | 'unavailable';
  preparationNote?: string;
  featuredReason?: string;
  tags: string[];
  customizationGroups?: PublishedMenuModifierGroupDto[];
}

export interface PublishedMenuSubsectionDto {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  displayOrder?: number;
  items: PublishedMenuItemDto[];
}

export interface PublishedMenuDto {
  menuId: string;
  versionId: string;
  branchId: string;
  branchName: string;
  sections: PublishedMenuSectionDto[];
  updatedAt: string;
  sourceType: 'STRUCTURED' | 'PDF';
  recommendationMode: 'INTEGRATED' | 'CATALOG_ONLY';
  hasPdf: boolean;
  branding?: PublishedMenuBrandingDto;
  highlights?: PublishedMenuHighlightDto[];
  notes?: string[];
}
