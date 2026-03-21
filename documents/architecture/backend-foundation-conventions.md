# Backend Foundation Conventions

## Propósito

Este documento deja explícitas las convenciones de implementación aplicadas sobre la base real del backend y cómo se reutilizaron los insumos heredados sin reinicializar el proyecto.

## Convenciones oficiales

- `base package`: `com.mixmaster.platform`
- `estilo`: monolito modular
- `audiencias HTTP`: `interfaces/consumerweb`, `interfaces/tenantconsole`, `interfaces/saasadmin`
- `núcleo funcional`: `modules/*`
- `cross-cutting`: `shared/*`
- `multitenancy`: `shared-schema` con headers de contexto
- `config namespace`: `mixmaster.*`
- `persistencia`: MariaDB + Flyway
- `capas de entrada`: DTOs, controllers, mappers, exceptions, security, services, utils, audit y excels por audiencia

## Cómo conviven capas y audiencias

La separación principal del backend no es por frontend, sino por frontera de entrada.

- `interfaces/*`
  contiene controllers, DTOs, mappers, excepciones, seguridad y packages de expansión por audiencia.
- `modules/*`
  concentra el dominio del producto: identidad, consumer, menú, disponibilidad, recommendation, feedback, loyalty, sales y analytics.
- `shared/*`
  concentra piezas transversales que no deben duplicarse por audiencia: config, tenant context, seguridad común, errores y auditoría base.

Además, la base técnica actual añade:

- `shared/models`
  mapped superclasses y contratos persistentes base.
- `shared/repositories`
  repositorios base tenant-aware.
- `interfaces/*/services`
  capa de orquestación por audiencia para no mezclar controllers con módulos internos.

## Plantillas heredadas reutilizadas

Se reutilizaron y adaptaron piezas de la fundación previa que sí estaban alineadas con MixMaster:

- `ApplicationProperties`
  se mantuvo la idea de configuración tipada bajo `mixmaster.*`.
- `SecurityConfig`
  se reutilizó la lógica de bootstrap users por audiencia y se ajustaron rutas oficiales del producto.
- `WebConfig`
  se mantuvo como base de CORS centralizado.
- `TenantContext`, `TenantContextHolder`, `TenantContextFilter`
  se reutilizaron como base del multitenancy por headers.
- `TenantContextService`
  se agregó como punto oficial para consumir tenant context desde servicios y casos de uso.
- `MaliciousRequestFilter`
  se mantuvo como filtro HTTP simple contra patrones peligrosos.
- `RequestRateLimitFilter`
  se reutilizó y dejó acotado a login, status y operaciones write.
- `shared.audit/*`
  se reutilizó como fundación mínima de auditoría técnica y funcional.
- `application-local.properties` y `application-test.properties`
  se restauraron y adaptaron al proyecto.
- `V1__initial_foundation.sql`
  se rearmó como migración inicial coherente con MixMaster.

## Piezas heredadas descartadas

Se dejaron fuera las piezas que provenían de otro producto o dependían de clases inexistentes en este repositorio:

- paquete `cl.mixmaster.bnav01.security`
  dependía de repositorios, modelos y excepciones que no existen en MixMaster.
- propiedades `MediConnect` y configuración `app.*`
  estaban cargadas de dominios ajenos: emergency, clinic, ambulance, billing externo y portal web de otro sistema.
- datasource PostgreSQL heredado
  no coincidía con el stack actual del backend ni con el soporte Flyway para MariaDB.

## Justificación de la decisión

Duplicar seguridad, auditoría y tenant context por audiencia habría creado tres variantes artificiales del mismo concern técnico.

La mejora aplicada fue:

- mantener separación por audiencia en la frontera API
- mantener centralizadas las piezas transversales en `shared/*`
- dejar paquetes de expansión por audiencia donde haga sentido futuro

## Estado después de la normalización

- el backend vuelve a tener una entrada compilable y coherente
- las rutas base por audiencia existen y responden
- la configuración por ambientes ya no está contaminada con otro dominio
- la fundación para seguridad, auditoría, multitenancy y migraciones volvió a estar activa
- la capa `services` por audiencia ya existe y separa mejor orquestación de controllers
- el backend ya tiene una base para entidades `tenant_id` con `shared/models/TenantScopedEntity`
