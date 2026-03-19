# Backend

Backend oficial del proyecto MixMaster.

## Ubicación

```text
backend/mixmaster-backend
```

## Stack

- Spring Boot
- Java 21
- JPA
- Spring Security
- Flyway
- MySQL
- Actuator

## Ejecución local

```bash
cd backend/mixmaster-backend
./mvnw spring-boot:run
```

Perfil local por defecto:

- `tenant@local / tenant-local`
- `platform@local / platform-local`
- `consumer@local / consumer-local`

Pruebas:

```bash
cd backend/mixmaster-backend
./mvnw test
```

## Perfiles

- `local`: perfil por defecto para desarrollo
- `dev`: overrides más verbosos para desarrollo
- `test`: perfil portable para pruebas de contexto sin depender del entorno local

## Convenciones

- base package oficial: `com.mixmaster.platform`
- monolito modular por dominios
- multitenancy shared-schema preparada desde el diseño
- seguridad base con filtros HTTP, bootstrap users locales y separación por audiencia

## Estructura backend

La estructura combina dos ejes para no mezclar audiencia con dominio:

- `interfaces/consumerweb`, `interfaces/tenantconsole`, `interfaces/saasadmin`:
  controladores, DTOs, mappers, excepciones, seguridad y configuración de entrada.
- `modules/*`:
  núcleo de dominio del monolito modular.
- `shared/*`:
  concernes transversales como tenant context, seguridad común, auditoría y configuración.

Esta decisión reemplaza plantillas heredadas de otro proyecto que estaban en una ruta de código activa, pero no compilaban limpiamente ni respondían al dominio MixMaster.
