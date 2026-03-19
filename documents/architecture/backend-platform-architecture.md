# Arquitectura Backend y General de Plataforma

## Objetivo

Definir la arquitectura técnica objetivo para MixMaster como plataforma SaaS multitenant para bares, restobares y locales con barra, con foco en:

- experiencia QR mobile-first
- recomendación personalizada
- carta digital viva
- perfiles anónimos y cuentas registradas
- beneficios y fidelización
- feedback de recomendación
- ventas y consumo
- analítica operativa y comercial

Este documento describe la arquitectura objetivo del sistema. El código actual del backend contiene piezas heredadas de otro proyecto; por lo mismo, esta arquitectura debe tomarse como guía oficial de refactorización y evolución.

## Arquitectura general propuesta

MixMaster debe implementarse hoy como un `monolito modular` con estas características:

- un solo despliegue backend Spring Boot
- una sola base de datos relacional
- Redis para caché, coordinación y realtime
- eventos internos de negocio desacoplados por outbox
- tres fronteras HTTP externas por audiencia:
  - `public/consumer-web`
  - `tenant-console`
  - `saas-admin`

### Vista de alto nivel

```text
consumer-web / tenant-console / saas-admin
                |
                v
        Spring Boot Modular Monolith
                |
    +-----------+-----------+------------------+
    | interfaces by audience | shared platform |
    +-----------+-----------+------------------+
                |
                v
           domain modules
                |
    +-----------+-----------+------------------+
    | relational database   | redis            |
    | outbox/event log      | cache/pub-sub    |
    +-----------+-----------+------------------+
                |
                v
     future connectors: POS, inventory, CRM, notifications
```

## Por qué monolito modular hoy

### Razones de negocio y delivery

- El producto todavía necesita aprender sus límites reales entre menú, recomendación, loyalty, ventas y analítica.
- La mayor parte del valor inicial depende de transacciones consistentes entre módulos cercanos.
- El equipo necesita velocidad de iteración, no complejidad de infraestructura.
- El costo de observabilidad, tracing distribuido, contratos entre servicios y operación 24/7 de microservicios sería prematuro.

### Razones técnicas

- `menu-publication`, `product-availability`, `recommendation-engine`, `feedback` y `orders-sales-consumption` comparten datos y reglas estrechamente acopladas.
- El merge entre perfil anónimo y cuenta requiere consistencia transaccional y auditoría fuerte.
- El multitenancy shared-schema es más sencillo de endurecer en un monolito antes de distribuir procesos.
- La evolución a microservicios futuros sigue abierta si los módulos se desacoplan por eventos, contratos y límites de dominio claros.

### Decisión

Tomaría hoy `Spring Boot + modular monolith + base relacional + Redis + outbox interno`.

No tomaría hoy microservicios, CQRS extremo ni data stores distintos por módulo.

## Bounded contexts y mapa de módulos

### 1. Tenancy y organización

Responsable de la estructura comercial y operativa del SaaS.

- `tenant-management`
- `billing-subscriptions`
- `onboarding-support`

### 2. Identity y access

Responsable de actores, credenciales, scopes y sesiones.

- `identity`
- `staff-users`
- `consumer-accounts`
- `anonymous-profiles`
- `sessions`

### 3. Menú y catálogo

Responsable de productos, estructura de carta, publicación y operación en vivo.

- `product-catalog`
- `menu-management`
- `menu-publication`
- `product-availability`

### 4. Experiencia inteligente

Responsable de recomendación, contexto, aprendizaje y feedback.

- `recommendation-engine`
- `recommendation-feedback`

### 5. Comercial y retención

Responsable de loyalty, campañas y activación de beneficios.

- `loyalty-benefits`
- `campaigns-promotions`

### 6. Comercio y consumo

Responsable de venta registrada, consumo, conciliación e integraciones operativas.

- `orders-sales-consumption`
- `notifications`

### 7. Gobierno y plataforma

Responsable de trazabilidad, auditoría, datos operativos y gobierno SaaS.

- `analytics-reporting`
- `audit-governance`

## Responsabilidad de cada módulo

| Módulo | Responsabilidad principal | Dependencias naturales |
|---|---|---|
| `tenant-management` | tenants, marcas, sucursales, mesas, QR, settings y feature scope | billing, onboarding, analytics |
| `identity` | autenticación, emisión de tokens, refresh, policies de sesión, password/OTP providers | staff-users, consumer-accounts, sessions |
| `staff-users` | usuarios internos, roles, permisos y asignaciones por tenant/brand/branch | tenant-management, identity |
| `consumer-accounts` | cuentas registradas, perfil persistente, favoritos, historial y membership | identity, loyalty, analytics |
| `anonymous-profiles` | perfil seudónimo, gustos, rechazos y señales históricas sin cuenta | sessions, recommendation, analytics |
| `sessions` | sesiones QR, contexto de mesa/barra, device binding y correlation ids | tenant-management, anonymous-profiles |
| `product-catalog` | productos, categorías, ingredientes, tags, atributos, restricciones y taxonomía | menu-management, recommendation |
| `menu-management` | draft de carta, edición estructural, validación y herencia base por cadena | product-catalog, tenant-management |
| `menu-publication` | snapshots publicados, versionado, rollback y distribución de carta activa | menu-management, recommendation, realtime |
| `product-availability` | agotado, pausado, reactivado, override local y estado por turno | menu-publication, sessions, analytics |
| `recommendation-engine` | ranking, explanation, exploración, pairings y estrategia de fallback | menu-publication, anonymous-profiles, consumer-accounts, feedback |
| `recommendation-feedback` | captura y validación de feedback, rechazo, rating y utilidad percibida | recommendation-engine, analytics, loyalty |
| `loyalty-benefits` | wallet, puntos, niveles, grants, redemptions y reglas de elegibilidad | consumer-accounts, sales, campaigns |
| `campaigns-promotions` | campañas temporales, boosts, triggers por segmento y objetivos de negocio | loyalty, recommendation, analytics |
| `orders-sales-consumption` | ventas importadas, consumo registrado, conciliación y correlación con sesión | benefits, analytics, recommendation |
| `analytics-reporting` | métricas operativas y comerciales, funnels y agregados por sucursal/cadena | casi todos los módulos |
| `notifications` | email, push futuro, mensajes transaccionales y operativos | identity, loyalty, billing, onboarding |
| `audit-governance` | auditoría funcional, revisión de cambios, actor/request tracing y cumplimiento | todos los módulos |
| `billing-subscriptions` | plan, trial, suscripción, entitlements y lifecycle SaaS | tenant-management, platform admin |
| `onboarding-support` | carga inicial de carta, QA, soporte, tasks de implementación y health checks | tenant-management, menu-management |

## Propuesta de paquetes backend

### Base package oficial

`com.mixmaster.platform`

La base package actual heredada no debe tomarse como estructura final. La meta debe ser converger a este paquete.

### Propuesta estructural

```text
com.mixmaster.platform
├── bootstrap
├── interfaces
│   ├── consumerweb
│   │   ├── configs
│   │   ├── controllers
│   │   ├── dtos
│   │   ├── exceptions
│   │   ├── mappers
│   │   ├── security
│   │   └── utils
│   ├── tenantconsole
│   │   ├── configs
│   │   ├── controllers
│   │   ├── dtos
│   │   ├── exceptions
│   │   ├── mappers
│   │   ├── security
│   │   └── utils
│   └── saasadmin
│       ├── configs
│       ├── controllers
│       ├── dtos
│       ├── exceptions
│       ├── mappers
│       ├── security
│       └── utils
├── modules
│   ├── tenantmanagement
│   ├── identity
│   ├── staffusers
│   ├── consumeraccounts
│   ├── anonymousprofiles
│   ├── sessions
│   ├── productcatalog
│   ├── menumanagement
│   ├── menupublication
│   ├── productavailability
│   ├── recommendation
│   ├── feedback
│   ├── loyalty
│   ├── campaigns
│   ├── orderssalesconsumption
│   ├── analytics
│   ├── notifications
│   ├── billing
│   └── onboarding
└── shared
    ├── api
    ├── audit
    ├── cache
    ├── events
    ├── idempotency
    ├── observability
    ├── realtime
    ├── security
    ├── tenant
    └── validation
```

### Mejora sobre la estructura por capas propuesta

Tu lista de carpetas por audiencia es útil en la frontera API. La mantendría ahí:

- `DTOs`
- `configs`
- `controllers`
- `exceptions`
- `mappers`
- `security`
- `utils`

En implementación Java real, esos nombres deben ir en minúscula por convención de packages:

- `dtos`
- `configs`
- `controllers`
- `exceptions`
- `mappers`
- `security`
- `utils`

Pero **no** replicaría `models`, `repositories` y `services` por audiencia como estructura dominante del sistema. Eso fragmentaría el dominio en tres copias artificiales.

La decisión correcta es:

- `interfaces/<audiencia>/<capa>` para controllers, DTOs y seguridad
- `modules/<dominio>` para entidades, repositorios y servicios de negocio

### Audit

La carpeta `audit` sí debe existir como capacidad transversal. La mejor versión no es “un audit por audiencia”, sino:

- `shared/audit` para infraestructura común:
  - `AuditModelListener`
  - `AuditRevision`
  - `AuditRevisionRepository`
  - `AuditRevisionService`
  - `PlatformAuditorAware`
  - `AuditRevisionEvent`
- `modules/<dominio>/audit` solo cuando un módulo necesita lógica específica de revisión o snapshots especiales

## Capas internas por módulo

Dentro de cada módulo de dominio recomiendo este corte:

- `domain`
- `application`
- `infrastructure`

### `domain`

- entidades
- value objects
- reglas de negocio
- eventos de dominio
- repositorios como interfaces

### `application`

- casos de uso
- command/query handlers
- orchestración transaccional
- políticas de autorización de negocio

### `infrastructure`

- repositorios JPA
- adaptadores a Redis
- adaptadores a email/SMS
- listeners de eventos
- mapeos técnicos

## Autenticación y autorización

## Actores y realms

El backend debe manejar cuatro realms lógicos:

- `public-anonymous`
- `consumer-account`
- `tenant-staff`
- `platform-admin`

## Estrategia recomendada

- `access tokens JWT` de corta vida
- `refresh tokens opacos` y rotados, almacenados hasheados en base de datos
- `cookies HTTP-only` para refresh en apps web
- `access token` mantenido en memoria del frontend
- `aud`, `scope`, `tenant_scope`, `branch_scope` y `actor_type` explícitos en claims

## Autenticación por tipo de actor

### Consumidor anónimo

- no usa cuenta
- recibe un `anonymous session token` firmado y corto
- el token queda vinculado a `qr_id`, `branch_id`, `table_id` y `anonymous_profile_id`

### Consumidor con cuenta

- puede registrarse luego de usar la sesión anónima
- obtiene `consumer access token` y refresh
- el merge del historial no ocurre en el token, ocurre por caso de uso auditable

### Staff de tenant

- login por credenciales internas
- recomendable añadir MFA desde fase posterior
- permisos resueltos por asignaciones con scope:
  - tenant
  - brand
  - branch

### Superadmin SaaS

- realm separado del tenant
- permisos globales de billing, onboarding, soporte y configuración

## Autorización

Tomaría `RBAC + scope-based authorization`.

### Roles sugeridos

- `SUPERADMIN`
- `BILLING_ADMIN`
- `ONBOARDING_AGENT`
- `SUPPORT_AGENT`
- `TENANT_OWNER`
- `CHAIN_ADMIN`
- `BRANCH_ADMIN`
- `BAR_MANAGER`
- `MENU_EDITOR`
- `AVAILABILITY_OPERATOR`
- `WAITER`
- `COMMERCIAL_ANALYST`
- `CONSUMER`

### Reglas

- todo recurso de tenant se resuelve con `tenant_id` inferido y validado
- un staff no puede cruzar scopes fuera de su asignación
- un consumidor solo ve sus propios recursos
- una sesión anónima solo puede operar dentro de su QR y su sesión

## Estrategia multitenant

## Modelo recomendado

`shared-schema` con `tenant_id` desde el origen.

### Jerarquía organizacional

`tenant -> brand -> branch -> table -> qr`

### Tablas globales

Sin `tenant_id`:

- `platform_user`
- `plan`
- `subscription`
- `feature_flag_definition`
- `integration_provider_definition`

### Tablas tenant-scoped

Con `tenant_id` obligatorio:

- `branch`
- `table`
- `qr`
- `product`
- `menu_*`
- `product_availability_*`
- `campaign_*`
- `sale_*`
- `consumption_*`
- `analytics_*`
- `staff_*`

### Tablas híbridas

Global identity, uso acotado por tenant:

- `consumer_account`
- `consumer_tenant_profile`
- `consumer_membership`

Esto permite:

- una identidad única del consumidor
- historial y beneficios reutilizables entre sucursales afiliadas
- aislamiento entre tenants no relacionados

## Enforcement técnico

- `TenantContextFilter` para extraer tenant desde host, ruta, token o QR
- `TenantContextHolder` por request
- validación obligatoria del scope en capa application
- repositorios y queries siempre tenant-aware
- pruebas automáticas de “cross-tenant data leak”

No confiaría jamás en un `tenant_id` enviado libremente por el frontend.

## Auditoría y trazabilidad

## Qué auditar

- cambios estructurales de carta
- publicaciones y rollback
- cambios de disponibilidad
- grants y redemptions de beneficios
- merge de perfil anónimo a cuenta
- importaciones de ventas
- cambios de roles, settings e integraciones

## Estrategia

Combinaría tres capas:

### 1. Auditoría de entidades

- `created_at`
- `created_by`
- `updated_at`
- `updated_by`
- `tenant_id`
- `branch_id` cuando aplique

### 2. Revisiones de cambios

Usar `Hibernate Envers` o equivalente para entidades críticas:

- `menu`
- `menu_version`
- `menu_item`
- `product`
- `product_availability_state`
- `benefit_rule`
- `role_assignment`

La revisión debe almacenar:

- `request_id`
- `tenant_id`
- `actor_type`
- `actor_id`
- `reason`

### 3. Audit log funcional

Append-only para hechos de negocio:

- `MenuPublished`
- `BenefitRedeemed`
- `AnonymousProfileMerged`
- `SaleImported`

Esto no reemplaza la auditoría de entidad; la complementa.

## Logging y observabilidad

## Logging

Usar logging estructurado en JSON con MDC:

- `request_id`
- `correlation_id`
- `tenant_id`
- `brand_id`
- `branch_id`
- `session_id`
- `anonymous_profile_id`
- `consumer_account_id`
- `actor_id`
- `event_type`

## Métricas clave

- latencia por endpoint
- tiempo de generación de recomendación
- ratio de cache hit
- cantidad de SSE activas
- delay entre cambio de disponibilidad y entrega al cliente
- lag de publicación de carta
- éxito/fallo de importación de ventas
- tiempo de merge de perfil anónimo

## Observabilidad mínima

- Spring Boot Actuator
- Micrometer
- trazas OpenTelemetry-ready
- alertas sobre errores por audiencia y por tenant

## Estrategia de eventos internos de negocio

## Patrón recomendado

`domain events + transactional outbox`

### Flujo

1. un caso de uso cambia estado dentro de la transacción
2. el módulo genera un evento de dominio
3. el evento se persiste en tabla outbox en la misma transacción
4. un dispatcher interno publica el evento a listeners locales
5. en el futuro el mismo outbox puede alimentar Kafka, SNS/SQS o webhooks

### Por qué así

- evita pérdida de eventos
- evita coupling síncrono entre módulos
- mantiene la puerta abierta a integraciones futuras

## Eventos principales

| Evento | Cuándo ocurre | Datos mínimos | Módulos que reaccionan |
|---|---|---|---|
| `QRScanned` | al resolver un QR válido de mesa o barra | `event_id`, `occurred_at`, `tenant_id`, `brand_id`, `branch_id`, `table_id`, `qr_id`, `device_fingerprint` | sessions, anonymous-profiles, analytics-reporting |
| `AnonymousProfileCreated` | cuando se crea un perfil seudónimo nuevo | `anonymous_profile_id`, `tenant_id`, `branch_id`, `source_qr_id`, `created_at` | sessions, recommendation-engine, analytics-reporting |
| `SessionStarted` | al iniciar una sesión activa sobre QR | `session_id`, `tenant_id`, `branch_id`, `table_id`, `qr_id`, `anonymous_profile_id/account_id`, `started_at` | recommendation-engine, campaigns-promotions, analytics-reporting |
| `PreferencesSubmitted` | cuando el usuario entrega gustos, rechazos o contexto | `session_id`, `tenant_id`, `preferences`, `rejections`, `context`, `exploration_level` | recommendation-engine, anonymous-profiles, consumer-accounts, analytics-reporting |
| `RecommendationGenerated` | al persistir un set de recomendaciones | `recommendation_id`, `session_id`, `menu_publication_id`, `algorithm_version`, `candidate_product_ids`, `generated_at` | recommendation-feedback, analytics-reporting, campaigns-promotions |
| `RecommendationAccepted` | cuando el usuario acepta, guarda o selecciona una recomendación | `recommendation_id`, `session_id`, `product_id`, `rank`, `accepted_at` | orders-sales-consumption, loyalty-benefits, analytics-reporting |
| `RecommendationRejected` | cuando el usuario descarta o marca que no le interesa | `recommendation_id`, `session_id`, `product_id`, `reason`, `rejected_at` | recommendation-engine, analytics-reporting |
| `FeedbackSubmitted` | cuando el usuario evalúa si la recomendación fue acertada | `feedback_id`, `recommendation_id`, `session_id`, `product_id`, `score`, `feedback_type`, `submitted_at` | recommendation-engine, loyalty-benefits, analytics-reporting |
| `AccountCreated` | al crear una cuenta registrada | `account_id`, `tenant_id`, `source_session_id`, `source_anonymous_profile_id`, `created_at` | consumer-accounts, loyalty-benefits, analytics-reporting, notifications |
| `AnonymousProfileMerged` | cuando el historial anónimo se fusiona a una cuenta | `merge_id`, `account_id`, `anonymous_profile_id`, `merged_session_ids`, `merged_at` | consumer-accounts, recommendation-engine, loyalty-benefits, analytics-reporting, audit-governance |
| `MenuDraftUpdated` | cuando se modifica un borrador estructuralmente | `menu_id`, `draft_id`, `tenant_id`, `scope_type`, `scope_id`, `changed_by`, `updated_at` | menu-publication, audit-governance, analytics-reporting |
| `MenuPublished` | al publicar una versión de carta | `menu_id`, `publication_id`, `version_number`, `tenant_id`, `scope_type`, `scope_id`, `published_at` | recommendation-engine, product-availability, analytics-reporting, shared-cache, shared-realtime |
| `ProductStateChanged` | al agotar, pausar o reactivar un producto | `tenant_id`, `branch_id`, `product_id`, `state`, `reason`, `effective_at`, `expires_at` | recommendation-engine, analytics-reporting, shared-realtime, orders-sales-consumption |
| `BenefitGranted` | al otorgar beneficio o puntos | `grant_id`, `tenant_id`, `account_id`, `benefit_id`, `grant_type`, `expires_at`, `trigger_event_id` | notifications, analytics-reporting, campaigns-promotions |
| `BenefitRedeemed` | al redimir un beneficio | `redemption_id`, `tenant_id`, `branch_id`, `account_id`, `benefit_id`, `sale_id`, `redeemed_at` | orders-sales-consumption, analytics-reporting, audit-governance |
| `SaleImported` | al ingresar una venta desde POS o importación | `sale_id`, `tenant_id`, `branch_id`, `external_sale_ref`, `sale_source`, `occurred_at`, `gross_total` | loyalty-benefits, analytics-reporting, recommendation-engine |
| `ConsumptionRecorded` | al registrar consumo efectivo asociado a sesión/cuenta | `consumption_id`, `tenant_id`, `branch_id`, `session_id`, `account_id/anonymous_profile_id`, `product_ids`, `recorded_at` | analytics-reporting, loyalty-benefits, recommendation-engine |

## Estrategia de realtime

## Qué necesita casi tiempo real

- publicación de carta
- cambio de disponibilidad
- campañas activas del turno
- refresco de sesiones y sugerencias operativas

## Recomendación

- `SSE` para `consumer-web`
- `SSE` o `WebSocket` para `tenant-console`
- Redis pub/sub para escalar múltiples instancias backend

### Por qué SSE en consumer

- el tráfico es mayormente server-to-client
- es más simple que WebSocket
- funciona bien para:
  - producto agotado
  - cambio de publicación
  - sugerencia operativa de refresh

### Payloads realtime

- `menu-publication-updated`
- `product-availability-updated`
- `campaign-highlight-updated`
- `session-ended`

## Estrategia de caché

## Redis

Usaría Redis para:

- publicación activa por branch
- overlay de disponibilidad
- catálogos altamente consultados
- rate limiting
- sesiones efímeras
- locks livianos
- fanout de eventos realtime

## Qué cachear

- menú publicado por `branch_id + publication_id`
- detalle de producto enriquecido
- reglas activas de beneficios y campañas
- resultados de recomendación muy efímeros por sesión
- QR resolution metadata

## Invalidación

Siempre orientada por eventos:

- `MenuPublished` invalida snapshots previos
- `ProductStateChanged` invalida overlay y cards afectadas
- `BenefitGranted` refresca wallet y elegibilidad

No mezclaría caché con verdad de negocio. La fuente de verdad sigue siendo la base relacional.

## Estrategia de versionado de carta

## Principio

La carta publicada debe ser un `snapshot auditable e inmutable`.

## Modelo recomendado

- `menu_definition`
- `menu_draft`
- `menu_draft_item`
- `menu_publication`
- `menu_publication_item`

## Reglas

- cambios estructurales ocurren en draft
- publicación crea snapshot
- disponibilidad no modifica el snapshot
- disponibilidad vive como overlay operacional
- rollback se implementa re-publicando una versión anterior

## Herencia de cadena

Para cadenas:

- carta base a nivel tenant o brand
- branch overrides para precios, visibilidad o disponibilidad
- publicación final compuesta por herencia + overrides locales

## Estrategia para perfiles anónimos y sesiones

## Sesión anónima

Debe separarse en dos objetos:

- `anonymous_profile`
- `session`

### `anonymous_profile`

- guarda señales persistibles
- no requiere PII
- puede sobrevivir varias visitas

### `session`

- representa una visita concreta
- cuelga de QR, branch, table y contexto temporal
- sirve para recomendación, feedback y correlación con consumo

## Persistencia técnica

- cookie first-party o storage local con id seudónimo
- rotación y expiración razonable
- consentimiento claro si se guardan preferencias persistentes

## Datos recomendados en perfil anónimo

- gustos
- rechazos
- sensibilidad a alcohol
- afinidad por categorías
- feedback histórico
- nivel de exploración

No guardaría PII en el perfil anónimo.

## Estrategia de merge anónimo a cuenta

## Principios

- merge explícito y auditable
- no bloquear la creación de cuenta
- no perder la traza de origen
- idempotencia obligatoria

## Flujo recomendado

1. el usuario crea cuenta o hace login
2. el sistema detecta un `anonymous_profile` elegible en el dispositivo o sesión activa
3. se genera `merge intent`
4. un caso de uso consolida señales, favoritos, historial y eventos
5. se emite `AnonymousProfileMerged`
6. las filas originales quedan vinculadas como fuente, no borradas

## Reglas de consolidación

- historial de consumo se conserva como hechos
- preferencias se fusionan por última actualización y frecuencia
- favoritos duplicados se compactan
- beneficios solo se transfieren si la regla lo permite

## Estrategia para campañas y beneficios

## Separación sana

- `loyalty-benefits` gestiona wallet, puntos, niveles y redemptions
- `campaigns-promotions` gestiona campañas, ventanas horarias, segmentación y boosts

## Triggering

Las campañas y beneficios deben reaccionar a eventos:

- visita
- feedback
- consumo
- cumpleaños
- descubrimiento de categoría nueva
- recuperación de cliente inactivo

## Reglas operativas

- beneficios con bajo costo marginal primero
- grants automáticos con expiración
- redemptions idempotentes y conciliables
- anti-fraude por branch, sesión, consumo y ventana de tiempo

## Estrategia para disponibilidad en tiempo real

## Modelo

La disponibilidad no debe editar el draft ni la publicación.

Debe existir una capa operacional:

- `product_availability_state`
- `product_availability_change`

## Niveles

- tenant default
- branch override
- turno o franja horaria
- agotado puntual

## Reglas

- prioridad a override de branch
- timestamps de vigencia
- motivo opcional visible al staff
- sustituto sugerido opcional para no perder venta

## Estrategia para ventas y consumo

## Principio

No basta con medir clicks o recomendaciones. Debe existir cierre de loop con hechos comerciales.

## Dos objetos distintos

- `sale`: hecho comercial importado o capturado
- `consumption_record`: hecho asociado a la experiencia del consumidor

### `sale`

- fuente POS, carga manual o importación CSV/API
- contiene ítems, montos, impuestos, descuentos y referencia externa

### `consumption_record`

- puede existir aunque no haya integración total con POS
- permite marcar qué recomendación terminó en consumo

## Correlación

La correlación ideal usa:

- `session_id`
- `branch_id`
- ventana temporal
- `table_id`
- ítems vendidos
- staff assist cuando aplique

## Integraciones futuras con POS e inventario

## Principio de diseño

Integraciones como `anti-corruption layer`, no mezcladas con el dominio core.

## Estrategia

- puertos desde `orders-sales-consumption`
- adaptadores en `infrastructure/integrations`
- `connector registry` por proveedor
- jobs asíncronos con idempotencia
- `inbox/outbox` para webhooks e importaciones

## POS

Casos objetivo:

- importar ventas cerradas
- obtener catálogo o mapping de productos
- cerrar redemptions
- reconciliar descuentos

## Inventario

Casos objetivo:

- stock o agotado sugerido
- disponibilidad automática
- alertas por insumos críticos

No haría que inventario externo sea dependencia dura del tiempo real del MVP.

## Riesgos técnicos principales

- fuga de datos entre tenants por filtros mal aplicados
- modelo de roles demasiado laxo o demasiado rígido
- acoplar recomendación directo al CRUD del menú
- usar disponibilidad como edición estructural
- no distinguir venta de consumo
- generar beneficios sin reglas antifraude
- depender del POS demasiado pronto
- mezclar analítica agregada con lecturas operativas en línea

## Medidas de seguridad

- JWT con `audience` y `scope` explícitos
- refresh token rotation y revocación
- cookies `HttpOnly`, `Secure`, `SameSite`
- rate limiting por IP, actor y endpoint sensible
- QR firmados o resolubles con token no secuencial
- secretos fuera del repo
- cifrado de PII en reposo si aplica
- validación estricta de entrada
- CORS por allow-list
- auditoría de accesos administrativos
- idempotency keys para webhooks e importaciones
- revisión de permisos a nivel branch y tenant

## Roadmap técnico por fases

### Fase 1. Fundación transaccional

- tenancy y jerarquía tenant/brand/branch/table/qr
- identidad staff
- perfil anónimo y sesiones QR
- catálogo, draft, publicación
- disponibilidad operativa
- auditoría base

### Fase 2. Experiencia inteligente

- recomendación inicial híbrida y explicable
- feedback de recomendación
- historial de sesión
- realtime para disponibilidad y publicación
- analítica operativa básica

### Fase 3. Comercial y retención

- cuentas consumidor
- merge anónimo a cuenta
- wallet, puntos, niveles y redemptions
- campañas simples por segmento o evento
- ingestión de ventas y consumo

### Fase 4. Escala SaaS

- billing y entitlements
- onboarding workflows
- benchmarking de cadenas
- POS connectors
- endurecimiento de observabilidad, performance y seguridad

## Recomendación técnica final

### Qué arquitectura tomaría hoy

`Spring Boot modular monolith`, con `shared-schema multitenancy`, `Redis`, `outbox interno`, `SSE para consumer-web` y `fronteras API por audiencia`.

### Qué decisión evitaría desde el inicio

Separar el sistema en microservicios o separar `models/repositories/services` por audiencia. Ambas decisiones romperían el dominio demasiado pronto.

### Qué parte diseñaría con más cuidado

La relación entre:

- carta publicada
- disponibilidad operacional
- recomendación
- venta/consumo

Ese es el corazón económico del producto. Si esos cuatro elementos no quedan bien separados y bien conectados, el sistema pierde valor real.

### Qué dejaría desacoplado desde el principio aunque siga dentro del monolito

- motor de recomendación
- integraciones POS/inventario
- notificaciones
- pipeline analítico
- billing/subscriptions

Todos deben vivir dentro del mismo deploy hoy, pero detrás de puertos, eventos y contratos claros.
