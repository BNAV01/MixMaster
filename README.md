# MixMaster Platform

MixMaster es una plataforma SaaS multitenant para bares, restobares y locales con barra. El producto combina carta digital viva, recomendación personalizada de bebidas y comida, perfiles anónimos y registrados, beneficios, campañas, ventas, consumo, feedback y analítica.

La raíz actual del repositorio es la base oficial del proyecto. No existe una carpeta contenedora nueva ni una `MixMaster_v2`.

## Estructura oficial

```text
/
├── backend/
│   └── mixmaster-backend/
├── frontend/
│   ├── consumer-web/
│   ├── tenant-console/
│   └── saas-admin/
├── documents/
│   ├── product/
│   ├── architecture/
│   ├── database/
│   ├── ux/
│   ├── api/
│   └── adr/
├── infra/
├── scripts/
├── images/
├── .github/
├── README.md
└── LICENSE
```

## Alcance del producto

- `consumer-web`: experiencia pública mobile-first para QR, sesión anónima, carta, recomendaciones, exploración, feedback, login, register, beneficios, historial y merge de historial.
- `tenant-console`: operación de sucursal, edición de carta, disponibilidad, campañas, analítica, loyalty, staff y settings.
- `saas-admin`: tenants, trials, planes, suscripciones, onboarding, soporte y feature flags.
- `backend`: monolito modular Spring Boot preparado para multitenancy shared-schema, seguridad base, migraciones, menú, disponibilidad, recomendación, feedback, beneficios, ventas, consumo, auditoría y analítica.

## Stack base

- `Backend`: Spring Boot, Java 21, Spring Security, JPA, Flyway, MySQL, Actuator, Redis, WebSocket/SSE readiness.
- `Frontend`: Angular 21, 3 apps separadas por audiencia, SSR solo para `consumer-web`.
- `Base de datos`: relacional, multitenant shared-schema con `tenant_id`.
- `Documentación`: viva dentro de `documents/`.

## Estado del repositorio

- La base moderna del proyecto vive en `backend/` y `frontend/`.
- El árbol `MixMaster/` se mantiene temporalmente como referencia histórica y no define la estructura oficial de esta nueva base.
- `documents/` se usa como fuente de verdad para visión, arquitectura, datos, UX y ADRs.

## Cómo correr localmente

### Backend

```bash
cd backend/mixmaster-backend
./mvnw spring-boot:run
```

### Consumer Web

```bash
cd frontend/consumer-web
npm install
npm start
```

### Tenant Console

```bash
cd frontend/tenant-console
npm install
npm start
```

### SaaS Admin

```bash
cd frontend/saas-admin
npm install
npm start
```

## Documentación inicial

- [Visión de producto](documents/product/vision.md)
- [Módulos del producto](documents/product/modules.md)
- [Roadmap técnico inicial](documents/product/roadmap-initial.md)
- [Arquitectura inicial](documents/architecture/initial-architecture.md)
- [Arquitectura backend y general](documents/architecture/backend-platform-architecture.md)
- [Convenciones de fundación backend](documents/architecture/backend-foundation-conventions.md)
- [Arquitectura frontend de aplicación](documents/architecture/frontend-application-architecture.md)
- [Modelo de datos inicial](documents/database/initial-data-model.md)
- [Modelo relacional detallado](documents/database/relational-data-model.md)
- [Blueprint de experiencia de producto](documents/ux/product-experience-blueprint.md)
- [Convenciones de API](documents/api/conventions.md)
- [API de alto nivel](documents/api/high-level-api.md)

## Convenciones oficiales de esta base

- No recrear backend ni frontend desde cero.
- La estructura raíz actual es la oficial.
- El backend evoluciona como monolito modular.
- La capa de entrada del backend se separa por audiencia en `interfaces/consumerweb`, `interfaces/tenantconsole` y `interfaces/saasadmin`.
- El núcleo del backend se concentra por dominio en `modules/*` y los concernes transversales en `shared/*`.
- El frontend evoluciona como 3 apps Angular separadas por audiencia.
- La carta es el centro del producto y siempre debe convivir con publicación, disponibilidad, recomendación y analítica.
