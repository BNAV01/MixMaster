# Arquitectura Inicial

## Decisiones base

- `backend`: Spring Boot, monolito modular, Java 21.
- `frontend`: Angular 21 con 3 apps separadas por audiencia.
- `consumer-web`: única app preparada para SSR.
- `database`: relacional, shared-schema con `tenant_id`.
- `integración`: eventos internos y evolución futura a conectores externos, sin microservicios de entrada.

## Backend

El backend se organiza bajo `com.mixmaster.platform` y usa una combinación de:

- `interfaces/<audiencia>` para la capa de entrada
- `modules/<dominio>` para el núcleo del negocio
- `shared/*` para capacidades transversales

La capa `interfaces` contiene:

- `controllers`
- `dtos`
- `mappers`
- `exceptions`
- `security`
- `configs`
- `utils`

Los módulos de dominio concentran el núcleo porque separar `models`, `repositories` y `services` por audiencia fragmentaría demasiado pronto la lógica de negocio. Esa separación se reserva para la frontera API, no para el modelo del sistema.

El backend debe contemplar:

- identidad staff
- cuentas consumidor
- perfiles anónimos
- sesiones
- menú y productos
- disponibilidad
- recomendación
- feedback
- loyalty
- ventas y consumo
- auditoría
- analítica

## Seguridad base

- Seguridad HTTP stateless con Spring Security.
- `consumer-web` puede exponer rutas públicas.
- `tenant-console` y `saas-admin` quedan preparados con límites de acceso propios.
- El perfil `local` usa credenciales bootstrap para acelerar desarrollo sin fijar aún el esquema final de autenticación persistente.
- La base queda preparada para evolucionar hacia auth respaldada por base de datos y tokens, sin arrastrar código heredado de otro producto.

## Frontend

La frontera principal no es técnica, sino de audiencia:

- `consumer-web`
- `tenant-console`
- `saas-admin`

Cada app debe mantener su shell, routing y theming, pero compartir convenciones, componentes base y contratos API.
