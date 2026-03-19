# Frontend Foundation Implementation

Documento tecnico de la fundacion frontend actualmente ejecutada en MixMaster.

## Objetivo de esta base

Dejar un frontend conectable al backend real, con separacion clara por audiencia, stack visual flexible y una base de UI/UX reutilizable.

## Decision estructural

Se mantienen `3 apps Angular` separadas:

- `consumer-web`
- `tenant-console`
- `saas-admin`

No se movieron fisicamente a `apps/` para evitar romper SSR y builders ya configurados. La consolidacion se hizo mediante un monorepo logico en `frontend/`.

## Stack implementado

- `Tailwind CSS`
  - preset compartido en `frontend/tailwind.preset.cjs`
  - config por app en `tailwind.config.cjs`
- `Angular CDK`
  - base para `modal-shell`, `dropdown-shell` y foco accesible
- `SCSS`
  - `frontend/libs/shared/styles/`
  - tokens core
  - semantic tokens
  - themes por app
  - mixins y clases base

## Regla de uso

- Tailwind
  - layout
  - spacing
  - responsive
  - composicion de vistas
- SCSS
  - tokens
  - temas
  - base styles
  - clases compartidas como `mm-surface`, `mm-button`, `mm-chip`
- Angular CDK
  - comportamiento
  - overlays
  - focus trap
  - infraestructura de UI accesible

## Workspace compartido

Se agrego `frontend/package.json` para crear un `node_modules` comun. Esto resuelve un problema real del repo: las `libs` viven fuera de cada app y, sin un ancestro comun con Angular/RxJS/tslib, terminan compilando contra instancias distintas del framework.

Resultado:

- `apps` y `libs` resuelven la misma instancia de Angular
- se evita mismatch de tipos entre interceptors, tokens y componentes standalone

Automatizacion aplicada:

- `frontend/scripts/link-shared-deps.mjs`
  - relinka `@angular`, `rxjs` y `tslib` desde `frontend/node_modules` hacia cada app
- `frontend/package.json`
  - `postinstall`
  - `build:all`
- `consumer-web`, `tenant-console`, `saas-admin`
  - `postinstall`
  - `prestart`
  - `prebuild`
  - `prewatch`
  - `pretest`

Esto evita depender de symlinks manuales fuera de Git y deja el monorepo logico reproducible para la siguiente iteracion.

## Librerias activas

### Shared

- `shared/api-clients`
  - contratos por audiencia
  - `PublicApiClient`
  - `ConsumerApiClient`
  - `TenantAdminApiClient`
  - `PlatformAdminApiClient`
  - interceptors compartidos
- `shared/permissions`
  - `ifCan`
  - resolvers de scope
- `shared/realtime`
  - `RealtimeConnectionService`
  - SSE con reconexion basica
- `shared/ui-core`
  - shell header
  - sidebar
  - branch switcher
  - empty/error/loading states
  - command bar
  - badges base
- `shared/ui-overlays`
  - modal shell
  - dropdown shell
  - overlay panel
- `shared/ui-data-viz`
  - analytics tile
  - branch comparison table

### Consumer

- `menu-viewer`
  - `product-card`
  - `menu-section-list`
- `recommendations`
  - `recommendation-card`
- `preferences`
  - `taste-chip`
  - `dislike-chip`
- `feedback`
  - `feedback-prompt`
- `loyalty`
  - `benefit-card`

### Tenant

- `availability`
  - `availability-toggle`
- `menu-editor`
  - `draft-publish-banner`
- `analytics`
  - export del comparador de sucursales

## Inventario base de componentes reutilizables

### Shared UI core

- `app-shell-header`
- `app-shell-sidebar`
- `branch-switcher`
- `tenant-badge`
- `loading-skeleton`
- `empty-state`
- `error-state`
- `command-bar`
- `price-pill`
- `score-badge`

### Shared overlays

- `modal-shell`
- `dropdown-shell`
- `overlay-panel`

### Shared data viz

- `analytics-tile`
- `branch-comparison-table`

### Consumer domain

- `product-card`
- `menu-section-list`
- `recommendation-card`
- `taste-chip`
- `dislike-chip`
- `feedback-prompt`
- `benefit-card`

### Tenant domain

- `availability-toggle`
- `draft-publish-banner`

## Estado y reactividad

Se adopto una estrategia hibrida:

- estado global minimo por app
  - auth
  - tenant context
  - branch context
  - theme
- server state por facade
  - dashboard
  - menu drafts
  - availability
  - tenant detail
  - recommendations
- `signals`
  - como base reactiva principal
- sin `NgRx`
  - no era necesario para esta fase

## Integracion backend-ready

La UI no habla directo con `HttpClient` desde componentes.

Patron aplicado:

`component -> facade/store -> shared/api-clients -> backend`

Headers y contexto listos:

- `Authorization`
- `X-Anonymous-Token`
- `X-Tenant-Id`
- `X-Branch-Id`
- `X-Correlation-Id`

## SSR y SPA

### consumer-web

- SSR mantenida y verificada
- hidratacion activa
- dependencias usadas de forma server-safe
- almacenamiento encapsulado en `BrowserStorageService`

### tenant-console y saas-admin

- SPA por ahora
- rutas lazy por consola

## Realtime

`RealtimeConnectionService` implementa una base SSE con:

- estado de conexion
- reconexion basica
- ultimo mensaje recibido

Uso actual:

- `consumer-web`
  - disponibilidad/carta visible por branch
- `tenant-console`
  - base para disponibilidad operativa en vivo

## UX base aplicada

### consumer-web

- mobile first
- atmosfera premium nocturna con superficies, contraste alto y espacios amplios
- microcopy corto, orientado a decidir rapido
- feedback liviano y posterior al valor
- CTA de cuenta solo despues de entregar utilidad

### tenant-console

- desktop first
- densidad informativa controlada
- estado operativo siempre visible
- acciones rapidas para draft, disponibilidad y lectura comercial

### saas-admin

- sobrio
- foco en control de tenants, estado comercial y operaciones internas
- menor carga ornamental y mayor jerarquia de tabla, filtros y estados

## Microcopy inicial aplicada

### consumer-web

- `Arranquemos por lo que si te gusta`
- `Ayudanos a no hacerte perder tiempo`
- `Ajusta el rumbo en segundos`
- `Guarda lo que ya descubriste hoy`
- `Tu sesion ya esta lista para fusionarse si creas cuenta`

### tenant-console

- `Borrador listo para revision`
- `Separa cambios estructurales de cambios operativos antes de publicar al consumer-web`
- `Version visible hoy en mesa y barra`
- `Permisos actuales del usuario`

### saas-admin

- la base textual queda enfocada en estado, trial, onboarding, soporte y feature flags, lista para conectarse a backend y permisos reales

## Rutas implementadas

### consumer-web

- `/q/:qrCode`
- `/experience/start`
- `/experience/menu`
- `/experience/preferences`
- `/experience/recommendations`
- `/experience/explore`
- `/experience/refine`
- `/experience/feedback`
- `/experience/favorites`
- `/experience/benefits`
- `/experience/history`
- `/login`
- `/register`
- `/account/merge-history`

### tenant-console

- `/dashboard`
- `/branches/:branchId/dashboard`
- `/menu/drafts`
- `/menu/drafts/:draftId`
- `/menu/published`
- `/products`
- `/availability`
- `/analytics`
- `/analytics/branches/compare`
- `/campaigns`
- `/loyalty`
- `/staff`
- `/settings`
- `/chain/executive`

### saas-admin

- `/tenants`
- `/tenants/:tenantId`
- `/trials`
- `/plans`
- `/subscriptions`
- `/onboarding`
- `/support`
- `/feature-flags`

## Guards y resolvers

### consumer-web

- `qrContextGuard`
- `anonymousSessionGuard`
- `consumerAuthGuard`
- `publishedMenuResolver`

### tenant-console

- `staffAuthGuard`
- `branchContextGuard`
- `permissionGuard`
- `unsavedChangesGuard`
- `analyticsResolver`
- `branchResolver`

### saas-admin

- `saasAuthGuard`
- `tenantResolver`

## Verificacion de esta iteracion

Compilacion validada:

- `consumer-web`
  - `npm run build`
- `tenant-console`
  - `npm run build`
- `saas-admin`
  - `npm run build`

Secuencia operativa recomendada:

```bash
cd frontend
npm install
cd consumer-web && npm install
cd ../tenant-console && npm install
cd ../saas-admin && npm install
cd ..
npm run build:all
```

## Siguiente iteracion recomendada

1. conectar facades a endpoints backend reales a medida que se consoliden
2. reemplazar fallback demo por contratos definitivos por pantalla
3. agregar tests de facades, guards y componentes core
4. profundizar editor de carta, formularios complejos y tablas de operacion
