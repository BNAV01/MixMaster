# Modelo Relacional Detallado

## Objetivo

Definir el modelo de datos relacional base para MixMaster como plataforma SaaS multitenant para bares, restobares y locales con barra, cubriendo:

- organización SaaS
- carta viva y publicación
- productos, ingredientes, tags y maridajes
- disponibilidad y precios
- consumidores anónimos y registrados
- recomendaciones y feedback
- campañas, beneficios y puntos
- ventas, consumo y visitas
- seguridad, auditoría y suscripciones
- capa analítica para dashboards

## Principios de diseño

1. `shared-schema multitenant` desde el inicio.
2. Todas las tablas tenant-scoped llevan `tenant_id`.
3. Las entidades configurables usan `soft delete` o `status`; los hechos históricos no se borran.
4. `menu_version` publicado es un snapshot inmutable y auditable.
5. `product_availability` y `product_price_history` viven fuera del master de producto.
6. Ventas, ledger, auditoría, eventos de menú y stock son `append-only`.
7. El modelo debe permitir operar una sola sucursal o una cadena.
8. La cuenta del consumidor puede ser global, pero su perfil operativo y loyalty se resuelven por tenant.

## Convenciones recomendadas

### Claves primarias

- `id` como PK surrogate.
- Preferencia: `UUIDv7` o equivalente ordenable.
- En motores sin soporte nativo eficiente, almacenar UUID como `BINARY(16)` o formato optimizado.

### Convenciones de columnas

- `created_at`, `updated_at`, `deleted_at`
- `created_by`, `updated_by`, `deleted_by` cuando aplique
- `status` para entidades configurables
- `metadata_json` para extensibilidad controlada
- montos monetarios como `amount + currency_code`

### Nombres físicos sugeridos

- usar `venue_table` en vez de `table`
- usar `customer_order` en vez de `order`

### Tipos lógicos frecuentes

- `uuid`
- `varchar`
- `decimal(12,2)` para dinero
- `decimal(5,2)` para porcentajes
- `json` para metadata y payloads controlados
- `timestamp with timezone` o equivalente

## Vista general por dominios

| Dominio | Entidades principales |
|---|---|
| Organización SaaS | `tenant`, `brand`, `branch`, `venue_table`, `qr_code`, `tenant_setting`, `trial_account`, `subscription_plan`, `subscription` |
| Catálogo y carta | `menu`, `menu_version`, `menu_section`, `menu_subsection`, `menu_item`, `product`, `product_category`, `product_subcategory`, `ingredient`, `product_ingredient`, `tag`, `product_tag`, `pairing`, `product_price_history`, `menu_publish_event` |
| Operación | `product_availability`, `product_state_change`, `stock_event`, `visit` |
| Consumidor y sesión | `consumer_account`, `consumer_profile`, `consumer_preference`, `consumer_dislike`, `anonymous_profile`, `anonymous_session`, `session_event`, `device_context`, `favorite`, `anonymous_profile_merge` |
| Recomendación y feedback | `recommendation_request`, `recommendation_result`, `recommendation_result_item`, `recommendation_feedback` |
| Loyalty y campañas | `loyalty_account`, `loyalty_level`, `loyalty_points_ledger`, `benefit`, `benefit_rule`, `benefit_grant`, `benefit_redemption`, `campaign`, `promotion`, `notification` |
| Comercio | `customer_order`, `order_item`, `sale`, `sale_item`, `consumption_record` |
| Seguridad y gobierno | `staff_user`, `role`, `permission`, `role_permission`, `staff_role_assignment`, `audit_log` |

## Entidades por dominio

## 1. Organización SaaS

| Entidad | Propósito | Campos más importantes | Relaciones clave |
|---|---|---|---|
| `tenant` | Límite comercial y técnico del cliente SaaS | `id`, `slug`, `legal_name`, `display_name`, `status`, `default_currency_code`, `timezone`, `country_code` | 1:N con `brand`, `branch`, `tenant_setting`, `subscription` |
| `brand` | Marca dentro del tenant; habilita herencia de carta y configuración | `id`, `tenant_id`, `code`, `slug`, `name`, `status` | N:1 con `tenant`; 1:N con `branch`, `menu`, `product` |
| `branch` | Sucursal física u operación concreta | `id`, `tenant_id`, `brand_id`, `code`, `slug`, `name`, `timezone`, `address`, `status` | N:1 con `tenant` y `brand`; 1:N con `venue_table`, `qr_code`, `sale`, `product_availability` |
| `venue_table` | Mesa, barra o spot físico de consumo | `id`, `tenant_id`, `branch_id`, `code`, `label`, `zone_name`, `status`, `capacity` | N:1 con `branch`; 1:N con `qr_code`, `visit`, `anonymous_session` |
| `qr_code` | Punto de entrada a experiencia QR | `id`, `tenant_id`, `branch_id`, `venue_table_id`, `token`, `status`, `entry_mode`, `last_scanned_at` | N:1 con `branch` y `venue_table`; 1:N con `anonymous_session`, `visit` |
| `tenant_setting` | Configuración operativa y de producto del tenant | `id`, `tenant_id`, `setting_key`, `setting_value_json`, `scope_type`, `scope_ref_id`, `is_secret` | N:1 con `tenant`; scope opcional a brand o branch |
| `trial_account` | Registro de trial o pre-onboarding | `id`, `tenant_id`, `contact_name`, `contact_email`, `company_name`, `trial_status`, `trial_starts_at`, `trial_ends_at` | 1:1 u 1:N con `tenant` según estrategia comercial |
| `subscription_plan` | Catálogo de planes SaaS | `id`, `code`, `name`, `billing_period`, `price_amount`, `currency_code`, `status`, `entitlements_json` | 1:N con `subscription` |
| `subscription` | Suscripción activa o histórica del tenant | `id`, `tenant_id`, `subscription_plan_id`, `status`, `starts_at`, `renews_at`, `ends_at`, `billing_provider`, `external_ref` | N:1 con `tenant` y `subscription_plan` |

## 2. Catálogo y carta

| Entidad | Propósito | Campos más importantes | Relaciones clave |
|---|---|---|---|
| `menu` | Contenedor lógico de carta | `id`, `tenant_id`, `brand_id`, `branch_id`, `scope_type`, `code`, `name`, `menu_kind`, `status` | 1:N con `menu_version` |
| `menu_version` | Versión draft o publicada de una carta | `id`, `tenant_id`, `menu_id`, `version_number`, `version_status`, `based_on_version_id`, `published_at`, `effective_from`, `checksum` | N:1 con `menu`; 1:N con `menu_section`, `menu_subsection`, `menu_item`, `menu_publish_event` |
| `menu_section` | Sección versionada de carta | `id`, `tenant_id`, `menu_version_id`, `name`, `description`, `display_order`, `is_active` | N:1 con `menu_version`; 1:N con `menu_subsection`, `menu_item` |
| `menu_subsection` | Subdivisión versionada de sección | `id`, `tenant_id`, `menu_version_id`, `menu_section_id`, `name`, `display_order`, `is_active` | N:1 con `menu_version` y `menu_section`; 1:N con `menu_item` |
| `menu_item` | Ítem versionado de carta que expone un producto en una posición concreta | `id`, `tenant_id`, `menu_version_id`, `product_id`, `menu_section_id`, `menu_subsection_id`, `display_name`, `display_order`, `visibility_mode`, `price_amount`, `is_featured` | N:1 con `menu_version`, `product`, `menu_section`, `menu_subsection` |
| `product` | Master de producto de bebida o comida | `id`, `tenant_id`, `brand_id`, `scope_type`, `scope_branch_id`, `category_id`, `subcategory_id`, `name`, `product_kind`, `status`, `visibility_mode` | 1:N con `menu_item`, `product_ingredient`, `product_tag`, `pairing`, `product_price_history`, `product_availability` |
| `product_category` | Categoría principal de producto | `id`, `tenant_id`, `code`, `name`, `display_order`, `is_active` | 1:N con `product` y `product_subcategory` |
| `product_subcategory` | Subcategoría de producto | `id`, `tenant_id`, `product_category_id`, `code`, `name`, `display_order`, `is_active` | N:1 con `product_category`; 1:N con `product` |
| `ingredient` | Ingrediente reusable | `id`, `tenant_id`, `code`, `name`, `ingredient_type`, `allergen_flags_json`, `is_alcoholic`, `is_active` | 1:N con `product_ingredient` |
| `product_ingredient` | Relación producto-ingrediente | `id`, `tenant_id`, `product_id`, `ingredient_id`, `quantity_label`, `is_primary`, `display_order` | N:1 con `product` y `ingredient` |
| `tag` | Etiquetas de sabor, ocasión, restricción o estilo | `id`, `tenant_id`, `tag_group`, `code`, `label`, `is_active` | 1:N con `product_tag`, `consumer_preference`, `consumer_dislike` |
| `product_tag` | Relación producto-tag | `id`, `tenant_id`, `product_id`, `tag_id`, `weight`, `source_type` | N:1 con `product` y `tag` |
| `pairing` | Recomendación de maridaje entre productos | `id`, `tenant_id`, `source_product_id`, `target_product_id`, `pairing_type`, `strength_score`, `notes` | N:1 con `product` en ambos lados |
| `product_price_history` | Historial de precios por scope y vigencia | `id`, `tenant_id`, `product_id`, `branch_id`, `menu_id`, `currency_code`, `price_amount`, `valid_from`, `valid_to`, `change_reason` | N:1 con `product`; branch opcional |
| `menu_publish_event` | Hecho de publicación o rollback de menú | `id`, `tenant_id`, `menu_id`, `menu_version_id`, `event_type`, `published_by_staff_user_id`, `published_at`, `notes` | N:1 con `menu` y `menu_version` |

## 3. Operación

| Entidad | Propósito | Campos más importantes | Relaciones clave |
|---|---|---|---|
| `product_availability` | Estado operativo vigente por branch y producto | `id`, `tenant_id`, `branch_id`, `product_id`, `state`, `reason_code`, `source_type`, `effective_from`, `effective_to` | N:1 con `branch` y `product`; 1:N con `product_state_change`, `stock_event` |
| `product_state_change` | Historial de cambios operativos de disponibilidad | `id`, `tenant_id`, `branch_id`, `product_id`, `from_state`, `to_state`, `changed_by_staff_user_id`, `changed_at`, `reason_code` | N:1 con `product` y `branch` |
| `stock_event` | Señal operacional vinculada a stock o agotado | `id`, `tenant_id`, `branch_id`, `product_id`, `event_type`, `quantity_delta`, `source_type`, `occurred_at` | N:1 con `product` y `branch` |
| `visit` | Visita consolidada del consumidor a una sucursal | `id`, `tenant_id`, `branch_id`, `venue_table_id`, `qr_code_id`, `anonymous_session_id`, `consumer_account_id`, `anonymous_profile_id`, `started_at`, `ended_at`, `visit_status` | N:1 con `branch`; opcional con `anonymous_session`, `consumer_account`, `anonymous_profile` |

## 4. Consumidor y sesión

| Entidad | Propósito | Campos más importantes | Relaciones clave |
|---|---|---|---|
| `consumer_account` | Identidad autenticable del consumidor | `id`, `email`, `normalized_email`, `password_hash`, `auth_provider`, `account_status`, `email_verified_at`, `created_at` | 1:N con `consumer_profile`, `favorite`, `anonymous_profile_merge`, `sale`, `consumption_record` |
| `consumer_profile` | Perfil persistente del consumidor por tenant | `id`, `tenant_id`, `consumer_account_id`, `display_name`, `birth_month`, `birth_day`, `preferred_locale`, `marketing_opt_in`, `status` | N:1 con `consumer_account`; 1:N con `consumer_preference`, `consumer_dislike` |
| `consumer_preference` | Preferencias explícitas o inferidas de un perfil | `id`, `tenant_id`, `consumer_profile_id`, `preference_type`, `tag_id`, `product_category_id`, `product_id`, `strength_score`, `source_type` | N:1 con `consumer_profile`; FK opcionales a tag/category/product |
| `consumer_dislike` | Rechazos explícitos o inferidos | `id`, `tenant_id`, `consumer_profile_id`, `dislike_type`, `tag_id`, `ingredient_id`, `product_id`, `severity`, `source_type` | N:1 con `consumer_profile`; FK opcionales a tag/ingredient/product |
| `anonymous_profile` | Identidad seudónima persistible sin cuenta | `id`, `tenant_id`, `pseudonymous_key`, `status`, `first_seen_at`, `last_seen_at`, `preferred_locale`, `exploration_level`, `consented_persistence` | 1:N con `anonymous_session`; puede terminar en `anonymous_profile_merge` |
| `anonymous_session` | Sesión concreta iniciada desde QR | `id`, `tenant_id`, `branch_id`, `venue_table_id`, `qr_code_id`, `anonymous_profile_id`, `device_context_id`, `session_status`, `started_at`, `ended_at` | N:1 con `branch`, `qr_code`, `anonymous_profile`, `device_context`; 1:N con `session_event`, `recommendation_request` |
| `session_event` | Log operacional de la sesión | `id`, `tenant_id`, `anonymous_session_id`, `event_type`, `occurred_at`, `payload_json` | N:1 con `anonymous_session` |
| `device_context` | Huella técnica del dispositivo o navegador | `id`, `tenant_id`, `device_fingerprint_hash`, `user_agent_hash`, `platform`, `browser`, `os`, `locale`, `timezone`, `first_seen_at` | 1:N con `anonymous_session`; opcional con `anonymous_profile` |
| `favorite` | Favoritos persistentes del consumidor | `id`, `tenant_id`, `consumer_account_id`, `product_id`, `source_type`, `created_at` | N:1 con `consumer_account` y `product` |
| `anonymous_profile_merge` | Trazabilidad del merge de anónimo a cuenta | `id`, `tenant_id`, `anonymous_profile_id`, `consumer_account_id`, `merge_status`, `merged_at`, `merged_by_actor_type`, `notes` | N:1 con `anonymous_profile` y `consumer_account` |

## 5. Recomendación y feedback

| Entidad | Propósito | Campos más importantes | Relaciones clave |
|---|---|---|---|
| `recommendation_request` | Captura de la intención y contexto usado para recomendar | `id`, `tenant_id`, `branch_id`, `anonymous_session_id`, `consumer_account_id`, `anonymous_profile_id`, `menu_version_id`, `request_source`, `context_json`, `requested_at` | N:1 con `anonymous_session`, `consumer_account`, `anonymous_profile`, `menu_version` |
| `recommendation_result` | Respuesta generada por el motor para una request | `id`, `tenant_id`, `recommendation_request_id`, `anonymous_session_id`, `algorithm_key`, `algorithm_version`, `result_status`, `generated_at`, `explanation_json` | N:1 con `recommendation_request`; 1:N con `recommendation_result_item`, `recommendation_feedback` |
| `recommendation_result_item` | Cada producto rankeado dentro del resultado | `id`, `tenant_id`, `recommendation_result_id`, `product_id`, `menu_item_id`, `rank_position`, `score`, `reason_codes_json`, `was_clicked`, `was_accepted` | N:1 con `recommendation_result`, `product`, `menu_item` |
| `recommendation_feedback` | Feedback del consumidor sobre la recomendación | `id`, `tenant_id`, `recommendation_result_id`, `recommendation_result_item_id`, `anonymous_session_id`, `consumer_account_id`, `anonymous_profile_id`, `feedback_score`, `feedback_label`, `submitted_at` | N:1 con `recommendation_result`; opcional con sesión o cuenta |

## 6. Loyalty y campañas

| Entidad | Propósito | Campos más importantes | Relaciones clave |
|---|---|---|---|
| `loyalty_account` | Wallet de fidelización por tenant | `id`, `tenant_id`, `consumer_account_id`, `current_level_id`, `account_status`, `points_balance`, `lifetime_points`, `last_activity_at` | N:1 con `consumer_account`; 1:N con `loyalty_points_ledger`, `benefit_grant`, `benefit_redemption` |
| `loyalty_level` | Nivel de fidelización del tenant | `id`, `tenant_id`, `code`, `name`, `rank_order`, `min_points`, `min_visits`, `benefits_summary_json`, `is_active` | 1:N con `loyalty_account` |
| `loyalty_points_ledger` | Ledger append-only de puntos | `id`, `tenant_id`, `loyalty_account_id`, `entry_type`, `points_delta`, `balance_after`, `source_type`, `source_ref_id`, `occurred_at` | N:1 con `loyalty_account` |
| `benefit` | Definición de beneficio o recompensa | `id`, `tenant_id`, `code`, `name`, `benefit_type`, `reward_value_amount`, `currency_code`, `cost_points`, `status`, `is_public` | 1:N con `benefit_rule`, `benefit_grant`, `benefit_redemption` |
| `benefit_rule` | Regla de elegibilidad y otorgamiento | `id`, `tenant_id`, `benefit_id`, `trigger_type`, `conditions_json`, `grant_mode`, `valid_from`, `valid_to`, `is_active` | N:1 con `benefit` |
| `benefit_grant` | Instancia otorgada de un beneficio | `id`, `tenant_id`, `benefit_id`, `loyalty_account_id`, `granted_from_rule_id`, `grant_status`, `granted_at`, `expires_at`, `source_ref_id` | N:1 con `benefit`, `benefit_rule`, `loyalty_account` |
| `benefit_redemption` | Redención efectiva de un beneficio | `id`, `tenant_id`, `benefit_grant_id`, `benefit_id`, `loyalty_account_id`, `branch_id`, `sale_id`, `redeemed_at`, `redemption_status` | N:1 con `benefit_grant`, `benefit`, `loyalty_account`, `sale` |
| `campaign` | Campaña comercial o de retención | `id`, `tenant_id`, `brand_id`, `branch_id`, `scope_type`, `name`, `campaign_type`, `status`, `starts_at`, `ends_at`, `targeting_json` | 1:N con `promotion`, opcional con brand/branch |
| `promotion` | Regla promocional concreta dentro de una campaña | `id`, `tenant_id`, `campaign_id`, `promotion_type`, `promotion_value`, `conditions_json`, `priority`, `stackable`, `status` | N:1 con `campaign` |
| `notification` | Registro de mensajes enviados o programados | `id`, `tenant_id`, `consumer_account_id`, `anonymous_profile_id`, `channel`, `notification_type`, `status`, `scheduled_at`, `sent_at` | N:1 con `consumer_account` o `anonymous_profile` |

## 7. Comercio

| Entidad | Propósito | Campos más importantes | Relaciones clave |
|---|---|---|---|
| `customer_order` | Pedido transaccional si se habilita orden directa | `id`, `tenant_id`, `branch_id`, `anonymous_session_id`, `consumer_account_id`, `order_status`, `placed_at`, `currency_code`, `gross_total` | 1:N con `order_item`; N:1 con `branch` |
| `order_item` | Línea de pedido | `id`, `tenant_id`, `customer_order_id`, `product_id`, `quantity`, `unit_price`, `line_total`, `notes` | N:1 con `customer_order` y `product` |
| `sale` | Venta proveniente de POS, importación o captura manual | `id`, `tenant_id`, `branch_id`, `external_sale_ref`, `sale_source`, `sale_status`, `occurred_at`, `currency_code`, `gross_total`, `discount_total`, `net_total`, `tax_total` | 1:N con `sale_item`, `benefit_redemption`, `consumption_record`; opcional con `customer_order` |
| `sale_item` | Línea de venta | `id`, `tenant_id`, `sale_id`, `product_id`, `menu_item_id`, `item_name_snapshot`, `quantity`, `unit_price`, `gross_line_total`, `discount_line_total`, `net_line_total` | N:1 con `sale`; opcional con `product` y `menu_item` |
| `consumption_record` | Hecho de consumo atribuido a sesión, cuenta o anónimo | `id`, `tenant_id`, `branch_id`, `sale_id`, `sale_item_id`, `anonymous_session_id`, `consumer_account_id`, `anonymous_profile_id`, `recommendation_result_item_id`, `consumed_at` | N:1 con `sale`, `sale_item`, `anonymous_session`, `consumer_account`, `anonymous_profile`, `recommendation_result_item` |

## 8. Seguridad y gobierno

| Entidad | Propósito | Campos más importantes | Relaciones clave |
|---|---|---|---|
| `staff_user` | Usuario interno de operación o administración | `id`, `tenant_id`, `email`, `normalized_email`, `display_name`, `staff_status`, `password_hash`, `last_login_at` | 1:N con `staff_role_assignment`, `audit_log`, `menu_publish_event`, `product_state_change` |
| `role` | Rol reusable del sistema o tenant | `id`, `tenant_id`, `code`, `name`, `role_scope`, `is_system_role`, `status` | 1:N con `staff_role_assignment`; N:M con `permission` vía `role_permission` |
| `permission` | Permiso atómico | `id`, `code`, `name`, `resource_type`, `action`, `is_system_permission` | N:M con `role` |
| `role_permission` | Mapeo entre rol y permiso | `id`, `role_id`, `permission_id`, `granted_at` | N:1 con `role` y `permission` |
| `staff_role_assignment` | Asignación de rol por scope | `id`, `tenant_id`, `staff_user_id`, `role_id`, `scope_type`, `scope_ref_id`, `assigned_at`, `revoked_at`, `is_active` | N:1 con `staff_user` y `role` |
| `audit_log` | Auditoría funcional y técnica append-only | `id`, `tenant_id`, `branch_id`, `actor_type`, `actor_id`, `action`, `entity_type`, `entity_id`, `request_id`, `correlation_id`, `before_json`, `after_json`, `occurred_at` | Referencias lógicas a casi todo el modelo |

## Relaciones y cardinalidades principales

| Relación | Cardinalidad | Observaciones |
|---|---|---|
| `tenant -> brand` | 1:N | Una cadena puede tener varias marcas |
| `tenant -> branch` | 1:N | Sucursales siempre tenant-scoped |
| `branch -> venue_table` | 1:N | Una sucursal tiene muchas mesas o puntos de barra |
| `venue_table -> qr_code` | 1:N | Se puede reemitir QR o tener varios por mesa |
| `menu -> menu_version` | 1:N | Varias versiones draft/publicadas/archivadas |
| `menu_version -> menu_section` | 1:N | La estructura pertenece a la versión |
| `menu_section -> menu_subsection` | 1:N | Puede ser opcional |
| `menu_version -> menu_item` | 1:N | Snapshot completo de lo visible |
| `product_category -> product_subcategory` | 1:N | Normalización simple |
| `product -> product_ingredient` | 1:N | N:M con `ingredient` |
| `product -> product_tag` | 1:N | N:M con `tag` |
| `product -> pairing` | 1:N | Múltiples maridajes origen/destino |
| `product -> product_price_history` | 1:N | Historial temporal |
| `branch + product -> product_availability` | 1:N histórico / 1:1 vigente | Mantener un registro vigente y varios históricos |
| `anonymous_profile -> anonymous_session` | 1:N | Un perfil anónimo puede volver varias veces |
| `anonymous_session -> session_event` | 1:N | Log de interacción |
| `consumer_account -> consumer_profile` | 1:N | Un perfil por tenant; idealmente único por tenant |
| `consumer_profile -> consumer_preference` | 1:N | Preferencias persistentes |
| `consumer_profile -> consumer_dislike` | 1:N | Rechazos persistentes |
| `recommendation_request -> recommendation_result` | 1:N | Permite retries o variantes |
| `recommendation_result -> recommendation_result_item` | 1:N | Ranking de productos |
| `recommendation_result -> recommendation_feedback` | 1:N | Puede haber varios feedbacks por item/resultado |
| `consumer_account -> loyalty_account` | 1:N | En práctica único por tenant |
| `benefit -> benefit_rule` | 1:N | Varias reglas pueden otorgar el mismo beneficio |
| `benefit -> benefit_grant` | 1:N | Grants instanciados por consumidor |
| `benefit_grant -> benefit_redemption` | 1:N | Un grant puede permitir una o varias redenciones según tipo |
| `sale -> sale_item` | 1:N | Venta con detalle de líneas |
| `sale_item -> consumption_record` | 1:N | Atribución de consumo por experiencia |
| `role -> permission` | N:M | Mediante `role_permission` |
| `staff_user -> staff_role_assignment` | 1:N | Varios roles por scope |

## Claves primarias, foráneas e integridad por tenant

## PK sugeridas

- `UUIDv7` para tablas maestras, operativas y append-only.
- En tablas analíticas agregadas usar PK compuestas por fecha y dimensión principal cuando sea más eficiente.

## Reglas de FK

1. Toda tabla tenant-scoped debe tener `tenant_id`.
2. Las FKs deben incluir `tenant_id` cuando el parent también sea tenant-scoped.
3. Ejemplo recomendado:
   - `product (tenant_id, id)` unique
   - `menu_item (tenant_id, product_id)` FK -> `product (tenant_id, id)`
4. Para relaciones branch-scoped, incluir además `branch_id` si la pertenencia es obligatoria.

## Beneficio de las FKs compuestas

- refuerzan aislamiento por tenant
- evitan relaciones cruzadas accidentales
- facilitan validaciones de scope en consultas complejas

## Índices importantes

## Organización

- `tenant(slug)` unique
- `brand(tenant_id, slug)` unique
- `branch(tenant_id, code)` unique
- `branch(tenant_id, slug)` unique
- `venue_table(branch_id, code)` unique
- `qr_code(token)` unique
- `qr_code(branch_id, venue_table_id, status)`

## Carta y catálogo

- `menu(tenant_id, scope_type, brand_id, branch_id, status)`
- `menu_version(menu_id, version_number)` unique
- `menu_version(tenant_id, menu_id, version_status, published_at desc)`
- `menu_section(menu_version_id, display_order)`
- `menu_subsection(menu_section_id, display_order)`
- `menu_item(menu_version_id, menu_section_id, menu_subsection_id, display_order)`
- `product(tenant_id, category_id, subcategory_id, status)`
- `product(tenant_id, name)`
- `product_price_history(tenant_id, product_id, branch_id, valid_from desc)`
- `product_tag(tenant_id, tag_id, product_id)`
- `pairing(tenant_id, source_product_id, target_product_id)` unique

## Operación

- `product_availability(tenant_id, branch_id, product_id, effective_from desc)`
- índice parcial o equivalente para disponibilidad vigente por `state` y `effective_to is null`
- `product_state_change(tenant_id, branch_id, product_id, changed_at desc)`
- `stock_event(tenant_id, branch_id, product_id, occurred_at desc)`

## Consumidor y sesión

- `consumer_account(normalized_email)` unique
- `consumer_profile(tenant_id, consumer_account_id)` unique
- `consumer_preference(tenant_id, consumer_profile_id, preference_type)`
- `consumer_dislike(tenant_id, consumer_profile_id, dislike_type)`
- `anonymous_profile(tenant_id, pseudonymous_key)` unique
- `anonymous_profile(tenant_id, last_seen_at desc)`
- `anonymous_session(tenant_id, branch_id, qr_code_id, started_at desc)`
- `anonymous_session(anonymous_profile_id, started_at desc)`
- `session_event(anonymous_session_id, occurred_at desc)`
- `favorite(tenant_id, consumer_account_id, product_id)` unique
- `anonymous_profile_merge(tenant_id, anonymous_profile_id, consumer_account_id)` unique

## Recomendación y feedback

- `recommendation_request(tenant_id, branch_id, requested_at desc)`
- `recommendation_request(anonymous_session_id, requested_at desc)`
- `recommendation_result(recommendation_request_id, generated_at desc)`
- `recommendation_result_item(recommendation_result_id, rank_position)` unique
- `recommendation_result_item(tenant_id, product_id, rank_position, recommendation_result_id)`
- `recommendation_feedback(tenant_id, recommendation_result_item_id, submitted_at desc)`

## Loyalty y campañas

- `loyalty_account(tenant_id, consumer_account_id)` unique
- `loyalty_points_ledger(loyalty_account_id, occurred_at desc)`
- `benefit(tenant_id, code)` unique
- `benefit_rule(tenant_id, benefit_id, is_active, valid_from, valid_to)`
- `benefit_grant(tenant_id, loyalty_account_id, grant_status, expires_at)`
- `benefit_redemption(tenant_id, benefit_grant_id, redeemed_at desc)`
- `campaign(tenant_id, status, starts_at, ends_at)`
- `promotion(tenant_id, campaign_id, priority)`
- `notification(tenant_id, status, scheduled_at)`

## Comercio

- `customer_order(tenant_id, branch_id, placed_at desc)`
- `sale(tenant_id, branch_id, occurred_at desc)`
- `sale(tenant_id, external_sale_ref)` unique cuando la fuente lo garantice
- `sale_item(sale_id)`
- `consumption_record(tenant_id, branch_id, consumed_at desc)`
- `consumption_record(recommendation_result_item_id)`

## Seguridad y auditoría

- `staff_user(tenant_id, normalized_email)` unique
- `role(tenant_id, code)` unique
- `permission(code)` unique
- `role_permission(role_id, permission_id)` unique
- `staff_role_assignment(tenant_id, staff_user_id, role_id, scope_type, scope_ref_id, is_active)`
- `audit_log(tenant_id, occurred_at desc)`
- `audit_log(request_id)`
- `audit_log(entity_type, entity_id, occurred_at desc)`

## Restricciones importantes

1. `menu_version.version_status` en `DRAFT`, `PUBLISHED`, `ARCHIVED`, `ROLLED_BACK`.
2. Solo una versión publicada activa por `menu + scope + ventana temporal`.
3. `menu_item` solo puede apuntar a productos activos.
4. En `favorite`, `consumer_account_id + product_id + tenant_id` debe ser único.
5. En `recommendation_feedback`, debe existir `recommendation_result_id` y preferiblemente `recommendation_result_item_id`.
6. En tablas con actor dual:
   - exactamente uno de `consumer_account_id` o `anonymous_profile_id`
   - aplica a `recommendation_request`, `recommendation_feedback`, `visit`, `consumption_record`
7. `valid_to > valid_from` en precios, campañas y grants.
8. `sale_item.quantity > 0`.
9. `recommendation_result_item.rank_position >= 1`.
10. `benefit_redemption` no puede existir sin `benefit_grant` vigente salvo beneficios instantáneos explícitamente configurados.

## Estrategia de auditoría

## Capas

1. `created_at/updated_at` en tablas maestras.
2. `audit_log` append-only para eventos funcionales.
3. `menu_publish_event`, `product_state_change`, `loyalty_points_ledger` y similares como historia especializada.

## Audit log sugerido

`audit_log` debe registrar:

- `tenant_id`, `branch_id`
- `actor_type`
- `actor_id`
- `action`
- `entity_type`
- `entity_id`
- `request_id`
- `correlation_id`
- `before_json`
- `after_json`
- `metadata_json`
- `occurred_at`

## Qué no usar solo con audit_log

No usar `audit_log` como sustituto de:

- historial de precios
- historial de disponibilidad
- ledger de puntos
- publicación de menú

Esas historias necesitan tablas propias consultables y con integridad funcional.

## Estrategia de soft delete

## Usar soft delete en

- `tenant`
- `brand`
- `branch`
- `venue_table`
- `qr_code`
- `menu`
- `product`
- `ingredient`
- `tag`
- `campaign`
- `promotion`
- `benefit`
- `staff_user`

## No usar soft delete en

- `menu_version`
- `menu_section`
- `menu_subsection`
- `menu_item`
- `product_price_history`
- `product_state_change`
- `stock_event`
- `anonymous_session`
- `session_event`
- `recommendation_*`
- `loyalty_points_ledger`
- `benefit_grant`
- `benefit_redemption`
- `sale`
- `sale_item`
- `consumption_record`
- `audit_log`

En estas tablas se prefiere `append-only`, `status` o archivado.

## Estrategia multitenant

## Regla general

- `tenant_id` obligatorio en toda tabla tenant-scoped.
- `brand_id` y `branch_id` aparecen donde el alcance lo requiere.
- `consumer_account` y `subscription_plan` pueden ser globales.
- `consumer_profile` y `loyalty_account` son tenant-scoped.

## Herencia tenant / brand / branch

La herencia de carta base se resuelve con:

- `menu.scope_type` = `TENANT`, `BRAND` o `BRANCH`
- `menu.brand_id` nullable
- `menu.branch_id` nullable

La resolución efectiva sigue este orden:

1. carta de branch si existe
2. carta de brand
3. carta base de tenant

## Estrategia para historial de precios y estados

## Precios

La fuente de verdad del historial es `product_price_history`.

Campos clave:

- `product_id`
- `branch_id` nullable
- `menu_id` nullable
- `price_amount`
- `currency_code`
- `valid_from`
- `valid_to`

### Regla

- no sobrescribir precio histórico
- insertar nuevo registro al cambiar precio
- cerrar el vigente con `valid_to`
- `menu_item.price_amount` guarda el precio snapshot publicado

## Estados

La fuente de verdad operativa es `product_availability`.

La trazabilidad es `product_state_change`.

Estados sugeridos:

- `AVAILABLE`
- `LOW_STOCK`
- `PAUSED`
- `OUT_OF_STOCK`
- `HIDDEN`

## Estrategia para draft y publicación de carta

## Modelo

- `menu` = definición lógica
- `menu_version` = versión
- `menu_section`, `menu_subsection`, `menu_item` = snapshot estructural por versión

## Flujo

1. se crea o edita una `menu_version` en estado `DRAFT`
2. se editan secciones, subsecciones e ítems
3. al publicar:
   - la versión cambia a `PUBLISHED`
   - queda `published_at`
   - se registra `menu_publish_event`
4. la disponibilidad opera por fuera de la versión
5. rollback = nueva publicación basada en una versión previa o marcado `ROLLED_BACK`

## Estrategia para sesiones anónimas

## Modelo mínimo

- `anonymous_profile`
- `anonymous_session`
- `device_context`
- `session_event`

## Motivo

Separar perfil de sesión permite:

- persistencia técnica sin cuenta
- historial de múltiples visitas
- merge posterior a cuenta
- analítica de recurrencia anónima

## Estrategia para fusión de perfil anónimo a cuenta

Agregar `anonymous_profile_merge` como tabla explícita.

### Qué registra

- perfil anónimo origen
- cuenta destino
- estado del merge
- timestamp
- actor que lo ejecutó
- notas o metadata

### Qué se fusiona

- historial de sesiones y visitas
- favoritos elegibles
- señales de preferencia derivadas
- feedback histórico

### Qué no se borra

- las filas origen
- la trazabilidad de sesiones
- los registros ya usados en analítica

## Estrategia para guardar feedback

## Tablas involucradas

- `recommendation_request`
- `recommendation_result`
- `recommendation_result_item`
- `recommendation_feedback`

## Principio

El feedback debe apuntar, idealmente, a un ítem concreto recomendado y no solo al request general.

## Tipos de feedback sugeridos

- `ACCURATE`
- `NOT_FOR_ME`
- `ALREADY_KNEW_IT`
- `TOO_EXPENSIVE`
- `WRONG_CONTEXT`
- `CONSUMED_AND_LIKED`
- `CONSUMED_AND_DISLIKED`

## Estrategia para ventas y consumo

## Separación necesaria

- `sale` = hecho comercial
- `consumption_record` = hecho de atribución y uso

## Por qué no fusionarlos

- puede haber venta sin attribution completa a recomendación
- puede haber consumo registrado antes de integración POS completa
- la analítica necesita distinguir intención, compra y consumo

## Estrategia

- `sale` y `sale_item` vienen de POS, carga manual o integración
- `consumption_record` vincula venta/sale_item con:
  - sesión
  - anónimo o cuenta
  - recomendación aceptada

## Estrategia para beneficios y ledger de puntos

## Ledger

`loyalty_points_ledger` es append-only.

Cada fila debe incluir:

- `entry_type`
- `points_delta`
- `balance_after`
- `source_type`
- `source_ref_id`
- `occurred_at`

## Beneficios

Separar:

- `benefit` definición
- `benefit_rule` elegibilidad
- `benefit_grant` beneficio otorgado
- `benefit_redemption` uso del beneficio

Esto permite:

- recompensas por visitas
- recompensas por consumo
- recompensas por feedback
- expiración
- antifraude

## Integridad para no recomendar agotados o no publicados

## Fuente recomendada para recomendar

No consultar `product` directamente como catálogo libre.

El motor debe leer una vista o read model efectivo construido a partir de:

- `menu_version` publicada
- `menu_item`
- `product`
- `product_availability` vigente

## Regla efectiva

Un producto es elegible solo si:

1. existe en una `menu_version` `PUBLISHED`
2. el `menu_item.visibility_mode` lo permite
3. el `product.status` está activo
4. la disponibilidad vigente en `product_availability` no está en `OUT_OF_STOCK`, `PAUSED` o `HIDDEN`
5. el precio vigente existe o el snapshot lo resuelve

## Recomendación práctica

Mantener una vista lógica o tabla de lectura como `effective_menu_item_current` con:

- `tenant_id`
- `branch_id`
- `menu_version_id`
- `menu_item_id`
- `product_id`
- `effective_price_amount`
- `effective_availability_state`
- `is_recommendable`

## Campos clave para entidades críticas

## `product`

| Campo | Tipo lógico | Notas |
|---|---|---|
| `id` | uuid | PK |
| `tenant_id` | uuid | FK a `tenant` |
| `brand_id` | uuid nullable | FK opcional a `brand` |
| `scope_type` | enum | `TENANT`, `BRAND`, `BRANCH` |
| `scope_branch_id` | uuid nullable | FK opcional a `branch` |
| `category_id` | uuid | FK a `product_category` |
| `subcategory_id` | uuid nullable | FK a `product_subcategory` |
| `sku` | varchar nullable | identificador interno del local |
| `slug` | varchar | único por tenant y scope |
| `name` | varchar | nombre comercial |
| `short_description` | varchar nullable | resumen corto |
| `long_description` | text nullable | descripción ampliada |
| `product_kind` | enum | cocktail, mocktail, food, etc. |
| `alcohol_level` | decimal nullable | intensidad o ABV resumido |
| `abv_percentage` | decimal nullable | opcional si se requiere precisión |
| `default_price_amount` | decimal nullable | opcional, no fuente de verdad final |
| `image_url` | varchar nullable | imagen principal |
| `is_featured` | boolean | destaque editorial |
| `is_active` | boolean | activo/inactivo |
| `visibility_mode` | enum | public, hidden, staff_only |
| `metadata_json` | json nullable | atributos extensibles |
| `created_at` | timestamp | auditoría |
| `updated_at` | timestamp | auditoría |
| `deleted_at` | timestamp nullable | soft delete |

## `anonymous_profile`

| Campo | Tipo lógico | Notas |
|---|---|---|
| `id` | uuid | PK |
| `tenant_id` | uuid | FK a `tenant` |
| `pseudonymous_key` | varchar | identificador técnico persistible |
| `status` | enum | active, merged, expired |
| `device_context_id` | uuid nullable | último contexto conocido |
| `preferred_locale` | varchar nullable | idioma preferido |
| `exploration_level` | enum nullable | safe, balanced, exploratory |
| `preference_snapshot_json` | json nullable | snapshot resumido de gustos |
| `dislike_snapshot_json` | json nullable | snapshot resumido de rechazos |
| `consented_persistence` | boolean | persistencia anónima autorizada |
| `first_seen_at` | timestamp | primera visita |
| `last_seen_at` | timestamp | última actividad |
| `merged_to_consumer_account_id` | uuid nullable | si terminó mergeado |
| `created_at` | timestamp | auditoría |
| `updated_at` | timestamp | auditoría |

## `anonymous_session`

| Campo | Tipo lógico | Notas |
|---|---|---|
| `id` | uuid | PK |
| `tenant_id` | uuid | FK a `tenant` |
| `branch_id` | uuid | FK a `branch` |
| `venue_table_id` | uuid nullable | FK a `venue_table` |
| `qr_code_id` | uuid | FK a `qr_code` |
| `anonymous_profile_id` | uuid | FK a `anonymous_profile` |
| `device_context_id` | uuid nullable | FK a `device_context` |
| `session_status` | enum | active, idle, closed, expired |
| `entry_channel` | enum | table_qr, bar_qr, direct_link |
| `party_size` | integer nullable | contexto social |
| `started_at` | timestamp | inicio |
| `ended_at` | timestamp nullable | cierre |
| `last_activity_at` | timestamp | heartbeat |
| `context_json` | json nullable | tono, ocasión, restricciones temporales |
| `created_at` | timestamp | auditoría |

## `recommendation_request`

| Campo | Tipo lógico | Notas |
|---|---|---|
| `id` | uuid | PK |
| `tenant_id` | uuid | FK a `tenant` |
| `branch_id` | uuid | FK a `branch` |
| `anonymous_session_id` | uuid nullable | FK a `anonymous_session` |
| `consumer_account_id` | uuid nullable | FK a `consumer_account` |
| `anonymous_profile_id` | uuid nullable | FK a `anonymous_profile` |
| `menu_version_id` | uuid | snapshot usado |
| `request_source` | enum | initial, refine, pairing, retry |
| `goal_type` | enum nullable | discover, repeat, pair, alcohol_free |
| `preferences_json` | json nullable | gustos expresados en el momento |
| `dislikes_json` | json nullable | rechazos del momento |
| `context_json` | json nullable | ocasión, clima, budget, etc. |
| `requested_at` | timestamp | momento del request |
| `correlation_id` | varchar nullable | correlación técnica |

## `recommendation_result`

| Campo | Tipo lógico | Notas |
|---|---|---|
| `id` | uuid | PK |
| `tenant_id` | uuid | FK a `tenant` |
| `recommendation_request_id` | uuid | FK a `recommendation_request` |
| `anonymous_session_id` | uuid nullable | redundancia útil para query |
| `algorithm_key` | varchar | motor usado |
| `algorithm_version` | varchar | versión del ranking |
| `result_status` | enum | generated, served, expired |
| `safe_mode_count` | integer | cantidad de opciones seguras |
| `exploratory_count` | integer | cantidad de opciones exploratorias |
| `explanation_json` | json nullable | explicación general |
| `generated_at` | timestamp | generación |
| `served_at` | timestamp nullable | entrega al cliente |

## `recommendation_feedback`

| Campo | Tipo lógico | Notas |
|---|---|---|
| `id` | uuid | PK |
| `tenant_id` | uuid | FK a `tenant` |
| `recommendation_result_id` | uuid | FK a `recommendation_result` |
| `recommendation_result_item_id` | uuid nullable | item específico |
| `anonymous_session_id` | uuid nullable | contexto |
| `consumer_account_id` | uuid nullable | contexto |
| `anonymous_profile_id` | uuid nullable | contexto |
| `consumption_record_id` | uuid nullable | cierre de loop |
| `feedback_score` | smallint | escala corta, por ejemplo 1-5 |
| `feedback_label` | enum | accurate, not_for_me, etc. |
| `free_text` | text nullable | comentario opcional |
| `submitted_at` | timestamp | momento de envío |

## `consumer_account`

| Campo | Tipo lógico | Notas |
|---|---|---|
| `id` | uuid | PK |
| `email` | varchar | correo original |
| `normalized_email` | varchar | unique |
| `password_hash` | varchar nullable | si usa password local |
| `auth_provider` | enum | local, google, apple, magic_link |
| `account_status` | enum | pending, active, blocked, deleted |
| `email_verified_at` | timestamp nullable | verificación |
| `phone_e164` | varchar nullable | opcional |
| `created_at` | timestamp | alta |
| `updated_at` | timestamp | cambios |
| `last_login_at` | timestamp nullable | último acceso |
| `deleted_at` | timestamp nullable | cierre lógico |

## `consumer_profile`

| Campo | Tipo lógico | Notas |
|---|---|---|
| `id` | uuid | PK |
| `tenant_id` | uuid | FK a `tenant` |
| `consumer_account_id` | uuid | FK a `consumer_account` |
| `display_name` | varchar nullable | nombre visible |
| `birth_month` | smallint nullable | cumpleaños sin sobrecapturar PII |
| `birth_day` | smallint nullable | cumpleaños |
| `preferred_locale` | varchar nullable | idioma |
| `marketing_opt_in` | boolean | consentimiento |
| `favorite_category_id` | uuid nullable | acceso rápido |
| `last_branch_id` | uuid nullable | última sucursal visitada |
| `status` | enum | active, paused, deleted |
| `created_at` | timestamp | alta |
| `updated_at` | timestamp | cambios |

## `loyalty_account`

| Campo | Tipo lógico | Notas |
|---|---|---|
| `id` | uuid | PK |
| `tenant_id` | uuid | FK a `tenant` |
| `consumer_account_id` | uuid | FK a `consumer_account` |
| `current_level_id` | uuid nullable | FK a `loyalty_level` |
| `account_status` | enum | active, suspended, closed |
| `points_balance` | integer | saldo vigente |
| `redeemable_points` | integer | saldo utilizable |
| `lifetime_points` | integer | acumulado histórico |
| `visits_count` | integer | contador útil |
| `last_activity_at` | timestamp nullable | última actividad |
| `created_at` | timestamp | alta |
| `updated_at` | timestamp | cambios |

## `benefit`

| Campo | Tipo lógico | Notas |
|---|---|---|
| `id` | uuid | PK |
| `tenant_id` | uuid | FK a `tenant` |
| `code` | varchar | unique por tenant |
| `name` | varchar | nombre comercial |
| `description` | text nullable | detalle |
| `benefit_type` | enum | free_item, discount, upgrade, access, points_bonus |
| `reward_value_amount` | decimal nullable | monto o cantidad |
| `currency_code` | varchar nullable | si aplica |
| `cost_points` | integer nullable | costo en puntos |
| `reward_payload_json` | json nullable | item gratis, upgrade, etc. |
| `status` | enum | draft, active, paused, archived |
| `is_public` | boolean | visible o no al consumidor |
| `starts_at` | timestamp nullable | vigencia |
| `ends_at` | timestamp nullable | vigencia |
| `created_at` | timestamp | auditoría |
| `updated_at` | timestamp | auditoría |

## `menu_version`

| Campo | Tipo lógico | Notas |
|---|---|---|
| `id` | uuid | PK |
| `tenant_id` | uuid | FK a `tenant` |
| `menu_id` | uuid | FK a `menu` |
| `version_number` | integer | secuencial por menú |
| `version_status` | enum | draft, published, archived, rolled_back |
| `based_on_version_id` | uuid nullable | clonación o branch |
| `title` | varchar nullable | alias interno |
| `change_summary` | text nullable | resumen editorial |
| `published_at` | timestamp nullable | publicación |
| `effective_from` | timestamp nullable | inicio vigencia |
| `effective_to` | timestamp nullable | fin vigencia |
| `rollback_of_version_id` | uuid nullable | si es rollback |
| `checksum` | varchar nullable | consistencia |
| `created_by_staff_user_id` | uuid nullable | autor |
| `created_at` | timestamp | alta |
| `updated_at` | timestamp | cambios |

## `product_availability`

| Campo | Tipo lógico | Notas |
|---|---|---|
| `id` | uuid | PK |
| `tenant_id` | uuid | FK a `tenant` |
| `branch_id` | uuid | FK a `branch` |
| `product_id` | uuid | FK a `product` |
| `state` | enum | available, low_stock, paused, out_of_stock, hidden |
| `reason_code` | varchar nullable | motivo normalizado |
| `reason_text` | varchar nullable | detalle corto |
| `source_type` | enum | manual, pos, inventory, scheduled |
| `effective_from` | timestamp | inicio |
| `effective_to` | timestamp nullable | fin |
| `changed_by_staff_user_id` | uuid nullable | actor |
| `metadata_json` | json nullable | contexto técnico |
| `created_at` | timestamp | alta |
| `updated_at` | timestamp | cambio vigente |

## `sale`

| Campo | Tipo lógico | Notas |
|---|---|---|
| `id` | uuid | PK |
| `tenant_id` | uuid | FK a `tenant` |
| `branch_id` | uuid | FK a `branch` |
| `customer_order_id` | uuid nullable | FK a `customer_order` |
| `external_sale_ref` | varchar nullable | referencia POS |
| `sale_source` | enum | pos, manual, import, web |
| `sale_status` | enum | pending, completed, cancelled, refunded |
| `currency_code` | varchar | moneda |
| `gross_total` | decimal | total bruto |
| `discount_total` | decimal | descuentos |
| `net_total` | decimal | total neto |
| `tax_total` | decimal | impuestos |
| `recommended_flag` | boolean | shortcut analítico |
| `occurred_at` | timestamp | fecha real de venta |
| `imported_at` | timestamp nullable | fecha de ingreso al sistema |
| `consumer_account_id` | uuid nullable | si se logró vincular |
| `anonymous_profile_id` | uuid nullable | si se logró vincular |
| `anonymous_session_id` | uuid nullable | sesión asociada |

## `sale_item`

| Campo | Tipo lógico | Notas |
|---|---|---|
| `id` | uuid | PK |
| `tenant_id` | uuid | FK a `tenant` |
| `sale_id` | uuid | FK a `sale` |
| `product_id` | uuid nullable | FK a `product` si hubo match |
| `menu_item_id` | uuid nullable | snapshot de menú si aplica |
| `item_name_snapshot` | varchar | nombre al momento de venta |
| `item_category_snapshot` | varchar nullable | categoría al momento de venta |
| `quantity` | decimal | cantidad |
| `unit_price` | decimal | precio unitario |
| `gross_line_total` | decimal | total bruto |
| `discount_line_total` | decimal | descuento línea |
| `net_line_total` | decimal | total neto |
| `recommendation_result_item_id` | uuid nullable | atribución directa |
| `created_at` | timestamp | auditoría |

## `audit_log`

| Campo | Tipo lógico | Notas |
|---|---|---|
| `id` | uuid | PK |
| `tenant_id` | uuid nullable | null solo para eventos globales |
| `branch_id` | uuid nullable | scope adicional |
| `actor_type` | enum | staff, consumer, anonymous, system |
| `actor_id` | uuid nullable | actor lógico |
| `action` | varchar | create, update, publish, merge, redeem, etc. |
| `entity_type` | varchar | nombre de entidad |
| `entity_id` | uuid nullable | id del recurso |
| `request_id` | varchar nullable | correlación HTTP |
| `correlation_id` | varchar nullable | correlación de negocio |
| `ip_hash` | varchar nullable | seguridad |
| `user_agent_hash` | varchar nullable | seguridad |
| `before_json` | json nullable | estado previo |
| `after_json` | json nullable | estado posterior |
| `metadata_json` | json nullable | datos extra |
| `occurred_at` | timestamp | momento del hecho |

## Vistas y tablas analíticas recomendadas

## Estrategia general

Dado que el stack actual del repositorio está orientado a base relacional tradicional, conviene separar:

- consultas operativas sobre OLTP
- dashboards sobre tablas agregadas incrementales
- vistas SQL simples para lecturas frecuentes

No haría depender los dashboards principales de joins pesados en tiempo real sobre tablas transaccionales.

## Recomendación por tipo

### Vistas SQL normales

Usarlas para lecturas de estado actual:

- `effective_menu_item_current`
- `current_product_availability`
- `current_loyalty_balance`
- `active_campaign_promotions`

### Tablas agregadas incrementales

Usarlas para dashboards y KPIs:

| Tabla agregada | Grano recomendado | Uso |
|---|---|---|
| `analytics_branch_day` | `tenant_id + branch_id + business_date` | ventas, visitas, scans, conversiones |
| `analytics_product_day` | `tenant_id + branch_id + product_id + business_date` | vistas, recomendaciones, ventas, feedback |
| `analytics_recommendation_day` | `tenant_id + branch_id + business_date + algorithm_key` | precisión, aceptación, CTR |
| `analytics_loyalty_day` | `tenant_id + business_date + level_id` | grants, redemptions, puntos |
| `analytics_hourly_sales` | `tenant_id + branch_id + business_date + hour_slot` | ventas por horario |
| `analytics_anonymous_cohort` | `tenant_id + cohort_date` | recurrencia anónima y conversión |
| `analytics_branch_compare_week` | `tenant_id + branch_id + week_start` | benchmark entre sucursales |

### Materialized views

Solo las recomendaría si el motor final las soporta bien y para casos analíticos puntuales. No las tomaría como mecanismo principal si la base termina siendo MySQL.

## Consultas de negocio que el modelo debe soportar

| Consulta | Tablas principales | Índices clave |
|---|---|---|
| Productos más recomendados por sucursal | `recommendation_result_item`, `recommendation_result`, `recommendation_request` | requests por `branch_id`, items por `product_id` |
| Productos con mejor feedback | `recommendation_feedback`, `recommendation_result_item`, `product` | feedback por `result_item_id`, product |
| Usuarios anónimos recurrentes | `anonymous_profile`, `anonymous_session`, `visit` | profile por `last_seen_at`, session por `profile_id` |
| Conversión de anónimo a cuenta | `anonymous_profile_merge`, `anonymous_profile`, `consumer_account` | merge por `merged_at` |
| Ticket promedio con recomendación | `sale`, `sale_item`, `consumption_record`, `recommendation_result_item` | sale por `occurred_at`, attribution por `result_item_id` |
| Productos muy vistos y poco vendidos | `menu_item` + eventos de sesión + `sale_item` | agregados `analytics_product_day` |
| Maridajes más comprados | `pairing`, `sale_item`, `consumption_record` | pairing por `source_product_id`, sale_item por `sale_id` |
| Beneficios más redimidos | `benefit_redemption`, `benefit`, `branch` | redemption por `benefit_id`, `branch_id` |
| Comparativa entre sucursales | `analytics_branch_day`, `analytics_branch_compare_week` | PK compuestas por periodo |
| Ventas por horario y categoría | `sale`, `sale_item`, `product`, `product_category` | `analytics_hourly_sales`, `analytics_product_day` |

## Recomendación final de implementación

1. Implementar primero tablas maestras de organización, producto, menú, versión, disponibilidad, sesión anónima, recomendación, feedback y venta.
2. Crear desde el inicio `menu_item`, `role_permission`, `benefit_grant` y `anonymous_profile_merge`.
3. Mantener `product_price_history`, `product_state_change`, `loyalty_points_ledger` y `audit_log` como append-only.
4. Construir una vista o read model `effective_menu_item_current` antes de entrenar o productivizar el recomendador.
5. Mover dashboards a tablas agregadas incrementales en vez de resolverlos con SQL pesado sobre OLTP.
