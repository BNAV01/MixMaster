# Frontend

Fundacion real del frontend de MixMaster, alineada con el backend multitenant y preparada para seguir creciendo sin reestructuraciones tempranas.

## Apps

- `consumer-web`
  - SSR activa
  - mobile first
  - puerto `4200`
- `tenant-console`
  - SPA
  - desktop first
  - puerto `4201`
- `saas-admin`
  - SPA
  - gestion interna
  - puerto `4202`

## Stack visual oficial

- `Tailwind CSS`
  - layout, spacing, responsive, composicion visual
- `Angular CDK`
  - overlays, focus management, primitives accesibles
- `SCSS`
  - tokens, themes, mixins, base styles, branding futura

No se usa `Angular Material` como framework visual base.

## Monorepo logico

Las apps no se movieron a `apps/` para no romper workspaces Angular ya generados. La consolidacion se hace mediante:

- `frontend/tsconfig.frontend.json`
- `frontend/libs/`
- `frontend/tailwind.preset.cjs`
- `frontend/package.json`

`frontend/package.json` existe para que `apps` y `libs` resuelvan la misma instancia de Angular, RxJS y `tslib`.
El enlace se automatiza con `frontend/scripts/link-shared-deps.mjs` y se ejecuta en `postinstall`, `prestart`, `prebuild`, `prewatch` y `pretest` de cada app.

## Estructura activa

```text
frontend/
├── package.json
├── tailwind.preset.cjs
├── tsconfig.frontend.json
├── consumer-web/
├── tenant-console/
├── saas-admin/
└── libs/
    ├── shared/
    │   ├── api-clients/
    │   ├── auth/
    │   ├── permissions/
    │   ├── realtime/
    │   ├── theming/
    │   ├── ui-core/
    │   ├── ui-overlays/
    │   ├── ui-data-viz/
    │   └── util/
    ├── consumer/
    ├── tenant/
    └── platform/
```

## Implementado en esta iteracion

- theming por app con `consumer`, `tenant-console` y `saas-admin`
- clientes API compartidos por audiencia
- interceptors para auth, tenant context, correlation id y normalizacion de error
- guards y resolvers base
- stores/facades por app con `signals`
- shells y rutas reales por audiencia
- componentes reutilizables compartidos y de dominio
- realtime base con SSE SSR-safe
- `consumer-web` compilando con SSR y lazy routes

## Comandos

Instalacion inicial recomendada:

```bash
cd frontend
npm install
cd consumer-web && npm install
cd ../tenant-console && npm install
cd ../saas-admin && npm install
```

Los scripts de cada app vuelven a enlazar automaticamente `@angular`, `rxjs` y `tslib` al workspace compartido antes de compilar o levantar la aplicacion.

Arranque por app:

```bash
cd frontend/consumer-web && npm start
cd frontend/tenant-console && npm start
cd frontend/saas-admin && npm start
```

Build por app:

```bash
cd frontend/consumer-web && npm run build
cd frontend/tenant-console && npm run build
cd frontend/saas-admin && npm run build
```

Build conjunto desde el workspace:

```bash
cd frontend
npm run build:all
```

## Referencias

- [Blueprint frontend original](../documents/architecture/frontend-application-architecture.md)
- [Fundacion frontend implementada](../documents/architecture/frontend-foundation-implementation.md)
