import { Routes } from '@angular/router';
import { tenantResolver } from '../../core/resolvers/tenant.resolver';
import { PlatformCommunicationsPageComponent } from '../communications/pages/platform-communications-page.component';
import { PlatformRoutePageComponent } from '../tenants/pages/platform-route-page.component';

export const PLATFORM_CONSOLE_ROUTES: Routes = [
  {
    path: 'dashboard',
    component: PlatformRoutePageComponent,
    data: {
      pageId: 'dashboard',
      eyebrow: 'Platform Module',
      title: 'Dashboard SaaS',
      description: 'KPIs diarios consolidados, salud del portafolio y accesos de refresco manual.',
      actions: ['Refrescar global', 'Monitorear backlog', 'Ir a tenants'],
      quickLinks: [
        { label: 'Tenants', route: '/tenants' },
        { label: 'Support', route: '/support' }
      ],
      metrics: [
        { label: 'Frecuencia', value: '24h + manual', tone: 'accent' },
        { label: 'Ámbito', value: 'SaaS completo' }
      ]
    }
  },
  {
    path: 'tenants',
    component: PlatformRoutePageComponent,
    resolve: {
      tenantData: tenantResolver
    },
    data: {
      pageId: 'tenants',
      eyebrow: 'Platform Module',
      title: 'Tenants',
      description: 'Alta, consulta y operación global de tenants y marcas dentro del SaaS.',
      actions: ['Crear tenant', 'Revisar estado', 'Abrir detalle'],
      quickLinks: [
        { label: 'Trials', route: '/trials' },
        { label: 'Planes', route: '/plans' }
      ],
      metrics: [
        { label: 'Gobierno', value: 'Global', tone: 'accent' },
        { label: 'Ámbito', value: 'Tenant y cadena' }
      ]
    }
  },
  {
    path: 'tenants/:tenantId',
    component: PlatformRoutePageComponent,
    resolve: {
      tenantData: tenantResolver
    },
    data: {
      pageId: 'tenant-detail',
      eyebrow: 'Platform Module',
      title: 'Tenant detail',
      description: 'Vista detallada para operacion interna, onboarding, soporte y billing del tenant.',
      actions: ['Ver estado', 'Revisar plan', 'Abrir soporte'],
      quickLinks: [
        { label: 'Trials', route: '/trials' },
        { label: 'Subscriptions', route: '/subscriptions' }
      ],
      metrics: [
        { label: 'Scope', value: 'Tenant' },
        { label: 'Operacion', value: 'Interna', tone: 'accent' }
      ]
    }
  },
  {
    path: 'trials',
    component: PlatformRoutePageComponent,
    data: {
      pageId: 'trials',
      eyebrow: 'Platform Module',
      title: 'Trials',
      description: 'Seguimiento de cuentas trial, activación y conversión comercial.',
      actions: ['Crear trial', 'Extender', 'Convertir'],
      quickLinks: [
        { label: 'Tenants', route: '/tenants' },
        { label: 'Onboarding', route: '/onboarding' },
        { label: 'Reportes', route: '/reports' }
      ],
      metrics: [
        { label: 'Conversión', value: 'Pipeline' },
        { label: 'Estado', value: 'Seguible', tone: 'accent' }
      ]
    }
  },
  {
    path: 'plans',
    component: PlatformRoutePageComponent,
    data: {
      pageId: 'plans',
      eyebrow: 'Platform Module',
      title: 'Planes',
      description: 'Definición de planes, límites y features habilitadas por suscripción.',
      actions: ['Editar plan', 'Ajustar límites', 'Publicar cambio'],
      quickLinks: [
        { label: 'Suscripciones', route: '/subscriptions' },
        { label: 'Feature flags', route: '/feature-flags' },
        { label: 'Reportes', route: '/reports' }
      ],
      metrics: [
        { label: 'Packaging', value: 'SaaS', tone: 'accent' },
        { label: 'Entitlements', value: 'Preparados' }
      ]
    }
  },
  {
    path: 'subscriptions',
    component: PlatformRoutePageComponent,
    data: {
      pageId: 'subscriptions',
      eyebrow: 'Platform Module',
      title: 'Suscripciones',
      description: 'Estados de suscripción, fechas, trial y gobierno comercial.',
      actions: ['Revisar estado', 'Cambiar plan', 'Suspender'],
      quickLinks: [
        { label: 'Planes', route: '/plans' },
        { label: 'Tenants', route: '/tenants' },
        { label: 'Reportes', route: '/reports' }
      ],
      metrics: [
        { label: 'Billing', value: 'Centralizado', tone: 'accent' },
        { label: 'Estado', value: 'Activo o trial' }
      ]
    }
  },
  {
    path: 'onboarding',
    component: PlatformRoutePageComponent,
    data: {
      pageId: 'onboarding',
      eyebrow: 'Platform Module',
      title: 'Onboarding',
      description: 'Seguimiento de implementación, carga inicial de carta y activación.',
      actions: ['Asignar soporte', 'Validar carta', 'Mover etapa'],
      quickLinks: [
        { label: 'Support', route: '/support' },
        { label: 'Tenants', route: '/tenants' },
        { label: 'Reportes', route: '/reports' }
      ],
      metrics: [
        { label: 'Carga inicial', value: 'Obligatoria', tone: 'warning' },
        { label: 'Activación', value: 'Guiada' }
      ]
    }
  },
  {
    path: 'support',
    component: PlatformRoutePageComponent,
    data: {
      pageId: 'support',
      eyebrow: 'Platform Module',
      title: 'Support',
      description: 'Base de atención para incidencias, requests y acompañamiento operativo.',
      actions: ['Abrir caso', 'Escalar', 'Cerrar'],
      quickLinks: [
        { label: 'Onboarding', route: '/onboarding' },
        { label: 'Tenants', route: '/tenants' },
        { label: 'Reportes', route: '/reports' }
      ],
      metrics: [
        { label: 'Soporte', value: 'Operativo', tone: 'accent' },
        { label: 'Escalado', value: 'Trazable' }
      ]
    }
  },
  {
    path: 'communications',
    component: PlatformCommunicationsPageComponent,
    data: {
      pageId: 'communications',
      eyebrow: 'Platform Module',
      title: 'Correos',
      description: 'Configuración SMTP corporativa, plantillas inteligentes y envíos manuales a tenants.',
      actions: ['Configurar SMTP', 'Editar plantilla', 'Enviar correo'],
      quickLinks: [
        { label: 'Tenants', route: '/tenants' },
        { label: 'Support', route: '/support' }
      ],
      metrics: [
        { label: 'Proveedor', value: 'Google SMTP / custom', tone: 'accent' },
        { label: 'Modo', value: 'Manual y controlado' }
      ]
    }
  },
  {
    path: 'feature-flags',
    component: PlatformRoutePageComponent,
    data: {
      pageId: 'feature-flags',
      eyebrow: 'Platform Module',
      title: 'Feature flags',
      description: 'Control gradual de funcionalidades por tenant, plan o entorno.',
      actions: ['Activar', 'Desactivar', 'Auditar'],
      quickLinks: [
        { label: 'Planes', route: '/plans' },
        { label: 'Tenants', route: '/tenants' }
      ],
      metrics: [
        { label: 'Release', value: 'Gradual', tone: 'accent' },
        { label: 'Riesgo', value: 'Controlado' }
      ]
    }
  },
  {
    path: 'reports',
    component: PlatformRoutePageComponent,
    data: {
      pageId: 'reports',
      eyebrow: 'Platform Module',
      title: 'Reportes',
      description: 'Exportes XLSX y PDF para control operativo, readiness SII y soporte mensual tipo F29.',
      actions: ['Exportar registro', 'Generar pack SII', 'Descargar PDF'],
      quickLinks: [
        { label: 'Tenants', route: '/tenants' },
        { label: 'Subscriptions', route: '/subscriptions' }
      ],
      metrics: [
        { label: 'Formato', value: 'XLSX / PDF', tone: 'accent' },
        { label: 'Foco', value: 'Chile 2026' }
      ]
    }
  },
  {
    path: 'account',
    component: PlatformRoutePageComponent,
    data: {
      pageId: 'account',
      eyebrow: 'Platform Module',
      title: 'Cuenta SaaS',
      description: 'Autogestión de la única cuenta SaaS Admin, seguridad y rotación de credenciales.',
      actions: ['Cambiar contraseña', 'Revisar sesiones', 'Validar último acceso'],
      quickLinks: [
        { label: 'Dashboard', route: '/dashboard' },
        { label: 'Tenants', route: '/tenants' }
      ],
      metrics: [
        { label: 'Scope', value: 'Cuenta raíz', tone: 'accent' },
        { label: 'Seguridad', value: 'Obligatoria' }
      ]
    }
  }
];
