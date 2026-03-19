export interface NavigationItem {
  label: string;
  route: string;
  icon?: string;
  badge?: string;
  exact?: boolean;
  requiredPermission?: string;
}

export interface BranchScopedNavigationItem extends NavigationItem {
  branchScoped?: boolean;
}
