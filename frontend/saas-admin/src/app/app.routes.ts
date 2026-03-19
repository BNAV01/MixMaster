import { Routes } from '@angular/router';
import { PlatformRoutePageComponent } from './features/tenants/pages/platform-route-page.component';
import { PlatformShellComponent } from './layout/platform-shell.component';

export const routes: Routes = [
  {
    path: '',
    component: PlatformShellComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'tenants' },
      {
        path: 'tenants',
        component: PlatformRoutePageComponent,
        data: {
          title: 'Tenants',
          description: 'Alta, consulta y operación global de tenants y marcas dentro del SaaS.',
          actions: ['Crear tenant', 'Revisar estado', 'Abrir detalle']
        }
      },
      {
        path: 'trials',
        component: PlatformRoutePageComponent,
        data: {
          title: 'Trials',
          description: 'Seguimiento de cuentas trial, activación y conversión comercial.',
          actions: ['Crear trial', 'Extender', 'Convertir']
        }
      },
      {
        path: 'plans',
        component: PlatformRoutePageComponent,
        data: {
          title: 'Planes',
          description: 'Definición de planes, límites y features habilitadas por suscripción.',
          actions: ['Editar plan', 'Ajustar límites', 'Publicar cambio']
        }
      },
      {
        path: 'subscriptions',
        component: PlatformRoutePageComponent,
        data: {
          title: 'Suscripciones',
          description: 'Estados de suscripción, fechas, trial y gobierno comercial.',
          actions: ['Revisar estado', 'Cambiar plan', 'Suspender']
        }
      },
      {
        path: 'onboarding',
        component: PlatformRoutePageComponent,
        data: {
          title: 'Onboarding',
          description: 'Seguimiento de implementación, carga inicial de carta y activación.',
          actions: ['Asignar soporte', 'Validar carta', 'Mover etapa']
        }
      },
      {
        path: 'support',
        component: PlatformRoutePageComponent,
        data: {
          title: 'Support',
          description: 'Base de atención para incidencias, requests y acompañamiento operativo.',
          actions: ['Abrir caso', 'Escalar', 'Cerrar']
        }
      },
      {
        path: 'feature-flags',
        component: PlatformRoutePageComponent,
        data: {
          title: 'Feature flags',
          description: 'Control gradual de funcionalidades por tenant, plan o entorno.',
          actions: ['Activar', 'Desactivar', 'Auditar']
        }
      }
    ]
  }
];
