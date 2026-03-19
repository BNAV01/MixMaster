export type PermissionScope = 'global' | 'tenant' | 'branch';

export interface PermissionDefinition {
  key: string;
  scope: PermissionScope;
  description: string;
}
