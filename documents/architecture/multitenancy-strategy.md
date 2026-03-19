# Estrategia Multitenant

## Modelo base

- `shared-schema`
- `tenant_id` en toda tabla tenant-scoped
- jerarquía `tenant -> brand -> branch -> table -> qr`

## Principios

- aislamiento lógico fuerte desde el origen
- permisos siempre acotados por tenant y por scope
- consumer account desacoplado del tenant, pero consumer profile tenant-scoped
- publicaciones, disponibilidad, ventas y analítica siempre filtradas por tenant

