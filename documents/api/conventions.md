# Convenciones API

## Audiencias

- `public`: QR, experiencia anónima, carta publicada, recomendaciones, feedback
- `consumer`: cuenta registrada, historial, favoritos, beneficios
- `admin`: tenant, sucursal, operación, campañas, analítica
- `platform`: SaaS admin, tenants, billing, soporte

## Convenciones

- prefijo `/api/v1`
- ids estables y no secuenciales para exposición pública
- `tenant_id` siempre inferido o validado por contexto
- respuestas preparadas para frontend orientado a dominio, no solo CRUD plano

