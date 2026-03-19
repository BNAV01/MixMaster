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
  itemCount: number;
}

export interface PublishedMenuDto {
  menuId: string;
  versionId: string;
  branchId: string;
  branchName: string;
  sections: PublishedMenuSectionDto[];
  updatedAt: string;
}
