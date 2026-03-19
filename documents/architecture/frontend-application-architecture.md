# Arquitectura Frontend de Aplicación

## Objetivo

Definir el blueprint frontend de MixMaster para:

- experiencia pública mobile-first para consumidor
- consola administrativa para tenant y sucursales
- consola SaaS para superadmin, onboarding y billing

La propuesta se alinea con la base real del repositorio actual en `frontend/` y respeta las 3 apps Angular ya creadas.

## Decisión principal

## Mantener 3 apps Angular separadas

Tomaría `3 apps dentro del mismo monorepo lógico`, no una sola mega-app y no 4 apps separadas.

### Apps oficiales

- `consumer-web`
- `tenant-console`
- `saas-admin`

### Por qué 3 y no 1

- las audiencias son distintas
- los ciclos de autenticación y permisos son distintos
- el `consumer-web` necesita `SSR` y optimización extrema de carga
- `tenant-console` y `saas-admin` priorizan flujos desktop y backoffice
- separar apps reduce coupling entre experiencia pública y operación interna

### Por qué 3 y no 4

No separaría `branch-ops` como app independiente. La operación de sucursal debe vivir dentro de `tenant-console` como módulo o área especializada.

Separarla desde ahora agregaría:

- más despliegues
- duplicación de auth/contexto
- más complejidad de navegación entre gestión y operación

La separación correcta hoy es:

- `consumer-web`: público
- `tenant-console`: administración + branch ops
- `saas-admin`: operación del SaaS

## Topología frontend propuesta

## Distribución actual y objetivo

Se mantiene la estructura física actual para no romper lo generado:

```text
frontend/
├── consumer-web/
├── tenant-console/
├── saas-admin/
└── libs/
    ├── shared/
    ├── consumer/
    ├── tenant/
    └── platform/
```

## Evolución interna recomendada

```text
frontend/
├── consumer-web/
│   └── src/app/
│       ├── core/
│       ├── layout/
│       ├── features/
│       └── app.routes.ts
├── tenant-console/
│   └── src/app/
│       ├── core/
│       ├── layout/
│       ├── features/
│       └── app.routes.ts
├── saas-admin/
│   └── src/app/
│       ├── core/
│       ├── layout/
│       ├── features/
│       └── app.routes.ts
└── libs/
    ├── shared/
    │   ├── styles/
    │   ├── ui/
    │   ├── icons/
    │   ├── api/
    │   ├── auth/
    │   ├── realtime/
    │   ├── utils/
    │   └── testing/
    ├── consumer/
    │   ├── session/
    │   ├── onboarding/
    │   ├── menu/
    │   ├── recommendations/
    │   ├── loyalty/
    │   └── account/
    ├── tenant/
    │   ├── dashboard/
    │   ├── menu-editor/
    │   ├── availability/
    │   ├── analytics/
    │   ├── campaigns/
    │   ├── loyalty/
    │   ├── staff/
    │   └── settings/
    └── platform/
        ├── tenants/
        ├── trials/
        ├── billing/
        ├── onboarding/
        ├── support/
        └── feature-flags/
```

## Principios de arquitectura frontend

1. `audience-first`: separar por tipo de usuario antes que por tecnología.
2. `feature-first`: agrupar por módulo de negocio dentro de cada app.
3. `SSR solo donde agrega valor`: únicamente `consumer-web`.
4. `API-driven UI`: la carta y la disponibilidad vienen de datos, no de contenido hardcodeado.
5. `signals first`: estado local y de feature con Angular Signals y facades.
6. `realtime incremental`: actualizar solo partes afectadas de la UI.
7. `mobile-first en consumer`, `desktop-first en gestión`.
8. `design tokens compartidos`, visualidades distintas por app.

## Arquitectura por capas frontend

## 1. Core por app

Responsabilidades:

- bootstrap de tema
- sesión y auth
- config de API
- interceptores
- guards
- contextos activos
- realtime base

## 2. Layout por app

Responsabilidades:

- shell principal
- navegación
- breadcrumbs
- top bar
- empty states globales

## 3. Features por app

Responsabilidades:

- páginas
- facades de feature
- state stores de feature
- componentes específicos
- resolvers

## 4. Shared libs

Responsabilidades:

- componentes UI reutilizables
- tokens de diseño
- adaptadores API
- realtime utilities
- testing helpers

## Estrategia de módulos frontend

## Mapa de módulos

| Módulo | Objetivo | Pantallas o vistas | Servicios | Componentes principales | Estado | Dependencias |
|---|---|---|---|---|---|---|
| `auth` | login, logout, refresh, identidad actual | login, register, account-link, session-expired | `AuthApiService`, `AuthFacade`, `TokenStorageService` | `login-form`, `register-form`, `auth-gate` | global por app | shared api, session, permissions |
| `anonymous-session` | iniciar, restaurar y cerrar sesión anónima desde QR | `q/:qrCode`, start, resume session | `AnonymousSessionApiService`, `ConsumerSessionFacade`, `QrResolverService` | `qr-entry-card`, `session-banner`, `resume-session-sheet` | global en consumer | auth, menu-viewer, recommendations |
| `consumer-onboarding` | capturar objetivo, contexto y nivel de exploración | `/experience/start` | `ExperienceStartFacade`, `ConsumerContextService` | `goal-selector`, `exploration-toggle`, `occasion-picker` | local de feature | anonymous-session, preferences |
| `preferences` | capturar gustos y rechazos | `/experience/preferences` | `PreferencesApiService`, `PreferencesFacade` | `taste-chip`, `dislike-chip`, `preference-group`, `context-slider` | feature state | consumer-onboarding, recommendations |
| `recommendations` | mostrar y refinar recomendaciones | `/experience/recommendations`, `/experience/refine`, `/experience/explore` | `RecommendationsApiService`, `RecommendationsFacade`, `RealtimeRecommendationService` | `recommendation-card`, `recommendation-carousel`, `pairing-strip`, `refine-panel` | feature state con cache por sesión | menu-viewer, feedback, favorites |
| `feedback` | capturar calidad percibida de la recomendación | `/experience/feedback` | `FeedbackApiService`, `FeedbackFacade` | `feedback-prompt`, `feedback-scale`, `quick-feedback-sheet` | local con persistencia breve | recommendations, loyalty |
| `favorites` | guardar favoritos temporales o persistentes | `/experience/favorites` | `FavoritesApiService`, `FavoritesFacade` | `favorite-button`, `favorites-list`, `save-to-account-banner` | feature state | auth, menu-viewer |
| `loyalty` | beneficios, puntos, niveles y wallet | `/experience/benefits`, `/account/benefits` | `LoyaltyApiService`, `LoyaltyFacade` | `benefit-card`, `points-meter`, `level-progress`, `wallet-summary` | global por consumer autenticado | auth, feedback, sales summary |
| `menu-viewer` | visualizar carta viva y maridajes | `/menu`, `/experience/menu`, modales dentro del flujo | `MenuApiService`, `MenuFacade`, `AvailabilityStreamService` | `product-card`, `menu-section-list`, `price-pill`, `product-detail-sheet` | cacheable por branch y sesión | anonymous-session, recommendations |
| `menu-editor` | edición estructural de carta y borradores | `/admin/menu`, `/admin/menu/drafts/:id`, `/admin/menu/published/:id` | `MenuEditorApiService`, `MenuDraftFacade`, `DraftPublishService` | `menu-tree`, `draft-publish-banner`, `section-editor`, `product-picker` | feature state compleja | permissions, products, tenant-settings |
| `product-availability` | cambios operativos rápidos en tiempo real | `/admin/availability` | `AvailabilityApiService`, `AvailabilityFacade`, `AvailabilityRealtimeService` | `availability-toggle`, `availability-grid`, `branch-availability-board` | feature state por branch | menu-viewer data, permissions |
| `campaigns` | campañas, promociones y activaciones | `/admin/campaigns`, `/admin/campaigns/:id` | `CampaignsApiService`, `CampaignsFacade` | `campaign-card`, `promotion-builder`, `schedule-strip` | feature state | loyalty, analytics |
| `analytics` | dashboards operativos y ejecutivos | `/admin/analytics`, `/admin/analytics/branches`, `/admin/chain/executive` | `AnalyticsApiService`, `AnalyticsFacade` | `analytics-tile`, `branch-comparison-table`, `trend-chart`, `filter-bar` | query state compartido | tenant-context, permissions |
| `staff-admin` | usuarios internos, roles y permisos | `/admin/staff`, `/admin/staff/roles` | `StaffApiService`, `StaffFacade`, `PermissionsService` | `staff-table`, `role-badge`, `permission-matrix`, `scope-assignment-form` | feature state | auth, tenant-context |
| `tenant-settings` | configuración de tenant, marca y sucursal | `/admin/settings`, `/admin/settings/brand`, `/admin/settings/branch` | `TenantSettingsApiService`, `TenantSettingsFacade` | `settings-form`, `branch-selector`, `theme-preview-card` | feature state | staff-admin, menu-editor |
| `saas-admin` | operación global de tenants y plataforma | `/saas/tenants`, `/saas/support` | `PlatformApiService`, `PlatformFacade` | `tenant-status-card`, `support-queue`, `platform-filter-bar` | global en saas-admin | auth, billing-subscriptions |
| `billing-subscriptions` | planes, trials y suscripciones | `/saas/plans`, `/saas/trials`, `/saas/subscriptions` | `BillingApiService`, `BillingFacade` | `plan-card`, `subscription-table`, `trial-funnel-tile` | feature state | saas-admin, permissions |

## Posición técnica sobre estado

No montaría `NgRx global` desde el día uno para las 3 apps.

Tomaría:

- `Signals` para estado UI y feature
- `facades` para exponer estado y comandos
- `RxJS` para streams HTTP/realtime
- stores locales por feature para editores complejos

### Estado global por app

Solo para:

- auth
- sesión activa
- tenant/branch contexto
- theme
- permisos
- feature flags

### Estado por feature

Para:

- onboarding
- preferencias
- recommendations
- menu editor
- availability
- analytics filters
- billing workflows

## Estrategia de routing

## Consumer Web

### Rutas públicas canónicas

- `/q/:qrCode`
- `/experience/start`
- `/experience/preferences`
- `/experience/recommendations`
- `/experience/refine`
- `/experience/explore`
- `/experience/feedback`
- `/experience/favorites`
- `/experience/benefits`
- `/experience/history`
- `/menu`
- `/login`
- `/register`

### Rutas recomendadas adicionales

- `/account`
- `/account/history`
- `/account/benefits`
- `/account/settings`

## Tenant Console

Externamente, puede publicarse como `/admin/*` o en subdominio administrativo.

### Rutas funcionales

- `/admin/dashboard`
- `/admin/menu`
- `/admin/menu/drafts`
- `/admin/menu/drafts/:draftId`
- `/admin/menu/published`
- `/admin/menu/published/:versionId`
- `/admin/products`
- `/admin/availability`
- `/admin/analytics`
- `/admin/analytics/branches`
- `/admin/campaigns`
- `/admin/campaigns/:campaignId`
- `/admin/loyalty`
- `/admin/staff`
- `/admin/settings`
- `/admin/settings/brand`
- `/admin/settings/branch`
- `/admin/chain/executive`

## SaaS Admin

Externamente, puede publicarse como `/saas/*` o en dominio aparte.

### Rutas funcionales

- `/saas/tenants`
- `/saas/tenants/:tenantId`
- `/saas/trials`
- `/saas/plans`
- `/saas/subscriptions`
- `/saas/onboarding`
- `/saas/onboarding/:caseId`
- `/saas/support`
- `/saas/feature-flags`

## Estrategia de lazy loading

Cada área grande debe cargarse lazy:

- `experience/*`
- `account/*`
- `admin/menu/*`
- `admin/analytics/*`
- `admin/campaigns/*`
- `saas/*`

## Guards y resolvers

| Guard o resolver | App | Función |
|---|---|---|
| `QrContextResolver` | consumer | valida QR, branch y mesa, e inicia sesión si corresponde |
| `AnonymousSessionGuard` | consumer | exige sesión anónima activa para entrar al flujo |
| `ConsumerAuthGuard` | consumer | protege historial, wallet y áreas privadas |
| `MergePendingGuard` | consumer | ofrece fusionar historial cuando hay cuenta y perfil anónimo activo |
| `StaffAuthGuard` | tenant | exige autenticación staff |
| `TenantContextGuard` | tenant | valida tenant y branch activos |
| `PermissionGuard` | tenant/saas | verifica roles y permisos por ruta |
| `BranchScopeGuard` | tenant | bloquea vistas si no hay branch seleccionada |
| `UnsavedChangesGuard` | tenant | evita perder cambios en draft o settings |
| `PlatformAuthGuard` | saas | exige sesión platform |
| `FeatureFlagGuard` | tenant/saas | habilita o bloquea módulos por plan o rollout |

## Manejo de sesión anónima

## Flujo recomendado

1. el QR resuelve `tenant`, `branch`, `table` y `entry context`
2. se crea o recupera `anonymous_profile`
3. se crea `anonymous_session`
4. el frontend guarda un `session token` corto y un `pseudonymous key` persistible
5. el flujo se rehidrata si el usuario vuelve durante la vigencia útil

## Responsabilidad frontend

- persistir `anonymous_profile key`
- restaurar contexto suave al volver
- separar identidad anónima de cuenta registrada
- disparar prompt de merge solo después de entregar valor

## Manejo de autenticación registrada

## Consumer

- login/register ligeros
- refresh token en cookie `HttpOnly`
- access token en memoria
- merge post-login si existe perfil anónimo compatible

## Tenant y SaaS

- login clásico protegido
- contexto de roles y permisos cargado al iniciar app
- tenant/branch o platform scope resueltos en `AppInitializer`

## Consumo de APIs

## Estrategia

- `HttpClient` con clientes tipados por dominio
- una carpeta `libs/shared/api/contracts` para DTOs compartidos
- interceptores por app:
  - auth
  - request-id
  - tenant-context
  - error normalization

## Diseño recomendado

- `ApiService` por módulo de negocio
- `Facade` por feature
- componentes nunca llaman endpoints directamente

## Manejo de permisos

## Modelo recomendado

- permisos evaluados por `PermissionService`
- lectura del claim de permisos + scopes activos
- route guards para acceso grueso
- directivas estructurales para visibilidad fina

### Tipos de permiso UI

- ver módulo
- ejecutar acción
- publicar
- editar
- administrar usuarios
- exportar

## Theming

## Base compartida

Usar `CSS variables` y design tokens desde `frontend/libs/shared/styles`.

### Capas de tema

1. `foundation tokens`
2. `semantic tokens`
3. `app theme`
4. `mode theme` light/dark

## Recomendación visual por app

- `consumer-web`: premium, cálido, inmersivo, orientado a descubrimiento
- `tenant-console`: operativo, contrastado, legible y rápido
- `saas-admin`: neutral, limpio, orientado a densidad de información

## Dark mode

Dejarlo preparado desde el inicio con:

- `data-theme="dark|light"`
- persistencia de preferencia
- fallback por `prefers-color-scheme`

## Componentes reutilizables

## Biblioteca compartida sugerida

- `libs/shared/ui/primitives`
- `libs/shared/ui/feedback`
- `libs/shared/ui/layout`
- `libs/shared/ui/data-display`

## Componentes de dominio prioritarios

| Componente | Datos que recibe | Acciones que dispara | Reutilización |
|---|---|---|---|
| `product-card` | `product`, `price`, `availability`, `badges` | ver detalle, guardar, pedir similar | consumer menu, recommendations, favorites |
| `recommendation-card` | `product`, `reasonLabels`, `rank`, `mode`, `pairings` | aceptar, refinar, feedback, favorito | recommendations, explore |
| `taste-chip` | `label`, `selected`, `intensity?` | seleccionar, deseleccionar | onboarding, preferences, refine |
| `dislike-chip` | `label`, `selected`, `severity?` | seleccionar, quitar | preferences, account settings |
| `price-pill` | `amount`, `currency`, `priceState` | ninguna o abrir detalle de precio | product-card, menu-item, admin preview |
| `score-badge` | `score`, `variant`, `label` | ninguna | recommendation-card, analytics compact tiles |
| `benefit-card` | `benefit`, `eligibility`, `expiresAt`, `costPoints` | ver detalle, canjear, guardar | benefits, loyalty admin preview |
| `feedback-prompt` | `question`, `options`, `context` | enviar feedback, omitir | feedback flow, post-consumption prompt |
| `menu-section-list` | `sections`, `activeSectionId`, `counts` | navegar, expandir, colapsar | consumer menu, tenant preview |
| `availability-toggle` | `productId`, `state`, `disabled?` | pausar, agotar, reactivar | branch ops, product list, menu preview |
| `draft-publish-banner` | `draftState`, `validationSummary`, `lastPublishedAt` | publicar, comparar, descartar | menu editor, drafts list |
| `analytics-tile` | `label`, `value`, `delta`, `trend`, `state` | drill-down, filter apply | dashboard, executive view, saas metrics |
| `branch-comparison-table` | `branches`, `metrics`, `selectedMetric`, `sort` | ordenar, comparar, abrir detalle | executive chain view, saas benchmarking |

## Estructura de shells y layouts

## `consumer-web`

- `PublicShell`
- `ExperienceShell`
- `AccountShell`

## `tenant-console`

- `TenantShell`
- `AdminContentLayout`
- `BranchOpsLayout`
- `ExecutiveLayout`

## `saas-admin`

- `PlatformShell`
- `PlatformDetailLayout`

## Estrategia para tiempo real

## Consumer

Usaría `SSE` para:

- disponibilidad de producto
- refresh de carta publicada
- campañas activas del momento

### Comportamiento UI

- parchear solo cards afectadas
- no recargar toda la pantalla
- mostrar micro-banner si la recomendación cambia por agotado

## Tenant Console

Usaría `SSE` y dejaría `WebSocket` preparado solo si más adelante aparece colaboración simultánea intensa.

### Casos

- producto agotado en caliente
- publicación nueva visible para operadores
- alertas de cambio en sucursal

## Estrategia para formularios complejos

## `menu-editor`

Debe tratarse como editor de dominio, no como un formulario plano.

### Recomendación

- store local de draft
- cambios por comandos
- validación incremental
- dirty state explícito
- autosave opcional por secciones
- diff draft vs publicación

### Patrones útiles

- formularios reactivos para edición detallada
- componentes tipo tree/editor para secciones y subsecciones
- side panels para producto, precio, tags e ingredientes

## Performance

## Objetivos para `consumer-web`

1. primera carga rápida
2. rehidratación suave de sesión
3. navegación rápida entre pasos
4. actualización incremental de disponibilidad

## Medidas concretas

### Carga rápida

- `SSR` en `consumer-web`
- above-the-fold mínimo
- critical CSS del shell
- lazy loading de rutas de experiencia

### Imágenes

- formatos modernos
- tamaños responsive
- placeholders o blur-up
- no cargar galerías completas en listado

### Skeletons

- skeletons para carta, recomendaciones y wallet
- evitar spinners de pantalla completa salvo bootstrap inicial

### Caché

- caché de menú publicado por `branch + menu_version`
- caché corta de recomendaciones por sesión
- invalidación por evento realtime

### Recuperación suave de sesión

- leer `anonymous_profile key`
- refrescar estado de sesión al arrancar
- si falla, volver a `/experience/start` sin romper la app

### Actualización de disponibilidad

- patch por `productId`
- invalidar solo item y recomendaciones afectadas
- recalcular CTA cuando un producto deja de ser elegible

## Performance en paneles

- tablas virtualizadas para listas grandes
- paginación server-driven
- filtros serializados en query params
- exportaciones asíncronas

## Testing

## Pirámide recomendada

### Unit

- facades
- services
- guards
- pipes
- utilidades de permisos

### Component

- cards, toggles, banners, prompts
- shells con routing mockeado
- formularios complejos del editor

### Integration

- flujo QR -> sesión -> preferencias -> recomendaciones -> feedback
- login staff -> dashboard -> availability
- publish draft -> visible en preview

### E2E

- flujo anónimo completo
- registro y merge de historial
- publicación de draft
- cambio de disponibilidad en tiempo real
- redención de beneficio

## Estrategia de evolución

### Fase 1

- shells definitivos
- routing base
- sesión anónima
- menú viewer
- recommendations y feedback
- tenant dashboard, menu y availability

### Fase 2

- auth consumidor
- favorites e historial
- loyalty
- analytics inicial
- campaigns

### Fase 3

- executive chain view
- saas onboarding y billing
- componentización fuerte en `libs/*`
- realtime consolidado

## Recomendación final

La arquitectura frontend correcta para MixMaster hoy es:

- `3 apps Angular separadas por audiencia`
- `consumer-web` con SSR
- `tenant-console` y `saas-admin` como SPA
- `signals + facades + feature stores`
- `routing lazy por módulo`
- `libs compartidas por dominio y UI`
- `SSE para disponibilidad y carta viva`

Lo que evitaría desde el inicio es una única app Angular gigante con rutas públicas y administrativas mezcladas. Reduciría claridad, empeoraría performance del consumidor y haría más difícil gobernar permisos, theming y ciclos de despliegue.
