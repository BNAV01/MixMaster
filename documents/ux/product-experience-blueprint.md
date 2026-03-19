# Blueprint de Experiencia de Producto

## Objetivo

Diseñar la experiencia integral de MixMaster para:

- consumidor que entra por QR en mesa o barra
- operación de barra y sala
- gestión de carta, campañas, beneficios y analítica
- operación SaaS de tenants, onboarding y soporte

La UX debe ayudar a decidir rápido qué pedir, sin volver la experiencia lenta, confusa o recargada.

## Principios UX del producto

1. `Decidir rápido antes que explorar todo`.
2. `Valor antes que registro`.
3. `Una decisión importante por pantalla`.
4. `Carta viva, no catálogo infinito`.
5. `Explicaciones breves, no discurso`.
6. `Exploración controlada, no azar`.
7. `Feedback corto, contextual y útil`.
8. `Operación rápida separada de edición estructural`.
9. `Analítica para decidir, no solo para mirar`.
10. `Estética premium nocturna, pero rendimiento primero`.

## Arquitectura de información

## Consumidor

### Capas principales

1. `Entrada`
2. `Contexto y gustos`
3. `Recomendación`
4. `Exploración y afinado`
5. `Carta y maridajes`
6. `Feedback`
7. `Favoritos e historial`
8. `Cuenta y beneficios`

### Navegación mental del consumidor

- entré
- entendí qué hacer
- marqué lo mínimo necesario
- recibí una buena sugerencia
- pude ajustarla
- guardé lo útil si me convenía

## Administración del local

### Capas principales

1. `Operación del turno`
2. `Carta y publicación`
3. `Campañas y loyalty`
4. `Analítica`
5. `Staff y settings`
6. `Vista ejecutiva`

## SaaS admin

### Capas principales

1. `Tenants`
2. `Trials y suscripciones`
3. `Onboarding`
4. `Soporte`
5. `Feature flags`

## Mapa de pantallas del consumidor

## Núcleo del flujo

- `Entrada por QR`
- `Start / objetivo`
- `Gustos y rechazos`
- `Recomendaciones`
- `Explorar o afinar`
- `Detalle de producto`
- `Maridaje`
- `Feedback`
- `Favoritos`
- `Beneficios`
- `Login / Register`
- `Historial`

## Pantallas recomendadas

| Pantalla | Rol en la experiencia |
|---|---|
| `QR Entry` | Resolver contexto y bajar fricción |
| `Experience Start` | Definir intención principal |
| `Preferences Quick Capture` | Recoger el mínimo útil |
| `Recommendations Main` | Presentar top recomendaciones |
| `Recommendation Detail` | Mostrar por qué encaja |
| `Refine Results` | Ajustar la salida |
| `Explore Mode` | Variantes más atrevidas o nuevas |
| `Menu Viewer` | Navegar carta viva sin perder contexto |
| `Pairing Flow` | Sugerir bebida + comida |
| `Feedback Prompt` | Cerrar loop de aprendizaje |
| `Favorites` | Guardar hallazgos |
| `Benefits` | Mostrar valor de crear cuenta |
| `Register After Value` | Conversión a cuenta |
| `History` | Historial y continuidad |

## Mapa de pantallas administrativas

## Tenant / branch ops

- `Dashboard operativo`
- `Disponibilidad rápida`
- `Carta`
- `Borradores`
- `Publicado`
- `Editor de producto`
- `Campañas`
- `Loyalty y beneficios`
- `Analítica`
- `Staff`
- `Settings`
- `Vista ejecutiva multi-sucursal`

## SaaS admin

- `Tenants`
- `Detalle de tenant`
- `Trials`
- `Planes`
- `Suscripciones`
- `Onboarding`
- `Support`
- `Feature flags`

## Flujo ideal del usuario sin cuenta

1. Escanea el QR.
2. Llega a una pantalla de entrada con una promesa clara y un CTA principal.
3. Elige objetivo:
   - `Quiero algo que me guste`
   - `Quiero explorar`
   - `No sé qué pedir`
4. Marca gustos y rechazos en menos de 20 segundos.
5. Recibe 3 recomendaciones principales con explicación corta.
6. Puede:
   - aceptar una
   - afinar
   - abrir maridaje
   - ir a modo exploración
7. Después del valor, se le invita a:
   - guardar favoritos
   - desbloquear beneficios
   - crear cuenta
8. El feedback aparece solo si ya interactuó con una recomendación.

## Flujo ideal del usuario con cuenta

1. Entra por QR.
2. El sistema reconoce cuenta y perfil del tenant si corresponde.
3. Se salta parte del onboarding si ya conoce gustos previos.
4. Recibe recomendaciones:
   - personalizadas por historial
   - compatibles con beneficios activos
   - adaptadas a la sucursal actual
5. Puede guardar, volver a pedir, explorar nuevas categorías o ver beneficios.
6. El feedback mejora su perfil y puede premiarse con puntos.

## Flujo de creación de cuenta después de recibir valor

## Momento correcto

No pedir cuenta en la entrada. Pedirla después de que ocurra uno de estos eventos:

- quiso guardar favorito
- quiso ver historial
- quiso reclamar beneficio
- ya recibió una recomendación útil
- está en segunda visita anónima

## Flujo recomendado

1. Usuario toca `Guardar favorito` o `Ver beneficios`.
2. Se abre una hoja ligera, no un bloqueo abrupto.
3. Mensaje:
   - qué gana
   - qué se conserva
   - que no perderá lo que ya hizo
4. Login o registro en 1 paso si es posible.
5. Confirmación explícita:
   - `Guardamos esta visita en tu cuenta`
6. Se ejecuta merge de historial en segundo plano.
7. El usuario vuelve al mismo punto del flujo.

## Flujo de feedback

## Objetivo

Recoger señal útil sin fatiga y sin convertir la experiencia en encuesta.

## Mejor momento para pedir feedback

Pedir feedback solo después de una señal de valor:

- el usuario abrió una recomendación
- guardó o aceptó una recomendación
- pasó un tiempo razonable en el resultado
- volvió a la pantalla luego de consumir o decidir

## Momento a evitar

- antes de mostrar resultados
- inmediatamente al entrar
- en cada scroll
- más de una vez por bloque de decisión

## Flujo ideal

1. Prompt corto al pie o como bottom sheet liviano.
2. Pregunta:
   - `¿Te acertamos?`
3. Opciones:
   - `Sí`
   - `Más o menos`
   - `No`
4. Si responde `Más o menos` o `No`, se despliegan ajustes rápidos:
   - `Más dulce`
   - `Menos dulce`
   - `Más suave`
   - `Más intenso`
   - `Más parecido a lo mío`
   - `Más atrevido`
5. Se agradece y se cierra sin fricción.

## Cómo evitar fatiga

- máximo un prompt claro por ciclo de recomendación
- usar quick actions en lugar de texto libre por defecto
- si el usuario ignora 2 veces, espaciar futuros prompts
- premiar feedback solo cuando aporta valor y no de forma compulsiva

## Flujo de modo exploración

## Cuándo ofrecerlo

- como alternativa desde el inicio
- como rama después de ver una recomendación segura
- como ajuste cuando el usuario dice `Más atrevido`

## Lógica UX

1. Mostrar separación clara entre:
   - `Seguro para ti`
   - `Para explorar`
2. Mantener ancla de familiaridad:
   - “se parece a esto que te gusta, pero con…”
3. No mostrar solo rarezas; mostrar un gradiente de exploración.

## Flujo recomendado

1. Usuario recibe recomendación segura.
2. Toca `Explorar más`.
3. Ve una pantalla con 3 capas:
   - `Cerca de lo tuyo`
   - `Un paso más allá`
   - `Más experimental`
4. Puede volver a modo seguro sin sentir que perdió progreso.

## Flujo de maridaje bebida + comida

## Principio

El maridaje debe sentirse como ayuda contextual, no como venta agresiva.

## Flujo

1. Usuario abre una bebida o una comida.
2. Ve un bloque breve:
   - `Combina bien con`
3. Se muestran 2 o 3 opciones relevantes con:
   - foto
   - nombre
   - precio
   - razón corta
4. CTA:
   - `Ver maridaje`
   - `Agregar este combo a mis opciones`

## Cuándo mostrarlo

- después de seleccionar una bebida
- en resultados principales si el objetivo es “algo para comer también”
- en exploración cuando hay oportunidad de subir ticket

## Flujo de beneficios y fidelización

## Sin cuenta

Mostrar valor, no una wallet vacía.

Mensajes útiles:

- `Crea tu cuenta y guarda esta visita`
- `Desbloquea puntos y beneficios desde hoy`

## Con cuenta

Mostrar:

- puntos actuales
- progreso al siguiente nivel
- beneficios activos
- próximos beneficios por desbloquear

## Flujo

1. Usuario ve resumen de beneficios.
2. Entiende qué ya ganó y qué le falta.
3. Puede ver reglas simples:
   - visitas
   - consumo
   - feedback
   - descubrimiento
4. Puede canjear o guardar para después.

## Flujo de favoritos

## Sin cuenta

- permitir favorito temporal
- explicar que puede guardarlo definitivamente con cuenta

## Con cuenta

- favorito persistente
- clasificado por:
  - bebidas
  - comida
  - últimas elecciones

## Flujo

1. Usuario toca corazón o guardar.
2. Si no tiene cuenta:
   - guardar en sesión
   - invitar a persistirlo luego
3. Si tiene cuenta:
   - feedback inmediato de guardado
   - opción de ver historial relacionado

## Flujo de edición de carta

## Principio

Editar carta estructural no es lo mismo que operar disponibilidad.

## Flujo ideal

1. Entrar a `Carta`.
2. Ver separación clara:
   - `Borradores`
   - `Publicado`
3. Abrir un borrador.
4. Ver estructura lateral:
   - secciones
   - subsecciones
   - ítems
5. Editar producto con panel lateral o modal grande.
6. Validaciones visibles en contexto.
7. Comparar con publicación actual.
8. Publicar con resumen de cambios.

## Errores a evitar

- mezclar agotados con edición estructural
- esconder validaciones hasta el final
- forzar scroll infinito para editar toda la carta

## Flujo de disponibilidad rápida

## Principio

Debe poder resolverse en segundos durante el turno.

## Flujo

1. Operador entra a `Disponibilidad`.
2. Ve lista filtrable por:
   - agotados
   - activos
   - categoría
   - sección
3. Cada ítem tiene acción directa:
   - `Agotar`
   - `Pausar`
   - `Reactivar`
4. El cambio confirma visualmente sin sacar al operador de la lista.
5. Si afecta recomendaciones activas, el sistema lo resuelve detrás.

## Flujo de campañas

1. Entrar a `Campañas`.
2. Ver campañas activas, programadas y finalizadas.
3. Crear campaña desde plantillas:
   - happy hour
   - beneficio por visita
   - empuje de categoría
   - recuperación de cliente
4. Configurar:
   - objetivo
   - audiencia
   - sucursales
   - vigencia
   - incentivo
5. Vista previa de impacto esperado y elegibilidad.
6. Publicar o programar.

## Flujo de lectura de analítica por el local

## Principio

Analítica debe responder:

- qué está funcionando
- qué corregir hoy
- dónde hay oportunidad comercial

## Flujo

1. Entrar a `Dashboard`.
2. Ver KPIs principales primero:
   - scans
   - recomendaciones aceptadas
   - ticket promedio
   - productos agotados
   - feedback
3. Bajar a módulos:
   - carta
   - recomendaciones
   - ventas
   - loyalty
4. Aplicar filtros por:
   - sucursal
   - fecha
   - categoría
   - turno
5. Pasar a acciones:
   - revisar producto
   - ajustar campaña
   - pausar ítem
   - reforzar categoría

## Diseño de experiencia del consumidor por etapas

## 1. Entrada desde QR

### Objetivo UX

Confirmar contexto y promesa de valor en segundos.

### Qué debe verse

- nombre del local o sucursal
- mensaje simple
- CTA principal
- CTA secundario a carta o experiencia

### Microcopy sugerido

- `Descubre qué pedir`
- `Te recomendamos algo que encaje contigo y con este momento`
- CTA: `Empezar`
- Secundario: `Ver carta primero`

## 2. Selección de objetivo

### Objetivo UX

Permitir elegir intención sin formulario largo.

### Opciones sugeridas

- `Quiero algo que me guste`
- `Quiero explorar`
- `No sé qué pedir`
- `Quiero algo sin alcohol`
- `Quiero algo para acompañar comida`

### Microcopy

- `¿Qué te gustaría hoy?`
- `Elige una ruta. Puedes cambiar después.`

## 3. Captura rápida de gustos, rechazos y contexto

### Qué preguntar

- gustos
- rechazos
- intensidad
- alcohol sí/no
- momento o mood

### Cómo hacerlo

- chips
- sliders cortos
- toggles
- máximo 1 pantalla principal, con afinado opcional

### Microcopy

- `Marquemos rápido lo tuyo`
- `Elige lo que sí te gusta`
- `Y lo que prefieres evitar`

## 4. Resultado principal

### Qué debe contener

- top 3 recomendaciones
- explicación corta
- precio
- rasgos clave
- disponibilidad visible
- CTA claro

### Jerarquía

1. mejor recomendación
2. dos alternativas
3. CTA de explorar o afinar

## 5. Afinar o regenerar

### Acciones

- `Más parecido a esto`
- `Algo más suave`
- `Algo más intenso`
- `Algo más atrevido`
- `Mostrar otra opción`

## 6. Explicación de recomendación

### Regla UX

Explicación de 1 línea, no párrafo.

### Ejemplos

- `Te puede gustar porque es cítrico, fresco y menos dulce.`
- `Encaja con lo que marcaste: suave, frutal y fácil de tomar.`
- `Si quieres explorar, esta es una versión más intensa de lo que te gusta.`

## 7. Acción para guardar perfil o crear cuenta

### Momento adecuado

Después de recibir una recomendación útil o al guardar favorito.

### Mensaje

- `Guarda esta visita y sigue sumando beneficios`
- `Crea tu cuenta y conserva tus favoritos`

## 8. Solicitud de feedback

### Forma correcta

- breve
- contextual
- sin interrumpir

### Microcopy

- `¿Te acertamos?`
- `Ayúdanos a ajustar mejor lo próximo`

## 9. Beneficios o favoritos

### Qué mostrar

- favoritos guardados
- puntos si existe cuenta
- incentivo claro si no existe cuenta

## Sistema visual conceptual

## Personalidad visual

- premium nocturno
- contemporáneo
- cálido
- sensorial
- ágil

## Sensación que debe transmitir

- confianza en la elección
- sofisticación sin rigidez
- curiosidad guiada
- ritmo rápido

## Referencia conceptual

- barra elegante
- carta editorial moderna
- mobile commerce sobrio
- panel operativo claro, sin ornamentación excesiva

## Jerarquía visual

1. decisión principal del momento
2. recomendación principal
3. opciones secundarias
4. contexto, detalles y explicaciones

## Uso de imágenes

- imágenes de alta calidad para productos estrella
- no depender de foto para todos los ítems
- foto + rasgos + precio debe funcionar incluso si una imagen falta

## Uso de chips o tags

Usar chips para:

- sabor
- intensidad
- con alcohol / sin alcohol
- spicy / cítrico / dulce / herbal / refrescante

Deben ser:

- cortos
- legibles
- consistentes en color y semántica

## Cómo mostrar compatibilidad o puntuación

No usar un número frío como único recurso.

Mejor:

- `Muy para ti`
- `Bastante para ti`
- `Para explorar`

Y acompañar con:

- una barra corta
- un badge semántico

## Cómo mostrar beneficios

- tarjetas claras
- recompensa primero
- condición después
- vencimiento visible

## Cómo mostrar disponibilidad o agotados

- `Agotado por ahora`
- `Vuelve pronto`
- sugerencia inmediata de alternativa

Nunca simplemente ocultar el producto sin contexto si ya estaba visible o recomendado.

## Cómo mostrar exploración vs recomendación segura

- bloques visuales distintos
- `Seguro para ti`
- `Para salir de lo mismo`

La exploración debe sentirse más editorial y menos “score-driven”.

## Microcopy crítico

## Entrada

- `Descubre qué pedir`
- `Te guiamos según tus gustos y este momento`
- CTA: `Empezar`

## Captura de gustos

- `Elige rápido lo que sí te gusta`
- `Y lo que prefieres evitar`
- `Puedes ajustar después`

## Modo exploración

- `Probemos algo fuera de lo habitual`
- `Cerca de lo que te gusta, pero con un giro`

## Explicación de recomendación

- `Te puede gustar porque...`
- `Encaja con lo que marcaste`

## Invitación a crear cuenta

- `Guarda esta visita y tus favoritos`
- `Desbloquea beneficios desde ahora`

## Beneficios

- `Ya vas avanzando`
- `Te faltan 2 visitas para desbloquear tu próximo beneficio`

## Feedback

- `¿Te acertamos?`
- `Con esto afinamos tu próxima recomendación`

## Favoritos

- `Guardado para la próxima`
- `Crea tu cuenta para no perderlo`

## Productos agotados

- `Agotado por ahora`
- `Te recomendamos este parecido`

## Campañas o promos

- `Solo hoy`
- `Ideal para empezar`
- `Activa en esta sucursal`

## Panel operativo de barra y sala

### Tarea principal

Resolver rápido lo que pasa durante el servicio.

### Decisiones que ayuda a tomar

- qué producto pausar o agotar
- qué sugerir como reemplazo
- qué alertas requieren atención

### Qué debe verse primero

- productos agotados
- pausados
- recomendados más vistos
- alertas del turno

### Acciones rápidas

- agotar
- reactivar
- pausar
- ver sustituto
- cambiar sucursal o barra

### Errores UX a evitar

- tablas densas e ilegibles en operación
- demasiados pasos para pausar un producto
- esconder cambios de estado detrás de modales largos

## Panel de edición de carta

### Tarea principal

Editar borradores y publicar cambios estructurales con seguridad.

### Decisiones que ayuda a tomar

- qué cambiar en la estructura
- qué publicar
- qué dejar como draft

### Qué debe verse primero

- borrador activo
- estado de validación
- fecha de última publicación
- resumen de cambios

### Acciones rápidas

- crear borrador
- duplicar
- validar
- comparar con publicado
- publicar

### Errores UX a evitar

- mezclar publicación con cambios operativos
- no mostrar qué está publicado hoy
- esconder errores de validación

## Panel de analítica

### Tarea principal

Entender rendimiento comercial y de experiencia.

### Decisiones que ayuda a tomar

- qué productos impulsar
- qué recomendaciones mejorar
- qué sucursal necesita atención
- qué campañas mantener o cortar

### Qué debe verse primero

- KPIs principales
- deltas vs periodo anterior
- alertas e insights

### Acciones rápidas

- cambiar filtros
- abrir detalle
- exportar
- comparar sucursales

### Errores UX a evitar

- dashboards saturados
- muchas métricas sin narrativa
- no conectar dato con acción

## Panel de campañas

### Tarea principal

Crear, activar y monitorear incentivos.

### Decisiones que ayuda a tomar

- qué audiencia activar
- qué beneficio conviene usar
- qué campaña está funcionando

### Qué debe verse primero

- campañas activas
- próximas a vencer
- mejor y peor desempeño

### Acciones rápidas

- duplicar campaña
- pausar
- reactivar
- ajustar vigencia

### Errores UX a evitar

- constructores complejos desde cero
- reglas difíciles de leer
- no mostrar alcance real de la campaña

## Panel ejecutivo multi-sucursal

### Tarea principal

Comparar rendimiento entre sucursales y priorizar decisiones.

### Decisiones que ayuda a tomar

- dónde intervenir primero
- qué sucursal replica buenas prácticas
- qué categoría empujar por ubicación

### Qué debe verse primero

- ranking por sucursal
- principales variaciones
- top oportunidades

### Acciones rápidas

- cambiar métrica
- comparar 2 sucursales
- abrir detalle por branch

### Errores UX a evitar

- esconder diferencias importantes en tablas inmensas
- no contextualizar benchmarks
- obligar a navegar demasiado para llegar al dato útil

## Wireflow textual del flujo principal del consumidor

1. `QR Entry`
2. `Experience Start`
3. `Preferences Quick Capture`
4. `Recommendations Main`
5. `Recommendation Detail`
6. bifurcación:
   - `Refine Results`
   - `Explore Mode`
   - `Pairing`
7. `Feedback Prompt`
8. bifurcación:
   - `Favorites`
   - `Benefits`
   - `Register After Value`
9. `History / Account Continuity`

## Wireflow textual del flujo de edición de carta

1. `Admin Dashboard`
2. `Carta`
3. `Borradores`
4. `Abrir draft`
5. `Estructura de secciones`
6. `Editar ítem o producto`
7. `Validación`
8. `Comparar con publicado`
9. `Publicar`
10. `Confirmación + estado publicado`

## Wireflow textual del flujo de cambio de disponibilidad

1. `Dashboard operativo`
2. `Disponibilidad`
3. `Filtrar producto`
4. `Acción rápida: Agotar / Pausar / Reactivar`
5. `Confirmación inline`
6. `Alternativa sugerida`
7. `Estado actualizado en lista`

## Pantallas mínimas del MVP

## Consumidor

- `QR Entry`
- `Start`
- `Preferences`
- `Recommendations`
- `Explore`
- `Feedback`
- `Favorites`
- `Login / Register`

## Tenant

- `Dashboard`
- `Carta`
- `Draft editor`
- `Published view`
- `Disponibilidad`
- `Analítica inicial`
- `Campañas básicas`
- `Loyalty básica`

## SaaS

- `Tenants`
- `Trials`
- `Plans`
- `Subscriptions`
- `Onboarding`

## Mejoras UX para fases futuras

1. continuidad cross-device del consumidor
2. asistentes de onboarding adaptativos según historial
3. comparador editorial entre productos
4. recomendaciones por clima, horario o evento
5. tablero colaborativo en tiempo real para barra
6. modos de staff assist en mesa
7. experiencias premium para cadenas y marcas
8. personalización visual por tenant manteniendo sistema base

## Recomendación final

La UX correcta para MixMaster no es la de una carta QR extensa ni la de un asistente invasivo. Debe sentirse como un `decision companion` premium:

- entra rápido
- entiende rápido
- recomienda rápido
- ajusta rápido
- aprende sin molestar

Y del lado del local, debe separar con claridad:

- `operar el turno`
- `editar la carta`
- `activar beneficios o campañas`
- `leer la analítica para decidir`
