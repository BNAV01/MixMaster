import { NavigationItem } from '@mixmaster/shared/models';

export const TENANT_NAVIGATION: NavigationItem[] = [
  { label: 'Dashboard', route: '/dashboard' },
  { label: 'Sucursal', route: '/branches/current/dashboard' },
  { label: 'Carta', route: '/menu' },
  { label: 'Productos', route: '/products' },
  { label: 'Disponibilidad', route: '/availability' },
  { label: 'Analítica', route: '/analytics' },
  { label: 'Campañas', route: '/campaigns' },
  { label: 'Loyalty', route: '/loyalty' },
  { label: 'Staff', route: '/staff' },
  { label: 'Cadena', route: '/chain/executive' },
  { label: 'Settings', route: '/settings' }
];
