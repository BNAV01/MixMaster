# Backend Relational Foundation

## Propósito

Este documento fija el primer corte relacional real del backend MixMaster y deja explícita la relación entre:

- entidades JPA
- migraciones Flyway
- convenciones oficiales de datos
- multitenancy `shared-schema`

La meta de esta iteración no fue modelar todo el universo funcional, sino dejar una base consistente para los dominios que destraban el desarrollo posterior.

## Convenciones oficiales de datos

### Identificadores

- `id` de agregados y tablas core:
  `ULID` persistido como `CHAR(26)`
- motivo:
  mantiene orden temporal razonable, es portable entre capas y no depende del motor de base de datos
- excepción prevista a futuro:
  tablas append-only de mucho volumen podrán usar `BIGINT` si el costo operativo lo justifica

### Multitenancy

- estrategia:
  `shared-schema`
- regla:
  toda tabla tenant-scoped usa `tenant_id CHAR(26) NOT NULL`
- `tenant_id` viaja desde HTTP hacia servicios mediante `shared/tenant/*`
- no se delega a Hibernate ninguna magia de partición; la separación queda explícita en el esquema y en el modelo

### Auditoría y timestamps

- tablas operativas:
  `created_at DATETIME(6)`, `updated_at DATETIME(6)`
- tablas append-only:
  `occurred_at` o `merged_at` como timestamp de negocio y `created_at` como timestamp técnico
- el backend usa `OffsetDateTime` en Java y `DATETIME(6)` en MariaDB

### Soft delete

- se aplica en agregados de configuración y catálogo donde interesa preservar referencias históricas:
  `brands`, `branches`, `venue_tables`, `qr_codes`, `roles`, `staff_users`, `product_categories`, `product_subcategories`, `products`, `menus`
- convención:
  `deleted_at DATETIME(6) NULL`
- regla:
  Flyway y JPA preservan la fila; la lógica de repositorio/servicio decidirá luego qué se considera activo

### Nombres

- tablas:
  `snake_case` plural
- columnas:
  `snake_case`
- índices:
  `idx_<tabla>_<proposito>`
- unique constraints:
  `uk_<tabla>_<proposito>`
- foreign keys:
  `fk_<tabla>_<referencia>`

### Enums

- se persisten como `VARCHAR`
- no se usa ordinal
- longitud guía actual:
  `VARCHAR(40)` o `VARCHAR(80)` según el caso

### Fuente de verdad del esquema

- `Flyway` es la fuente oficial del esquema
- `spring.jpa.hibernate.ddl-auto=validate` es la estrategia objetivo para ambientes serios
- no se adopta `update` como mecanismo de evolución del esquema

## Primer corte de entidades creadas

### Organización y SaaS

- `Tenant`
- `Brand`
- `Branch`
- `VenueTable`
- `QrCode`

### Identidad staff

- `Role`
- `Permission`
- `RolePermission`
- `StaffUser`
- `StaffRoleAssignment`

### Consumidor y anónimo

- `ConsumerAccount`
- `ConsumerProfile`
- `DeviceContext`
- `AnonymousProfile`
- `AnonymousSession`
- `AnonymousProfileMerge`

### Catálogo y carta

- `ProductCategory`
- `ProductSubcategory`
- `Product`
- `Menu`
- `MenuVersion`
- `MenuSection`
- `MenuSubsection`
- `MenuItem`
- `ProductAvailability`

### Gobierno

- `AuditLog`

## Bases compartidas aplicadas

- `shared/models/BaseEntity`
  base con `id`, `created_at`, `updated_at` y generación automática de ULID
- `shared/models/TenantScopedEntity`
  base para entidades con `tenant_id`
- `shared/models/TenantScopedSoftDeletableEntity`
  base tenant-scoped con `deleted_at`
- `shared/utils/UlidGenerator`
  generador ULID local para no depender del motor ni de `@GeneratedValue`

## Migraciones Flyway creadas o alineadas

- `V1__initial_foundation.sql`
  fundación inicial heredada ya normalizada en la iteración anterior
- `V2__core_tenant_and_staff_alignment.sql`
  endurece organización, roles y staff
- `V3__consumer_and_anonymous_alignment.sql`
  consolida cuenta consumidor, device context, perfil anónimo, sesión y merge
- `V4__catalog_and_menu_alignment.sql`
  alinea producto, subcategoría, menú, versiones, subsecciones y disponibilidad
- `V5__audit_alignment.sql`
  fortalece `audit_logs`

## Relación JPA <-> esquema

- las entidades nuevas se mapearon con nombres explícitos de tabla y columna
- los enums se mapearon como `EnumType.STRING`
- las relaciones `ManyToOne` se dejaron `LAZY` por defecto
- no se agregaron cascades agresivos por defecto
- `product_availability` usa `@Version` y columna `version`
- `audit_log` y `anonymous_profile_merge` se modelaron como append-only

## Cómo correr migraciones

En un ambiente con MariaDB accesible:

```bash
cd backend/mixmaster-backend
./mvnw spring-boot:run
```

Flyway correrá automáticamente al arrancar la aplicación mientras `spring.flyway.enabled=true`.

## Validación actual

- `./mvnw test`
  sigue siendo una validación portable del backend sin requerir Docker ni base de datos real
- `./mvnw -DskipTests compile`
  valida compilación de entidades y mappings
- validación end-to-end de Flyway + JPA contra MariaDB:
  debe ejecutarse en un entorno con MariaDB local o con Docker disponible para Testcontainers

## Próximo bloque recomendado

- crear repositorios por agregado principal
- introducir `tenant_id` filtering explícito en repositorios/servicios
- modelar `product_state_change`, `product_price_history`, `recommendation_*`, `loyalty_*`, `sale*` y `consumption_record`
- agregar pruebas de integración de esquema cuando el entorno tenga Docker o MariaDB disponible
