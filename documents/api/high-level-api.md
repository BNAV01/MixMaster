# API de Alto Nivel

## Principios

- prefijo base externo: `/api/v1`
- segmentación por audiencia:
  - `/api/v1/public`
  - `/api/v1/consumer`
  - `/api/v1/admin`
  - `/api/v1/platform`
  - `/api/v1/internal` para integraciones y procesos internos expuestos por HTTP
- IDs públicos no secuenciales
- `tenant_id` siempre inferido o validado por backend
- idempotencia obligatoria en operaciones sensibles e integraciones

## 1. `auth`

### Recursos

- sesiones de autenticación
- refresh tokens
- principal actual
- registro consumidor
- recuperación de credenciales

### Operaciones

- `POST /api/v1/public/auth/register`
- `POST /api/v1/public/auth/login`
- `POST /api/v1/public/auth/refresh`
- `POST /api/v1/public/auth/logout`
- `GET /api/v1/consumer/auth/me`
- `POST /api/v1/admin/auth/login`
- `POST /api/v1/admin/auth/refresh`
- `POST /api/v1/admin/auth/logout`
- `GET /api/v1/admin/auth/me`
- `POST /api/v1/platform/auth/login`
- `POST /api/v1/platform/auth/refresh`
- `POST /api/v1/platform/auth/logout`
- `GET /api/v1/platform/auth/me`

### Públicos

- register/login/refresh/logout de consumidor
- login de admin y platform, aunque sean de acceso abierto a nivel HTTP

### Internos

- `POST /api/v1/internal/auth/token/introspect` si se necesita para conectores o edge

### De administración

- `GET /api/v1/admin/auth/me`
- `GET /api/v1/platform/auth/me`

### Seguridad

- rate limiting por IP y actor
- anti-enumeración
- refresh token rotation
- cookies `HttpOnly`
- claims con `audience` distinta por realm

## 2. `consumers`

### Recursos

- cuenta consumidor
- perfil por tenant
- preferencias
- favoritos
- historial
- memberships
- merge intents

### Operaciones

- `GET /api/v1/consumer/profile`
- `PATCH /api/v1/consumer/profile`
- `GET /api/v1/consumer/preferences`
- `PUT /api/v1/consumer/preferences`
- `GET /api/v1/consumer/favorites`
- `POST /api/v1/consumer/favorites`
- `DELETE /api/v1/consumer/favorites/{productId}`
- `GET /api/v1/consumer/history`
- `GET /api/v1/consumer/memberships`
- `POST /api/v1/consumer/merge-intents`
- `POST /api/v1/consumer/merge-intents/{mergeIntentId}/execute`

### Públicos

- ninguno

### Internos

- `POST /api/v1/internal/consumers/{accountId}/merge-anonymous-profile`

### De administración

- `GET /api/v1/admin/consumers/{accountId}` solo para soporte autorizado

### Seguridad

- solo el consumidor autenticado puede leer/escribir sus recursos
- merge auditado e idempotente
- soporte con permisos explícitos y audit trail

## 3. `anonymous-sessions`

### Recursos

- resolución de QR
- perfil anónimo
- sesión activa
- preferencias de sesión
- contexto de mesa/barra

### Operaciones

- `POST /api/v1/public/qr-scans`
- `POST /api/v1/public/sessions`
- `GET /api/v1/public/sessions/{sessionId}`
- `PATCH /api/v1/public/sessions/{sessionId}/preferences`
- `PATCH /api/v1/public/sessions/{sessionId}/context`
- `POST /api/v1/public/sessions/{sessionId}/heartbeat`
- `POST /api/v1/public/sessions/{sessionId}/close`

### Públicos

- todos los anteriores

### Internos

- `POST /api/v1/internal/sessions/{sessionId}/expire`

### De administración

- `GET /api/v1/admin/branches/{branchId}/active-sessions`

### Seguridad

- QR firmado o tokenizable
- session token corto
- rate limiting
- validación estricta de `branch/table/qr`

## 4. `menus`

### Recursos

- menú publicado
- draft de menú
- publicaciones
- items
- categorías
- productos
- availability overlay
- rollback

### Operaciones

- `GET /api/v1/public/menus/current`
- `GET /api/v1/public/menus/current/items`
- `GET /api/v1/public/products/{productId}`
- `GET /api/v1/public/availability`
- `GET /api/v1/admin/menus`
- `POST /api/v1/admin/menus`
- `GET /api/v1/admin/menus/{menuId}/draft`
- `PATCH /api/v1/admin/menus/{menuId}/draft`
- `POST /api/v1/admin/menus/{menuId}/draft/items`
- `PATCH /api/v1/admin/menus/{menuId}/draft/items/{itemId}`
- `DELETE /api/v1/admin/menus/{menuId}/draft/items/{itemId}`
- `POST /api/v1/admin/menus/{menuId}/publish`
- `POST /api/v1/admin/menus/{menuId}/rollback`
- `PATCH /api/v1/admin/availability/products/{productId}`

### Públicos

- lectura de menú publicado y disponibilidad vigente

### Internos

- `POST /api/v1/internal/menu-publications/{publicationId}/rebuild-read-model`

### De administración

- todos los endpoints bajo `/api/v1/admin/menus`
- disponibilidad administrativa bajo `/api/v1/admin/availability`

### Seguridad

- endpoints públicos sujetos a sesión/QR válido
- edición estructural requiere `MENU_EDITOR` o superior
- publicación/rollback requiere permiso adicional por scope
- disponibilidad operativa requiere `AVAILABILITY_OPERATOR`, `BAR_MANAGER` o superior

## 5. `recommendations`

### Recursos

- requests
- resultados
- explicaciones
- pairings
- exploración guiada

### Operaciones

- `POST /api/v1/public/recommendations`
- `GET /api/v1/public/recommendations/{recommendationId}`
- `POST /api/v1/public/recommendations/{recommendationId}/accept`
- `POST /api/v1/public/recommendations/{recommendationId}/reject`
- `GET /api/v1/consumer/recommendations/history`
- `GET /api/v1/admin/recommendations/metrics`
- `GET /api/v1/internal/recommendations/model-info`

### Públicos

- generar, leer, aceptar y rechazar recomendaciones en sesión activa

### Internos

- modelo, diagnostics y replay controlado para soporte técnico

### De administración

- métricas agregadas y desempeño de recomendación

### Seguridad

- requiere sesión anónima válida o cuenta consumidor
- no exponer scores internos completos al público
- endpoints internos solo para operadores técnicos autorizados

## 6. `feedback`

### Recursos

- feedback de recomendación
- feedback libre
- quick reactions

### Operaciones

- `POST /api/v1/public/feedback`
- `POST /api/v1/public/recommendations/{recommendationId}/feedback`
- `GET /api/v1/admin/feedback/summary`
- `GET /api/v1/admin/feedback/by-product`

### Públicos

- envío de feedback durante o después de la sesión

### Internos

- `POST /api/v1/internal/feedback/reprocess`

### De administración

- vistas agregadas por producto, categoría, branch o turno

### Seguridad

- feedback vinculado a sesión, recomendación o consumo
- idempotencia por evento/consumo
- administración solo sobre agregados, no sobre PII innecesaria

## 7. `benefits`

### Recursos

- wallet
- ledger de puntos
- niveles
- beneficios otorgados
- redemptions
- reglas de fidelización

### Operaciones

- `GET /api/v1/consumer/benefits/wallet`
- `GET /api/v1/consumer/benefits/ledger`
- `GET /api/v1/consumer/benefits/levels`
- `POST /api/v1/consumer/benefits/{benefitId}/redeem`
- `GET /api/v1/admin/loyalty/rules`
- `POST /api/v1/admin/loyalty/rules`
- `PATCH /api/v1/admin/loyalty/rules/{ruleId}`
- `GET /api/v1/admin/benefits/redemptions`
- `POST /api/v1/internal/benefits/grants`

### Públicos

- ninguno sin cuenta; en `public` solo debería existir un teaser de beneficios

### Internos

- grants automáticos por eventos o integraciones

### De administración

- reglas, catálogo de beneficios y auditoría de redemptions

### Seguridad

- wallet solo del consumidor autenticado
- redemption atada a tenant, branch, vigencia y antifraude
- reglas administrables por `CHAIN_ADMIN`, `TENANT_OWNER` o equivalentes

## 8. `sales`

### Recursos

- ventas
- ítems de venta
- importaciones
- consumption records
- conciliaciones

### Operaciones

- `POST /api/v1/admin/sales/imports`
- `GET /api/v1/admin/sales/imports/{importId}`
- `POST /api/v1/admin/consumption-records`
- `GET /api/v1/admin/sales`
- `GET /api/v1/admin/consumption-records`
- `POST /api/v1/internal/pos/webhooks/{provider}`
- `POST /api/v1/internal/sales/imports/{provider}`

### Públicos

- ninguno

### Internos

- webhooks de POS
- ingestas batch

### De administración

- importación manual, consulta y conciliación

### Seguridad

- webhooks firmados e idempotentes
- permisos de branch ops para carga manual
- acceso a ventas restringido por scope y rol

## 9. `analytics`

### Recursos

- dashboard de experiencia
- dashboard comercial
- dashboard de loyalty
- embudos
- benchmark por sucursal
- exports

### Operaciones

- `GET /api/v1/admin/analytics/experience`
- `GET /api/v1/admin/analytics/commercial`
- `GET /api/v1/admin/analytics/loyalty`
- `GET /api/v1/admin/analytics/branches/{branchId}`
- `POST /api/v1/admin/analytics/exports`
- `GET /api/v1/platform/analytics/tenants`

### Públicos

- ninguno

### Internos

- `POST /api/v1/internal/analytics/rebuild`

### De administración

- vistas de tenant y platform

### Seguridad

- acceso solo agregado
- branch scope para analistas locales
- tenant scope para dueños/cadena
- platform scope solo para superadmin SaaS

## 10. `staff-admin`

### Recursos

- staff users
- role assignments
- turnos operativos
- quick availability
- sesiones activas en sala

### Operaciones

- `GET /api/v1/admin/staff/users`
- `POST /api/v1/admin/staff/users`
- `PATCH /api/v1/admin/staff/users/{staffUserId}`
- `POST /api/v1/admin/staff/role-assignments`
- `GET /api/v1/admin/ops/branches/{branchId}/active-sessions`
- `PATCH /api/v1/admin/ops/availability/products/{productId}`
- `GET /api/v1/admin/ops/tables/{tableId}/sessions`

### Públicos

- ninguno

### Internos

- ninguno salvo procesos de sync si el tenant integra HR o IAM externo

### De administración

- todos los endpoints anteriores

### Seguridad

- `BRANCH_ADMIN`, `BAR_MANAGER`, `AVAILABILITY_OPERATOR` según endpoint
- asignaciones por branch o tenant
- toda acción auditada

## 11. `tenant-admin`

### Recursos

- tenant settings
- brands
- branches
- tables
- QR
- menú maestro
- campañas
- loyalty config
- integraciones

### Operaciones

- `GET /api/v1/admin/tenant`
- `PATCH /api/v1/admin/tenant`
- `GET /api/v1/admin/brands`
- `POST /api/v1/admin/branches`
- `PATCH /api/v1/admin/branches/{branchId}`
- `GET /api/v1/admin/branches/{branchId}/tables`
- `POST /api/v1/admin/branches/{branchId}/qrs`
- `GET /api/v1/admin/campaigns`
- `POST /api/v1/admin/campaigns`
- `PATCH /api/v1/admin/campaigns/{campaignId}`
- `GET /api/v1/admin/integrations`
- `POST /api/v1/admin/integrations/{provider}/connect`

### Públicos

- ninguno

### Internos

- `POST /api/v1/internal/tenants/{tenantId}/health-checks`

### De administración

- todos los endpoints anteriores

### Seguridad

- `TENANT_OWNER`, `CHAIN_ADMIN`, `BRANCH_ADMIN` según scope
- cambios de configuración con auditoría y control de permisos finos

## 12. `platform-admin`

### Recursos

- tenants
- trials
- suscripciones
- entitlements
- onboarding
- support cases
- feature flags

### Operaciones

- `GET /api/v1/platform/tenants`
- `POST /api/v1/platform/tenants`
- `PATCH /api/v1/platform/tenants/{tenantId}`
- `GET /api/v1/platform/subscriptions`
- `PATCH /api/v1/platform/subscriptions/{subscriptionId}`
- `GET /api/v1/platform/onboarding/cases`
- `POST /api/v1/platform/support/cases`
- `PATCH /api/v1/platform/feature-flags/{flagKey}`

### Públicos

- ninguno

### Internos

- `POST /api/v1/internal/platform/billing/webhooks/{provider}`

### De administración

- todos los endpoints bajo `/api/v1/platform`

### Seguridad

- realm separado del tenant
- MFA recomendado
- auditoría reforzada
- permisos granulares de billing, onboarding y soporte

## Reglas transversales de seguridad

- toda ruta pública debe validarse por QR, sesión o token contextual
- toda ruta consumer usa identidad del actor autenticado, nunca `accountId` arbitrario
- toda ruta admin valida rol + scope de tenant/brand/branch
- toda ruta platform opera fuera del contexto tenant salvo cuando actúa sobre un tenant específico
- toda integración HTTP requiere firma, secreto o token de servicio e idempotencia
