# Feature tiers - what to change, and what it is worth (2026-08-13)

> **Superseded 2026-08-14 by [roadmap-2026-08-14.md](roadmap-2026-08-14.md).**
> That one merges these tiers with the ten-platform benchmark, drops the four
> rows that turned out to be already built, and re-prioritises three. Kept here
> for the reasoning behind each decision, including the medication change in
> full at the bottom. Do not plan from this file.

Replaces the 2026-08-10 version, which listed messaging, scheduling,
documents, progress photos, measurements, export and email notifications as
future work. All of those shipped.

Sources: what is actually built (`tasks/todo.md`), what is open
(`next-steps.md`), the target architecture (`docs/00` §3), and the competitive
gaps in [benchmark-2026-08.md](../research/benchmark-2026-08.md).

**How to read the scores.** "Nota actual" is how well the product answers that
need today; "nota final" is where it lands if the change ships as described.
Both are my judgement on a 0-10 scale, not a measurement, and they are only
useful next to each other. Effort: S (under a slice), M (one slice), L (two or
three), XL (epic). Ordering rule (LPEF C2/C6): highest impact per effort
first, compliance floors are not optional.

## Tier 0 - blocked on the owner, or legal floors

Nothing here is a feature. All of it stops something else.

| Cambio | Nota actual | Esfuerzo | Impacto y riesgo | Beneficio tras el cambio | Nota final |
|---|---|---|---|---|---|
| Verificar el dominio de envío en Resend | 3 | S (trámite) | Los recordatorios de dosis y cita se generan pero no llegan a nadie. Riesgo de no hacerlo: la landing promete algo que no ocurre | Todo lo construido alrededor del email empieza a existir de verdad | 9 |
| Datos fiscales reales en Ajustes | 2 | S | Hoy `B00000000` y CP `08000`, elegidos para no colisionar. Salen impresos en cada plan | Documentos que un paciente puede archivar | 9 |
| Revisión legal de privacidad y términos | 4 | S (externo) | Datos de salud, RGPD Art. 9. Riesgo: es el suelo, no una mejora | Poder cobrar sin exposición | 9 |
| Revisión de Verifactu antes de tocar facturación | 0 | M (estudio) | La AEAT exige factura inalterable. Riesgo: dimensionar la facturación sin esto es dimensionarla mal | Saber si es integración o cumplimiento antes de gastar un slice | 7 |
| Ilustraciones de ejercicios (4 de 41) | 3 | S por lote | Sin créditos de Pletor. Las de `imgs/` cubren parte | Catálogo coherente en pantalla y en papel | 7 |

## Tier 1 - ahora (S-M, se nota a diario)

**Aviso sobre esta tabla.** Se escribió desde el benchmark y desde
`tasks/todo.md`, no desde el código, y dos de las cinco filas resultaron estar
ya construidas. Están tachadas abajo con lo que se encontró. La lección, que
va también a `tasks/lessons.md`: una nota de estado se comprueba contra
`src/`, nunca contra un documento de planificación.

| Cambio | Nota actual | Esfuerzo | Impacto y riesgo | Beneficio tras el cambio | Nota final |
|---|---|---|---|---|---|
| **Medicación opcional y compartida por el paciente** (ver abajo) | 4 | M | Hoy la sección existe siempre y el especialista lo ve todo. Afecta a privacidad y a datos ya guardados. Riesgo: migración y el especialista pierde visibilidad que hoy tiene | El paciente decide qué comparte; el 90% que no usa GLP-1 deja de ver una sección que no le toca | 9 |
| ~~Notas clínicas del especialista~~ **ya construido** | 8 | — | Verificado en código el 2026-08-13: `modules/notes/repository`, `addNoteAction` con guard de rol, `note-form.tsx` y la lista con fecha en la ficha. La tabla lo puntuaba con 0 porque se escribió desde el benchmark y desde un `todo.md` desfasado | — | 8 |
| Recorrido con lector de pantalla del calendario y el listbox | 5 | S | Roles, foco y teclado medidos; VoiceOver no. Riesgo: accesibilidad afirmada sin verificar | Poder decir que es accesible con evidencia | 8 |
| ~~Franja donde el listbox se tapa~~ **hecho 2026-08-13** | 9 | S | `max-block-size: min(18rem, 100%)`: con `position-area` la zona libre es el bloque contenedor, así que la lista se encoge en vez de desbordar. Medido: la franja no se reproducía en un iPhone 14, el peligro estaba sobrestimado | El desplegable nunca se come su campo | 9 |
| ~~Subir el logo desde Ajustes~~ **ya construido** | 8 | — | Verificado en código: `LogoFileInput` en `ajustes/profile-form.tsx`, con subida de fichero y campo `logoUrl`. Mismo error de origen que la fila anterior | — | 8 |

## Tier 2 - siguiente ola (M-L)

| Cambio | Nota actual | Esfuerzo | Impacto y riesgo | Beneficio tras el cambio | Nota final |
|---|---|---|---|---|---|
| **Base de alimentos y macros por día** | 2 | XL (empezar por L) | El hueco que un dietista nota en diez minutos. Riesgo alto: fuente de composición, modelo de raciones y editor que recalcula. Empezar por una rebanada fina o no empezar | El producto pasa de coordinar a ser herramienta de nutrición | 8 |
| Reserva de cita por el paciente | 2 | M | La agenda ya existe del lado del especialista. Depende del email de Tier 0 | Se acaban los huecos negociados por chat | 8 |
| Informe de adherencia exportable | 5 | M | El informe existe en pantalla; no sale de ahí | El paciente se lleva su evolución; el especialista la archiva | 8 |
| Diario de comida del paciente | 0 | L | Es el diferenciador de Healthie. Riesgo: volumen de fotos y tiempo de revisión, no código | El plan deja de prescribirse a ciegas | 7 |
| RBAC y equipo de la consulta | 1 | L | Reservado en la navegación, sin construir. Para una consulta de una persona es YAGNI | Consultas con más de un profesional | 7 |
| Preguntas propias en la evaluación | 4 | M | Hoy son 10 pasos fijos. Un constructor entero es desproporcionado; añadir preguntas por consulta no | Cada consulta pregunta lo suyo | 7 |

## Tier 3 - apuestas grandes (L-XL)

| Cambio | Nota actual | Esfuerzo | Impacto y riesgo | Beneficio tras el cambio | Nota final |
|---|---|---|---|---|---|
| Facturación (Stripe + Verifactu) | 0 | L tras el estudio | Monetización. Riesgo legal si se hace sin el Tier 0 | Cobrar dentro de la plataforma | 8 |
| Recetas y lista de la compra | 0 | L | Depende de la base de alimentos | El plan llega hasta el supermercado | 7 |
| Progresión de carga en entreno | 3 | M | Hoy series y repeticiones en texto. Activa el sub-rol deportivo | Rutinas que progresan solas | 7 |
| Vídeos de ejercicio | 2 | M | Hoy ilustración fija. Riesgo: alojamiento y peso | Técnica sin salir de la app | 7 |

## Tier 4 - no ahora, con motivo

| Cambio | Por qué no |
|---|---|
| Dispensarios de suplementos | Modelo de ingresos de EE. UU. que no traslada a la UE |
| Producto de videollamada | El modo `VIDEO` con enlace ya cubre el caso |
| Wearables | Peso y actividad ya tienen entrada manual |
| Constructor de formularios | Genérico y caro; la versión pequeña está en Tier 2 |
| Marketplace | Reseñas de profesionales sanitarios: alta exposición regulatoria |
| IA generadora de dietas | Requiere revisión de cumplimiento antes de dimensionar (`docs/00` §4) |

## El cambio de medicación, en detalle

Decisión del owner, 2026-08-13. La sección de medicación deja de ser parte del
espacio del paciente por defecto y pasa a ser suya:

1. **Opcional en el onboarding.** Si el paciente no marca que sigue una
   medicación, la sección no aparece en `/mi-espacio` ni en su navegación.
2. **Recordatorio personal por defecto.** Si la marca, es para él: pauta,
   dosis, rotación de punto.
3. **Un interruptor "compartir la información de medicación con mi
   especialista".** Apagado por defecto.
4. **Con el interruptor encendido**, el especialista ve exactamente lo que ve
   hoy: pauta, adherencia y punto sugerido en la ficha.

Lo que hay que resolver al construirlo, y que no está decidido:

- **Los datos que ya existen.** Hay dosis registradas con el modelo actual. La
  opción conservadora es que un paciente con medicación registrada quede como
  "comparte", que es el estado en el que su especialista ya la veía, y
  avisarle. La opción estricta es apagarlo para todos y que el especialista
  pierda acceso hasta que el paciente lo encienda. Es una decisión del owner y
  tiene lectura legal.
- **Qué ve el especialista con el interruptor apagado.** Nada, o "el paciente
  sigue una medicación y no la comparte". Lo segundo es más honesto
  clínicamente y más invasivo; lo primero es más limpio.
- **Los eventos de dominio.** `modules/events.test.ts` ya falla si un payload
  lleva valores clínicos, pero habrá que revisar que apagar el interruptor no
  deje rastro del fármaco en el historial de eventos.
