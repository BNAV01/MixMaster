import { NavigationItem } from '@mixmaster/shared/models';

export const CONSUMER_NAVIGATION: NavigationItem[] = [
  { label: 'Inicio', route: '/experience/start', icon: 'spark', exact: true },
  { label: 'Carta', route: '/menu', icon: 'menu', badge: 'viva' },
  { label: 'Para ti', route: '/experience/recommendations', icon: 'star', badge: 'IA' },
  { label: 'Explorar', route: '/experience/explore', icon: 'compass' },
  { label: 'Favoritos', route: '/experience/favorites', icon: 'heart' },
  { label: 'Historial', route: '/experience/history', icon: 'history' },
  { label: 'Beneficios', route: '/experience/benefits', icon: 'gift', badge: 'wallet' },
  { label: 'Cuenta', route: '/account', icon: 'user' }
];
