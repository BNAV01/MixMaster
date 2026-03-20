import { NavigationItem } from '@mixmaster/shared/models';

export const TENANT_NAVIGATION: NavigationItem[] = [
  { label: 'Dashboard', route: '/dashboard', requiredPermission: 'tenant.dashboard.read' },
  { label: 'Carta', route: '/menu', requiredPermission: 'tenant.menu.read' },
  { label: 'Productos', route: '/products', requiredPermission: 'tenant.menu.read' },
  { label: 'Disponibilidad', route: '/availability', requiredPermission: 'tenant.availability.read' },
  { label: 'Analítica', route: '/analytics', requiredPermission: 'tenant.analytics.read' },
  { label: 'Campañas', route: '/campaigns', requiredPermission: 'tenant.campaigns.read' },
  { label: 'Loyalty', route: '/loyalty', requiredPermission: 'tenant.loyalty.read' },
  { label: 'Sucursales', route: '/branches', requiredPermission: 'tenant.branches.read' },
  { label: 'Staff', route: '/staff', requiredPermission: 'tenant.staff.read' },
  { label: 'Soporte', route: '/support', requiredPermission: 'tenant.tickets.read' },
  { label: 'Cadena', route: '/chain/executive', requiredPermission: 'tenant.analytics.read' },
  { label: 'Settings', route: '/settings', requiredPermission: 'tenant.settings.read' }
];
