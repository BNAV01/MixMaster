export interface NavigationItem {
  label: string;
  route: string;
  section?: string;
  icon?: string;
  badge?: string;
  exact?: boolean;
  requiredPermission?: string;
}

export interface BranchScopedNavigationItem extends NavigationItem {
  branchScoped?: boolean;
}
