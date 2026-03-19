import { Routes } from '@angular/router';
import { analyticsResolver } from '../../core/resolvers/analytics.resolver';
import { branchResolver } from '../../core/resolvers/branch.resolver';
import { branchContextGuard } from '../../core/guards/branch-context.guard';
import { permissionGuard } from '../../core/guards/permission.guard';
import { TenantRoutePageComponent } from '../dashboard/pages/tenant-route-page.component';

export const TENANT_CONSOLE_ROUTES: Routes = [
  {
    path: 'dashboard',
    component: TenantRoutePageComponent,
    canActivate: [branchContextGuard],
    data: {
      pageId: 'dashboard',
      eyebrow: 'Tenant Module',
      title: 'Dashboard operativo',
      description: 'Entrada principal para operación, métricas rápidas y contexto de sucursal.',
      actions: ['Ver alertas', 'Cambiar sucursal', 'Ir a disponibilidad'],
      quickLinks: [
        { label: 'Carta', route: '/menu' },
        { label: 'Disponibilidad', route: '/availability' }
      ],
      metrics: [
        { label: 'Sucursal activa', value: '1', tone: 'accent' },
        { label: 'Alertas', value: 'En tiempo real' }
      ]
    }
  },
  {
    path: 'branches/:branchId/dashboard',
    component: TenantRoutePageComponent,
    canActivate: [branchContextGuard],
    resolve: {
      branch: branchResolver
    },
    data: {
      pageId: 'dashboard',
      eyebrow: 'Tenant Module',
      title: 'Dashboard por sucursal',
      description: 'Vista operativa por branch con contexto persistente y acciones de servicio.',
      actions: ['Ver alertas', 'Cambiar disponibilidad', 'Comparar con cadena'],
      quickLinks: [
        { label: 'Disponibilidad', route: '/availability' },
        { label: 'Analitica', route: '/analytics' }
      ],
      metrics: [
        { label: 'Scope', value: 'Branch' },
        { label: 'Contexto', value: 'Persistente', tone: 'accent' }
      ]
    }
  },
  {
    path: 'menu',
    pathMatch: 'full',
    redirectTo: 'menu/drafts'
  },
  {
    path: 'menu/drafts',
    component: TenantRoutePageComponent,
    canActivate: [permissionGuard],
    data: {
      requiredPermission: 'tenant.menu.write',
      pageId: 'menu-drafts',
      eyebrow: 'Tenant Module',
      title: 'Borradores de carta',
      description: 'Control de drafts listos para revision, comparacion y publicacion.',
      actions: ['Abrir draft', 'Crear draft', 'Publicar'],
      quickLinks: [
        { label: 'Carta publicada', route: '/menu/published' },
        { label: 'Productos', route: '/products' }
      ],
      metrics: [
        { label: 'Estados', value: 'Draft y review' },
        { label: 'Publicacion', value: 'Controlada', tone: 'accent' }
      ]
    }
  },
  {
    path: 'menu/drafts/:draftId',
    component: TenantRoutePageComponent,
    canActivate: [permissionGuard],
    data: {
      requiredPermission: 'tenant.menu.write',
      pageId: 'menu-draft-detail',
      eyebrow: 'Tenant Module',
      title: 'Detalle de borrador',
      description: 'Espacio de edicion estructural con base preparada para formularios complejos y publish review.',
      actions: ['Editar draft', 'Comparar', 'Publicar'],
      quickLinks: [
        { label: 'Volver a drafts', route: '/menu/drafts' },
        { label: 'Carta publicada', route: '/menu/published' }
      ],
      metrics: [
        { label: 'Guard', value: 'Unsaved changes' },
        { label: 'Publicacion', value: 'Versionada', tone: 'accent' }
      ]
    }
  },
  {
    path: 'menu/published',
    component: TenantRoutePageComponent,
    data: {
      pageId: 'menu-published',
      eyebrow: 'Tenant Module',
      title: 'Carta publicada',
      description: 'Version activa y visible para consumer-web, desacoplada de disponibilidad operativa.',
      actions: ['Ver snapshot', 'Revisar cambios', 'Abrir draft'],
      quickLinks: [
        { label: 'Drafts', route: '/menu/drafts' },
        { label: 'Disponibilidad', route: '/availability' }
      ],
      metrics: [
        { label: 'Estado', value: 'Publicado' },
        { label: 'Rollback', value: 'Preparado', tone: 'warning' }
      ]
    }
  },
  {
    path: 'products',
    component: TenantRoutePageComponent,
    data: {
      pageId: 'products',
      eyebrow: 'Tenant Module',
      title: 'Catalogo de productos',
      description: 'Productos, categorias y base del menu editable conectada a disponibilidad y recomendacion.',
      actions: ['Crear producto', 'Editar atributos', 'Revisar pricing'],
      quickLinks: [
        { label: 'Drafts', route: '/menu/drafts' },
        { label: 'Disponibilidad', route: '/availability' }
      ],
      metrics: [
        { label: 'Scope', value: 'Catalogo tenant' },
        { label: 'Relacion', value: 'Menu + pricing', tone: 'accent' }
      ]
    }
  },
  {
    path: 'availability',
    component: TenantRoutePageComponent,
    canActivate: [permissionGuard],
    data: {
      requiredPermission: 'tenant.availability.write',
      pageId: 'availability',
      eyebrow: 'Tenant Module',
      title: 'Disponibilidad rapida',
      description: 'Cambios operativos en tiempo real separados del editor de carta.',
      actions: ['Pausar', 'Agotar', 'Reactivar'],
      quickLinks: [
        { label: 'Carta publicada', route: '/menu/published' },
        { label: 'Analitica', route: '/analytics' }
      ],
      metrics: [
        { label: 'Latencia', value: 'Segundos', tone: 'accent' },
        { label: 'Scope', value: 'Por sucursal' }
      ]
    }
  },
  {
    path: 'analytics',
    component: TenantRoutePageComponent,
    resolve: {
      analytics: analyticsResolver
    },
    data: {
      pageId: 'analytics',
      eyebrow: 'Tenant Module',
      title: 'Analitica',
      description: 'Ventas, consumo, conversion y desempeno de la recomendacion por sucursal.',
      actions: ['Comparar', 'Filtrar', 'Exportar'],
      quickLinks: [
        { label: 'Comparativa', route: '/analytics/branches/compare' },
        { label: 'Cadena', route: '/chain/executive' }
      ],
      metrics: [
        { label: 'Fuentes', value: 'Ventas + interaccion' },
        { label: 'Comparativa', value: 'Multisucursal', tone: 'accent' }
      ]
    }
  },
  {
    path: 'analytics/branches/compare',
    component: TenantRoutePageComponent,
    data: {
      pageId: 'analytics-compare',
      eyebrow: 'Tenant Module',
      title: 'Comparativa entre sucursales',
      description: 'Vista ejecutiva para identificar diferencias de desempeno y ejecucion.',
      actions: ['Comparar', 'Detectar outliers', 'Priorizar acciones'],
      quickLinks: [
        { label: 'Analitica', route: '/analytics' },
        { label: 'Vista cadena', route: '/chain/executive' }
      ],
      metrics: [
        { label: 'Scope', value: 'Cross-branch' },
        { label: 'Decision', value: 'Gerencial', tone: 'accent' }
      ]
    }
  },
  {
    path: 'campaigns',
    component: TenantRoutePageComponent,
    data: {
      pageId: 'campaigns',
      eyebrow: 'Tenant Module',
      title: 'Campanas',
      description: 'Promociones, segmentacion y activaciones comerciales del tenant.',
      actions: ['Crear campana', 'Programar', 'Duplicar'],
      quickLinks: [
        { label: 'Loyalty', route: '/loyalty' },
        { label: 'Analitica', route: '/analytics' }
      ],
      metrics: [
        { label: 'Estado', value: 'Programable' },
        { label: 'Segmentacion', value: 'Preparada', tone: 'accent' }
      ]
    }
  },
  {
    path: 'loyalty',
    component: TenantRoutePageComponent,
    data: {
      pageId: 'loyalty',
      eyebrow: 'Tenant Module',
      title: 'Loyalty admin',
      description: 'Beneficios, niveles y seguimiento de uso por consumidores registrados.',
      actions: ['Ver niveles', 'Editar beneficios', 'Analizar uso'],
      quickLinks: [
        { label: 'Campanas', route: '/campaigns' },
        { label: 'Staff', route: '/staff' }
      ],
      metrics: [
        { label: 'Niveles', value: 'Configurables', tone: 'accent' },
        { label: 'Puntos', value: 'Ledger' }
      ]
    }
  },
  {
    path: 'staff',
    component: TenantRoutePageComponent,
    data: {
      pageId: 'staff',
      eyebrow: 'Tenant Module',
      title: 'Staff y permisos',
      description: 'Usuarios internos, roles y alcance por marca o sucursal.',
      actions: ['Crear usuario', 'Asignar rol', 'Revisar alcance'],
      quickLinks: [
        { label: 'Settings', route: '/settings' },
        { label: 'Dashboard', route: '/dashboard' }
      ],
      metrics: [
        { label: 'Roles', value: 'Granulares' },
        { label: 'Alcance', value: 'Marca o branch', tone: 'accent' }
      ]
    }
  },
  {
    path: 'settings',
    component: TenantRoutePageComponent,
    data: {
      pageId: 'settings',
      eyebrow: 'Tenant Module',
      title: 'Settings',
      description: 'Configuracion de tenant, marca, sucursal y theming operativo.',
      actions: ['Editar tenant', 'Configurar branch', 'Actualizar branding'],
      quickLinks: [
        { label: 'Staff', route: '/staff' },
        { label: 'Dashboard', route: '/dashboard' }
      ],
      metrics: [
        { label: 'Contexto', value: 'Jerarquico' },
        { label: 'Branding', value: 'Por tenant', tone: 'accent' }
      ]
    }
  },
  {
    path: 'chain/executive',
    component: TenantRoutePageComponent,
    data: {
      pageId: 'chain-executive',
      eyebrow: 'Tenant Module',
      title: 'Vista ejecutiva',
      description: 'Comparativa multi-sucursal, desempeño y focos de decisión gerencial.',
      actions: ['Comparar sucursales', 'Ver ranking', 'Priorizar acciones'],
      quickLinks: [
        { label: 'Analítica', route: '/analytics' },
        { label: 'Dashboard', route: '/dashboard' }
      ],
      metrics: [
        { label: 'Cadena', value: 'Cross-branch', tone: 'accent' },
        { label: 'Decisiones', value: 'Priorizables' }
      ]
    }
  }
];
