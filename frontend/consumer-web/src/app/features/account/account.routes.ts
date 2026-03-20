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
        { label: 'Ver beneficios', route: '/experience/benefits' },
        { label: 'Crear cuenta', route: '/register' }
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
        { label: 'Ver favoritos', route: '/experience/favorites' },
        { label: 'Ir a cuenta', route: '/account' }
      ],
      metrics: [
        { label: 'Beneficios', value: 'Desbloqueados', tone: 'accent' },
        { label: 'Fricción', value: 'Baja' }
      ]
    }
  },
  {
    path: 'account',
    component: ConsumerRoutePageComponent,
    canActivate: [consumerAuthGuard],
    title: 'Account Overview',
    data: {
      pageId: 'account-overview',
      eyebrow: 'Consumer Account',
      title: 'Tu cuenta MixMaster',
      description: 'Resumen de identidad, historial, favoritos, beneficios y continuidad entre visitas.',
      actions: ['Ver historial', 'Ver favoritos', 'Gestionar cuenta'],
      quickLinks: [
        { label: 'Historial', route: '/account/history' },
        { label: 'Favoritos', route: '/account/favorites' },
        { label: 'Beneficios', route: '/account/benefits' },
        { label: 'Ajustes', route: '/account/settings' }
      ],
      metrics: [
        { label: 'Sesion', value: 'Registrada', tone: 'accent' },
        { label: 'Merge', value: 'Disponible si aplica' }
      ]
    }
  },
  {
    path: 'account/history',
    component: ConsumerRoutePageComponent,
    canActivate: [consumerAuthGuard],
    title: 'Account History',
    data: {
      pageId: 'account-history',
      eyebrow: 'Consumer Account',
      title: 'Historial persistente',
      description: 'Revisa recomendaciones vistas, selecciones previas, feedback enviado y continuidad entre visitas.',
      actions: ['Repetir favorito', 'Volver a una recomendacion', 'Fusionar si falta algo'],
      quickLinks: [
        { label: 'Resumen de cuenta', route: '/account' },
        { label: 'Favoritos', route: '/account/favorites' },
        { label: 'Beneficios', route: '/account/benefits' }
      ],
      metrics: [
        { label: 'Persistencia', value: 'Multivisita', tone: 'accent' },
        { label: 'Origen', value: 'Anonimo + registrado' }
      ]
    }
  },
  {
    path: 'account/favorites',
    component: ConsumerRoutePageComponent,
    canActivate: [consumerAuthGuard],
    title: 'Account Favorites',
    data: {
      pageId: 'account-favorites',
      eyebrow: 'Consumer Account',
      title: 'Tus favoritos guardados',
      description: 'Coleccion persistente de picks seguros, descubrimientos y combinaciones para volver sin empezar de cero.',
      actions: ['Repetir visita', 'Abrir carta', 'Explorar desde favoritos'],
      quickLinks: [
        { label: 'Volver a cuenta', route: '/account' },
        { label: 'Ver historial', route: '/account/history' },
        { label: 'Explorar', route: '/experience/explore' }
      ],
      metrics: [
        { label: 'Persistencia', value: 'En cuenta', tone: 'accent' },
        { label: 'Valor', value: 'Recompra' }
      ]
    }
  },
  {
    path: 'account/benefits',
    component: ConsumerRoutePageComponent,
    canActivate: [consumerAuthGuard],
    title: 'Account Benefits',
    data: {
      pageId: 'account-benefits',
      eyebrow: 'Consumer Account',
      title: 'Wallet de beneficios',
      description: 'Puntos, niveles, recompensas activas y beneficios disponibles para la próxima decisión.',
      actions: ['Ver wallet', 'Revisar progreso', 'Canjear'],
      quickLinks: [
        { label: 'Volver a cuenta', route: '/account' },
        { label: 'Historial', route: '/account/history' },
        { label: 'Favoritos', route: '/account/favorites' }
      ],
      metrics: [
        { label: 'Wallet', value: 'Activa', tone: 'accent' },
        { label: 'Uso', value: 'Durante la visita' }
      ]
    }
  },
  {
    path: 'account/settings',
    component: ConsumerRoutePageComponent,
    canActivate: [consumerAuthGuard],
    title: 'Account Settings',
    data: {
      pageId: 'account-settings',
      eyebrow: 'Consumer Account',
      title: 'Preferencias de cuenta',
      description: 'Gestiona idioma, consentimiento, notificaciones y continuidad entre perfil anónimo y registrado.',
      actions: ['Actualizar datos', 'Ajustar consentimientos', 'Cerrar sesion'],
      quickLinks: [
        { label: 'Volver a cuenta', route: '/account' },
        { label: 'Beneficios', route: '/account/benefits' },
        { label: 'Favoritos', route: '/account/favorites' }
      ],
      metrics: [
        { label: 'Privacidad', value: 'Configurable' },
        { label: 'Control', value: 'Granular', tone: 'accent' }
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
        { label: 'Ver historial anonimo', route: '/experience/history' },
        { label: 'Ver historial de cuenta', route: '/account/history' },
        { label: 'Volver a cuenta', route: '/account' }
      ],
      metrics: [
        { label: 'Origen', value: 'Sesion anonima' },
        { label: 'Destino', value: 'Perfil persistente', tone: 'accent' }
      ]
    }
  }
];
