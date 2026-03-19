import { Routes } from '@angular/router';
import { consumerAuthGuard } from '../../core/guards/consumer-auth.guard';
import { ConsumerRoutePageComponent } from '../experience/pages/consumer-route-page.component';

export const ACCOUNT_ROUTES: Routes = [
  {
    path: 'login',
    component: ConsumerRoutePageComponent,
    title: 'Login',
    data: {
      pageId: 'login',
      eyebrow: 'Consumer Auth',
      title: 'Iniciar sesión',
      description: 'Acceso a historial, favoritos y beneficios sin romper el flujo actual.',
      actions: ['Entrar', 'Volver a experiencia', 'Recuperar acceso'],
      quickLinks: [
        { label: 'Volver a inicio', route: '/experience/start' },
        { label: 'Ver beneficios', route: '/experience/benefits' }
      ],
      metrics: [
        { label: 'Historial', value: 'Persistente', tone: 'accent' },
        { label: 'Merge', value: 'Disponible', tone: 'warning' }
      ]
    }
  },
  {
    path: 'register',
    component: ConsumerRoutePageComponent,
    title: 'Register',
    data: {
      pageId: 'register',
      eyebrow: 'Consumer Auth',
      title: 'Crear cuenta después de recibir valor',
      description: 'Registro ligero para guardar historial y reclamar beneficios desde la visita actual.',
      actions: ['Crear cuenta', 'Fusionar historial', 'Seguir anónimo'],
      quickLinks: [
        { label: 'Volver a recomendaciones', route: '/experience/recommendations' },
        { label: 'Ver favoritos', route: '/experience/favorites' }
      ],
      metrics: [
        { label: 'Beneficios', value: 'Desbloqueados', tone: 'accent' },
        { label: 'Fricción', value: 'Baja' }
      ]
    }
  },
  {
    path: 'account/merge-history',
    component: ConsumerRoutePageComponent,
    canActivate: [consumerAuthGuard],
    title: 'Merge History',
    data: {
      pageId: 'merge-history',
      eyebrow: 'Consumer Auth',
      title: 'Fusion de historial anonimo',
      description: 'Revision final para unir tu actividad anonima con tu cuenta registrada.',
      actions: ['Revisar', 'Confirmar merge', 'Continuar con cuenta'],
      quickLinks: [
        { label: 'Ver historial', route: '/experience/history' },
        { label: 'Ver favoritos', route: '/experience/favorites' }
      ],
      metrics: [
        { label: 'Origen', value: 'Sesion anonima' },
        { label: 'Destino', value: 'Perfil persistente', tone: 'accent' }
      ]
    }
  }
];
