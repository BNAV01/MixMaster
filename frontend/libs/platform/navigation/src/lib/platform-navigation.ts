import { NavigationItem } from '@mixmaster/shared/models';

export const PLATFORM_NAVIGATION: NavigationItem[] = [
  { label: 'Dashboard', route: '/dashboard', section: 'Vista general', requiredPermission: 'platform.tenants.read' },
  { label: 'Tenants', route: '/tenants', section: 'Operación tenant', requiredPermission: 'platform.tenants.read' },
  { label: 'Onboarding', route: '/onboarding', section: 'Operación tenant', requiredPermission: 'platform.onboarding.read' },
  { label: 'Soporte', route: '/support', section: 'Operación tenant', requiredPermission: 'platform.support.read' },
  { label: 'Correos', route: '/communications', section: 'Operación tenant', requiredPermission: 'platform.communications.read' },
  { label: 'Trials', route: '/trials', section: 'Comercial y billing', requiredPermission: 'platform.billing.read' },
  { label: 'Planes', route: '/plans', section: 'Comercial y billing', requiredPermission: 'platform.billing.read' },
  { label: 'Suscripciones', route: '/subscriptions', section: 'Comercial y billing', requiredPermission: 'platform.billing.read' },
  { label: 'Feature Flags', route: '/feature-flags', section: 'Gobierno y releases', requiredPermission: 'platform.flags.read' },
  { label: 'Reportes', route: '/reports', section: 'Gobierno y releases', requiredPermission: 'platform.reports.read' },
  { label: 'Cuenta', route: '/account', section: 'Seguridad', requiredPermission: 'platform.tenants.read' }
];
