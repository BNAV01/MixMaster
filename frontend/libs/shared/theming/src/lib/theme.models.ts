export type AppThemeId = 'consumer' | 'tenant-console' | 'saas-admin';

export interface ThemeDescriptor {
  id: AppThemeId;
  bodyClass: string;
  surfaceClass: string;
}
