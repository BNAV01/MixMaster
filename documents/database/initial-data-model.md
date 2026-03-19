# Modelo de Datos Inicial

Este documento queda como resumen ejecutivo del modelo. El blueprint relacional detallado vive en `relational-data-model.md`.

## Dominios principales

- organización SaaS: tenant, brand, branch, table, qr
- identidad: staff_user, role, permission, consumer_account, consumer_profile
- anónimo y sesiones: anonymous_profile, anonymous_session, session_event
- catálogo y menú: product, category, ingredient, tag, menu, menu_version, menu_item
- operación: product_availability, product_state_change
- recomendación: recommendation_request, recommendation_result, recommendation_feedback
- loyalty: loyalty_account, points_ledger, benefit, benefit_redemption
- comercio: sale, sale_item, consumption_record
- gobierno: audit_log, subscription, tenant_setting

## Reglas base

- `tenant_id` obligatorio en tablas tenant-scoped
- historial separado del estado actual
- ventas y eventos son append-only
- menú publicado se trata como snapshot auditable
- el detalle de entidades, campos, índices, restricciones y estrategias analíticas está en `relational-data-model.md`
