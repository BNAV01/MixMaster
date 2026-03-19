import { NavigationItem } from '@mixmaster/shared/models';

export const CONSUMER_NAVIGATION: NavigationItem[] = [
  { label: 'Inicio', route: '/experience/start', exact: true },
  { label: 'Carta', route: '/experience/menu' },
  { label: 'Para ti', route: '/experience/recommendations' },
  { label: 'Explorar', route: '/experience/explore' },
  { label: 'Favoritos', route: '/experience/favorites' },
  { label: 'Beneficios', route: '/experience/benefits' }
];
