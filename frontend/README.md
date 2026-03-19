# Frontend

Frontend oficial del proyecto MixMaster.

## Apps activas

- `consumer-web`: experiencia pública y consumidor, preparada para SSR
- `tenant-console`: operación y gestión del tenant
- `saas-admin`: superadmin SaaS

## Estructura compartida

```text
frontend/
├── consumer-web/
├── tenant-console/
├── saas-admin/
└── libs/
    ├── shared/
    ├── consumer/
    ├── tenant/
    └── platform/
```

## Nota de esta iteración

Las 3 apps existentes se mantienen en sus carpetas actuales para no romper lo ya generado. La estructura `libs/` se introduce desde ahora como base compartida del monorepo lógico del frontend.

