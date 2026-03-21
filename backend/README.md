# Backend

Backend oficial del proyecto MixMaster.

## Ubicación

```text
backend/mixmaster-backend
```

## Stack

- Spring Boot
- Java 21
- Spring Security
- Spring Data JPA
- Flyway
- MariaDB
- Redis readiness
- Actuator

## Ejecución local

```bash
cd backend/mixmaster-backend
./mvnw spring-boot:run
```

Base de datos local por defecto:

- MariaDB en `localhost:3306`
- base `mixmaster`
- usuario `root`
- password `root`

Si tu MariaDB corre en otro puerto o con otras credenciales, ajusta `DB_URL`, `DB_USERNAME` y `DB_PASSWORD` en [backend/mixmaster-backend/.env](/Volumes/DesktopDock/Repositorios/Laboral/MixMaster/backend/mixmaster-backend/.env).

Perfil local por defecto:

- `tenant@local / tenant-local`
- `portal@local / portal-local`
- `consumer@local / consumer-local`

Pruebas:

```bash
cd backend/mixmaster-backend
./mvnw test
```

## Perfiles

- `local`: perfil por defecto para desarrollo diario
- `dev`: overrides más verbosos de debugging
- `test`: perfil portable para pruebas de contexto sin base de datos real

## Convenciones

- base package oficial: `com.mixmaster.platform`
- monolito modular por dominios con fronteras HTTP separadas por audiencia
- multitenancy `shared-schema` preparada desde el diseño
- configuración consolidada bajo prefijo `mixmaster.*`
- ids core persistidos como `ULID` en `CHAR(26)`
- `Flyway` como fuente de verdad de esquema y `ddl-auto=validate` como estrategia objetivo
- seguridad heredada reutilizada solo donde encaja con MixMaster; se descartó la implementación `cl.mixmaster.bnav01.security` porque dependía de clases inexistentes del proyecto anterior
- servicios de entrada por audiencia en `interfaces/*/services`
- modelos base persistentes en `shared/models` y repositorios base en `shared/repositories`

## Estructura backend

- `interfaces/consumerweb`, `interfaces/tenantconsole`, `interfaces/saasadmin`
  DTOs, controllers, mappers, excepciones, seguridad, servicios de orquestación y utilidades de entrada por audiencia.
- `modules/*`
  núcleo funcional del monolito modular.
- `shared/*`
  concernes transversales como tenant context, seguridad común, auditoría y configuración.

## Seguridad y multitenancy

- `consumer-web`
  endpoints públicos bajo `/api/consumer-web/public/**`
- `consumer-web` autenticado
  endpoints protegidos bajo `/api/consumer-web/account/**`
- `tenant-console`
  endpoints protegidos bajo `/api/tenant-console/**`
- `saas-admin`
  endpoints protegidos bajo `/api/saas-admin/**`
- tenant context
  viaja por headers y se resuelve en `shared/tenant/*`

## Configuración por ambientes

- `application.properties`
  base común del backend
- `application-local.properties`
  perfil por defecto para desarrollo diario
- `application-dev.properties`
  overrides verbosos para debugging
- `application-test.properties`
  arranque portable para tests de contexto
- `application-prod.properties`
  base mínima de producción

## Modelo relacional

- entidades JPA reales del primer corte ya viven en `modules/organization`, `modules/identity/staff`, `modules/consumer/*`, `modules/menu/*`, `modules/availability` y `modules/audit`
- migraciones activas actuales:
  `V1__initial_foundation.sql` a `V5__audit_alignment.sql`
- documentación técnica de este corte:
  `documents/database/backend-relational-foundation.md`

## Validación

- `./mvnw test`
  validación portable del backend sin requerir Docker
- `./mvnw -DskipTests compile`
  validación de compilación del modelo JPA
- validación end-to-end de Flyway + JPA contra MariaDB:
  debe ejecutarse en un entorno con MariaDB accesible o con Docker disponible para Testcontainers
