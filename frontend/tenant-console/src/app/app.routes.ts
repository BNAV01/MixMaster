import { Routes } from '@angular/router';
import { TenantRoutePageComponent } from './features/dashboard/pages/tenant-route-page.component';
import { TenantShellComponent } from './layout/tenant-shell.component';

export const routes: Routes = [
  {
    path: '',
    component: TenantShellComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        component: TenantRoutePageComponent,
        data: {
          title: 'Dashboard operativo',
          description: 'Entrada principal para operación, métricas rápidas y contexto de sucursal.',
          actions: ['Ver alertas', 'Cambiar sucursal', 'Ir a disponibilidad']
        }
      },
      {
        path: 'menu',
        component: TenantRoutePageComponent,
        data: {
          title: 'Carta y publicación',
          description: 'Borradores, publicados y validaciones de edición estructural.',
          actions: ['Editar draft', 'Comparar', 'Publicar']
        }
      },
      {
        path: 'availability',
        component: TenantRoutePageComponent,
        data: {
          title: 'Disponibilidad rápida',
          description: 'Cambios operativos en tiempo real separados del editor de carta.',
          actions: ['Pausar', 'Agotar', 'Reactivar']
        }
      },
      {
        path: 'analytics',
        component: TenantRoutePageComponent,
        data: {
          title: 'Analítica',
          description: 'Ventas, consumo, conversión y desempeño de la recomendación por sucursal.',
          actions: ['Comparar', 'Filtrar', 'Exportar']
        }
      },
      {
        path: 'campaigns',
        component: TenantRoutePageComponent,
        data: {
          title: 'Campañas',
          description: 'Promociones, segmentación y activaciones comerciales del tenant.',
          actions: ['Crear campaña', 'Programar', 'Duplicar']
        }
      },
      {
        path: 'loyalty',
        component: TenantRoutePageComponent,
        data: {
          title: 'Loyalty',
          description: 'Beneficios, niveles y seguimiento de uso por consumidores registrados.',
          actions: ['Ver niveles', 'Editar beneficios', 'Analizar uso']
        }
      },
      {
        path: 'staff',
        component: TenantRoutePageComponent,
        data: {
          title: 'Staff y permisos',
          description: 'Usuarios internos, roles y alcance por marca o sucursal.',
          actions: ['Crear usuario', 'Asignar rol', 'Revisar alcance']
        }
      },
      {
        path: 'settings',
        component: TenantRoutePageComponent,
        data: {
          title: 'Settings',
          description: 'Configuración de tenant, marca, sucursal y theming operativo.',
          actions: ['Editar tenant', 'Configurar branch', 'Actualizar branding']
        }
      },
      {
        path: 'chain/executive',
        component: TenantRoutePageComponent,
        data: {
          title: 'Vista ejecutiva',
          description: 'Comparativa multi-sucursal, desempeño y focos de decisión gerencial.',
          actions: ['Comparar sucursales', 'Ver ranking', 'Priorizar acciones']
        }
      }
    ]
  }
];
