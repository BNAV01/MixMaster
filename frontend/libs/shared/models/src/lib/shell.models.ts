export interface ShellAction {
  label: string;
  icon?: string;
  tone?: 'neutral' | 'primary' | 'success' | 'warning' | 'danger';
}

export interface ShellBreadcrumb {
  label: string;
  route?: string;
}

export interface CommandAction {
  id: string;
  label: string;
  shortcut?: string;
}
