import { Routes } from '@angular/router';
import { anonymousSessionGuard } from '../../core/guards/anonymous-session.guard';
import { publishedMenuResolver } from '../../core/resolvers/published-menu.resolver';
import { ConsumerRoutePageComponent } from './pages/consumer-route-page.component';

export const EXPERIENCE_ROUTES: Routes = [
  {
    path: 'start',
    component: ConsumerRoutePageComponent,
    title: 'Experience Start',
    data: {
      pageId: 'start',
      eyebrow: 'Consumer Flow',
      title: 'Empieza a descubrir',
      description: 'Entrada rápida al flujo de recomendación, exploración y carta viva.',
      actions: ['Elegir objetivo', 'Entrar por QR', 'Continuar sin cuenta'],
      quickLinks: [
        { label: 'Ir a preferencias', route: '/experience/preferences' },
        { label: 'Explorar carta', route: '/experience/recommendations' }
      ],
      metrics: [
        { label: 'Cuenta', value: 'Opcional' },
        { label: 'Tiempo', value: '< 30 seg', tone: 'accent' }
      ]
    }
  },
  {
    path: 'menu',
    component: ConsumerRoutePageComponent,
    canActivate: [anonymousSessionGuard],
    resolve: {
      ready: publishedMenuResolver
    },
    title: 'Published Menu',
    data: {
      pageId: 'menu',
      eyebrow: 'Consumer Flow',
      title: 'Carta viva del local',
      description: 'Navega secciones, disponibilidad y productos recomendables sin salir del flujo.',
      actions: ['Ver secciones', 'Buscar algo seguro', 'Explorar categoria'],
      quickLinks: [
        { label: 'Preferencias', route: '/experience/preferences' },
        { label: 'Para ti', route: '/experience/recommendations' }
      ],
      metrics: [
        { label: 'Fuente', value: 'Carta publicada' },
        { label: 'Disponibilidad', value: 'Actualizada', tone: 'accent' }
      ]
    }
  },
  {
    path: 'preferences',
    component: ConsumerRoutePageComponent,
    canActivate: [anonymousSessionGuard],
    title: 'Preferences',
    data: {
      pageId: 'preferences',
      eyebrow: 'Consumer Flow',
      title: 'Gustos y rechazos',
      description: 'Captura rápida de afinidades, dislikes y contexto de la sesión.',
      actions: ['Marcar gustos', 'Marcar rechazos', 'Ajustar contexto'],
      quickLinks: [
        { label: 'Ver resultados', route: '/experience/recommendations' },
        { label: 'Volver al inicio', route: '/experience/start' }
      ],
      metrics: [
        { label: 'Inputs', value: 'Guiados' },
        { label: 'Contexto', value: 'Mesa o barra', tone: 'accent' }
      ]
    }
  },
  {
    path: 'recommendations',
    component: ConsumerRoutePageComponent,
    canActivate: [anonymousSessionGuard],
    title: 'Recommendations',
    data: {
      pageId: 'recommendations',
      eyebrow: 'Consumer Flow',
      title: 'Tus recomendaciones',
      description: 'Resultados principales, explicaciones breves y opciones para seguir afinando.',
      actions: ['Aceptar', 'Refinar', 'Guardar favorito'],
      quickLinks: [
        { label: 'Afinar resultados', route: '/experience/refine' },
        { label: 'Dar feedback', route: '/experience/feedback' }
      ],
      metrics: [
        { label: 'Top picks', value: '3 a 5', tone: 'accent' },
        { label: 'Explicación', value: 'Corta' }
      ]
    }
  },
  {
    path: 'refine',
    component: ConsumerRoutePageComponent,
    canActivate: [anonymousSessionGuard],
    title: 'Refine',
    data: {
      pageId: 'refine',
      eyebrow: 'Consumer Flow',
      title: 'Ajusta sin empezar de cero',
      description: 'Cambia intensidad, dulzor, novedad o maridaje sin perder el contexto ya capturado.',
      actions: ['Más suave', 'Más atrevido', 'Cambiar contexto'],
      quickLinks: [
        { label: 'Volver a resultados', route: '/experience/recommendations' },
        { label: 'Modo exploración', route: '/experience/explore' }
      ],
      metrics: [
        { label: 'Fricción', value: 'Baja' },
        { label: 'Control', value: 'Progresivo', tone: 'accent' }
      ]
    }
  },
  {
    path: 'explore',
    component: ConsumerRoutePageComponent,
    canActivate: [anonymousSessionGuard],
    title: 'Explore',
    data: {
      pageId: 'explore',
      eyebrow: 'Consumer Flow',
      title: 'Modo exploración',
      description: 'Variantes cercanas, propuestas más atrevidas y maridajes sugeridos.',
      actions: ['Explorar', 'Volver a seguro', 'Probar maridaje'],
      quickLinks: [
        { label: 'Volver a recomendaciones', route: '/experience/recommendations' },
        { label: 'Ver beneficios', route: '/experience/benefits' }
      ],
      metrics: [
        { label: 'Novedad', value: 'Controlada', tone: 'warning' },
        { label: 'Descubrimiento', value: 'Premiable', tone: 'accent' }
      ]
    }
  },
  {
    path: 'feedback',
    component: ConsumerRoutePageComponent,
    canActivate: [anonymousSessionGuard],
    title: 'Feedback',
    data: {
      pageId: 'feedback',
      eyebrow: 'Consumer Flow',
      title: 'Feedback corto y útil',
      description: 'Una pregunta, tres respuestas y ajustes opcionales sin fatigar al usuario.',
      actions: ['Sí', 'Más o menos', 'No'],
      quickLinks: [
        { label: 'Volver a resultados', route: '/experience/recommendations' },
        { label: 'Guardar favorito', route: '/experience/favorites' }
      ],
      metrics: [
        { label: 'Duración', value: '1 paso', tone: 'accent' },
        { label: 'Fatiga', value: 'Controlada' }
      ]
    }
  },
  {
    path: 'favorites',
    component: ConsumerRoutePageComponent,
    canActivate: [anonymousSessionGuard],
    title: 'Favorites',
    data: {
      pageId: 'favorites',
      eyebrow: 'Consumer Flow',
      title: 'Favoritos',
      description: 'Guardado temporal o persistente según el estado de cuenta del consumidor.',
      actions: ['Guardar', 'Ver historial', 'Crear cuenta'],
      quickLinks: [
        { label: 'Ver historial', route: '/experience/history' },
        { label: 'Crear cuenta', route: '/register' }
      ],
      metrics: [
        { label: 'Persistencia', value: 'Condicional' },
        { label: 'Valor', value: 'Recompra', tone: 'accent' }
      ]
    }
  },
  {
    path: 'benefits',
    component: ConsumerRoutePageComponent,
    canActivate: [anonymousSessionGuard],
    title: 'Benefits',
    data: {
      pageId: 'benefits',
      eyebrow: 'Consumer Flow',
      title: 'Beneficios y niveles',
      description: 'Puntos, progreso, recompensas activas y razón clara para registrarse.',
      actions: ['Revisar puntos', 'Ver nivel', 'Canjear'],
      quickLinks: [
        { label: 'Ver favoritos', route: '/experience/favorites' },
        { label: 'Crear cuenta', route: '/register' }
      ],
      metrics: [
        { label: 'Puntos', value: 'Por visita', tone: 'accent' },
        { label: 'Niveles', value: 'Bronce a Signature' }
      ]
    }
  },
  {
    path: 'history',
    component: ConsumerRoutePageComponent,
    canActivate: [anonymousSessionGuard],
    title: 'History',
    data: {
      pageId: 'history',
      eyebrow: 'Consumer Flow',
      title: 'Historial y merge',
      description: 'Vista preparada para unir historial anónimo con cuenta registrada.',
      actions: ['Revisar sesión', 'Fusionar historial', 'Continuar'],
      quickLinks: [
        { label: 'Iniciar sesión', route: '/login' },
        { label: 'Crear cuenta', route: '/register' }
      ],
      metrics: [
        { label: 'Perfil', value: 'Anónimo o registrado' },
        { label: 'Merge', value: 'Preparado', tone: 'accent' }
      ]
    }
  }
];
