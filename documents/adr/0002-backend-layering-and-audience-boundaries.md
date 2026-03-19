# ADR 0002 - Backend por audiencias arriba y dominio abajo

## Estado

Aprobado

## Decisión

El backend mantiene `com.mixmaster.platform` como base package oficial y se organiza con dos cortes complementarios:

- `interfaces/consumerweb`, `interfaces/tenantconsole`, `interfaces/saasadmin`
- `modules/<dominio>`
- `shared/*`

La separación por audiencia se aplica a la capa de entrada:

- controllers
- dtos
- mappers
- exceptions
- security
- configs
- utils

El modelo de dominio, los servicios de negocio y la persistencia permanecen agrupados por módulo porque son capacidades del sistema, no de una sola audiencia.

## Motivo

El usuario pidió una arquitectura por capas visible y además un monolito modular serio desde el inicio.

Separar todo por audiencia, incluyendo `models` y `repositories`, habría introducido duplicidad y un dominio artificialmente partido. En cambio, mover toda la API a carpetas planas por dominio habría ocultado los límites entre `consumer-web`, `tenant-console` y `saas-admin`.

## Consecuencias

- Las rutas, DTOs y reglas de seguridad se vuelven explícitas por audiencia.
- El dominio sigue creciendo de forma coherente dentro de módulos.
- La auditoría, multitenancy y seguridad transversal viven en `shared/*`.
- Plantillas heredadas de otros proyectos no se mantienen dentro de la ruta de código activa si no compilan o no representan el dominio MixMaster.
