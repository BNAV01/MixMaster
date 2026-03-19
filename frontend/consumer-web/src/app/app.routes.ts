import { Routes } from '@angular/router';
import { QrEntryPageComponent } from './features/entry/pages/qr-entry-page.component';
import { ConsumerRoutePageComponent } from './features/experience/pages/consumer-route-page.component';
import { PublicShellComponent } from './layout/public-shell.component';

export const routes: Routes = [
  {
    path: '',
    component: PublicShellComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'experience/start' },
      { path: 'q/:qrCode', component: QrEntryPageComponent, title: 'QR Entry' },
      {
        path: 'experience/start',
        component: ConsumerRoutePageComponent,
        title: 'Experience Start',
        data: {
          title: 'Empieza a descubrir',
          description: 'Entrada rápida al flujo de recomendación, exploración y carta viva.',
          actions: ['Elegir objetivo', 'Entrar por QR', 'Continuar sin cuenta']
        }
      },
      {
        path: 'experience/preferences',
        component: ConsumerRoutePageComponent,
        title: 'Preferences',
        data: {
          title: 'Gustos y rechazos',
          description: 'Captura rápida de afinidades, dislikes y contexto de la sesión.',
          actions: ['Marcar gustos', 'Marcar rechazos', 'Ajustar contexto']
        }
      },
      {
        path: 'experience/recommendations',
        component: ConsumerRoutePageComponent,
        title: 'Recommendations',
        data: {
          title: 'Tus recomendaciones',
          description: 'Resultados principales, explicaciones breves y opciones para seguir afinando.',
          actions: ['Aceptar', 'Refinar', 'Guardar favorito']
        }
      },
      {
        path: 'experience/explore',
        component: ConsumerRoutePageComponent,
        title: 'Explore',
        data: {
          title: 'Modo exploración',
          description: 'Variantes cercanas, propuestas más atrevidas y maridajes sugeridos.',
          actions: ['Explorar', 'Volver a seguro', 'Probar maridaje']
        }
      },
      {
        path: 'experience/feedback',
        component: ConsumerRoutePageComponent,
        title: 'Feedback',
        data: {
          title: 'Feedback corto y útil',
          description: 'Una pregunta, tres respuestas y ajustes opcionales sin fatigar al usuario.',
          actions: ['Sí', 'Más o menos', 'No']
        }
      },
      {
        path: 'experience/favorites',
        component: ConsumerRoutePageComponent,
        title: 'Favorites',
        data: {
          title: 'Favoritos',
          description: 'Guardado temporal o persistente según el estado de cuenta del consumidor.',
          actions: ['Guardar', 'Ver historial', 'Crear cuenta']
        }
      },
      {
        path: 'experience/benefits',
        component: ConsumerRoutePageComponent,
        title: 'Benefits',
        data: {
          title: 'Beneficios y niveles',
          description: 'Puntos, progreso, recompensas activas y razón clara para registrarse.',
          actions: ['Revisar puntos', 'Ver nivel', 'Canjear']
        }
      },
      {
        path: 'experience/history',
        component: ConsumerRoutePageComponent,
        title: 'History',
        data: {
          title: 'Historial y merge',
          description: 'Vista preparada para unir historial anónimo con cuenta registrada.',
          actions: ['Revisar sesión', 'Fusionar historial', 'Continuar']
        }
      },
      {
        path: 'login',
        component: ConsumerRoutePageComponent,
        title: 'Login',
        data: {
          title: 'Iniciar sesión',
          description: 'Acceso a historial, favoritos y beneficios sin romper el flujo actual.',
          actions: ['Entrar', 'Volver a experiencia']
        }
      },
      {
        path: 'register',
        component: ConsumerRoutePageComponent,
        title: 'Register',
        data: {
          title: 'Crear cuenta después de recibir valor',
          description: 'Registro ligero para guardar historial y reclamar beneficios desde la visita actual.',
          actions: ['Crear cuenta', 'Fusionar historial', 'Seguir anónimo']
        }
      }
    ]
  }
];
