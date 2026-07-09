# Reference Onboarding Flow Analysis

**Source:** a third-party consumer nutrition app (mobile web, Spanish; brand withheld - the screenshots served as flow examples only). **Captured:** 2026-07 (screenshots timestamped 09:54-09:58, 9 July 2026). **Purpose:** evidence input for the Nutrionyx Assessment slice. **Scope note:** this documents a third-party consumer product (self-serve diet quiz with a marketing funnel). Nutrionyx is a B2B professional tool for nutritionists - patterns transfer selectively, not wholesale.

Evidence base: 27 screenshots in `docs/research/flows/` (`paso-1.jpeg` ... `paso-25.jpeg`, plus `paso-13.1`/`paso-13.2`, and `reseña.jpeg`). The quiz has a 27-step progress counter ("N/27"); the screenshot filenames do not always match the counter shown on screen (e.g. `paso-23.jpeg` shows 23/27 but was captured between the screens filed as paso-15 and paso-16). The inventory below follows counter order where visible, with the source filename cited. Steps 1-5, 9, 16, 22 and 26 of the counter were not captured with a visible counter; gaps are noted.

## Step-by-step inventory

| # | Counter | File | Screen title (as shown) | Input type | Options / fields | Computed output / dynamic behavior |
|---|---------|------|------------------------|-----------|------------------|-----------------------------------|
| 1 | not visible (likely 1-5/27) | `paso-1.jpeg` | ¿Cuáles son tus objetivos? / Selecciona todos los que apliquen: | Multi-select (checkboxes, emoji per row) | Perder peso; Tonificar mi cuerpo; Estar en forma y saludable; Ganar músculo; Mejorar salud articular; Acelerar metabolismo; Subir niveles de energía; Mejorar salud intestinal; Reducir hambre y antojos | "Continuar" button rendered pale (apparently disabled until a selection is made) |
| 2 | not visible | `paso-25.jpeg` | Resultados visibles en 4 semanas | Info-only (social proof interstitial) | Before/after photo pair; testimonial card "Bajé 28 kg y recuperé mis abs" with quote ("Perdí 28 kg en pocos meses siguiendo este plan...") ; attribution "Tim W., 41" with verified badge and 5 green stars | None. Timestamp (09:54) places this interstitial early in the flow, near steps 1-5, despite the filename |
| 3 | 6/27 | `paso-2.jpeg` | Elige tu tipo de cuerpo actual: | Single-select cards with photos | Delgado; Normal; Con barriga; Con sobrepeso (male torso photos) | Auto-advance on tap (no Continuar button visible) |
| 4 | 7/27 | `paso-3.jpeg` | Elige el cuerpo que deseas: | Single-select cards with photos | Unas tallas menos; Esbelto; Atlético; Definido | - |
| 5 | 8/27 | `paso-4.jpeg` | ¿Alguna zona que quieras mejorar? / Si estás conforme con tu apariencia, presiona Continuar | Multi-select checkboxes anchored on a body illustration | Brazos; Pecho; Espalda; Abdomen; Glúteos; Piernas | Optional step (explicit skip affordance via Continuar) |
| - | 9/27 | not captured | - | - | - | - |
| 6 | 10/27 | `paso-5.jpeg` | ¿Cómo es tu día a día? | Single-select (emoji per row) | Trabajo de oficina; Mucho movimiento; Entrenando siempre; Paso tiempo en casa | - |
| 7 | 11/27 | `paso-6.jpeg` | ¿Cuáles son tus niveles de energía durante el día? | Single-select (emoji per row) | Bajos, me siento cansada todo el día; Bajón después de comer; Sin fuerzas antes de comer; Altos y constantes | Note: feminine "cansada" while the body-type screens show male photos (copy not gender-adapted) |
| 8 | 12/27 | `paso-7.jpeg` | ¿Con qué frecuencia haces ejercicio? | Single-select (signal-bar icons of increasing intensity) | Nunca; Varias veces al mes; Varias veces por semana; Casi todos los días | - |
| 9 | 13/27 | `paso-8.jpeg` | ¿Cómo suele cambiar tu peso? | Single-select (chevron rows) | Subo rápido pero bajo muy lento; Subo y bajo de peso con facilidad; Me cuesta ganar peso o músculo | - |
| 10 | 14/27 | `paso-9.jpeg` | ¿Cuándo fue la última vez que estuviste en tu peso ideal? | Single-select (chevron rows) | Hace menos de un año; Hace 1-3 años; Hace más de 3 años; Nunca | - |
| 11 | 15/27 | `paso-10.jpeg` | ¿Has probado alguna de estas dietas en los últimos 3 años? / Selecciona todas las que apliquen: | Multi-select (checkboxes) | Dieta Keto; Ayuno intermitente; Dieta vegetariana; Dieta vegana; Baja en carbohidratos; Sin gluten; Otra; Ninguna de las anteriores | - |
| - | 16/27 | not captured | - | - | - | - |
| 12 | 17/27 | `paso-11.jpeg` | ¿Cuál es la razón principal para ponerte en forma? | Single-select (chevron rows) | Sentirme con más confianza en mi cuerpo; Ser más atractivo; Sentirme más sano y con más energía; Mejorar mi salud mental; Que mi ropa me quede mejor; Otra | - |
| 13 | 18/27 | `paso-12.jpeg` | ¿Cuál es tu estatura? | Numeric input + unit toggle (in / cm, cm active) | Value field "0 cm" | Info box: "Calculando tu índice de masa corporal - El índice de masa corporal (IMC) es una medida que usa tu estatura y peso para saber si tienes un peso saludable." Continuar pale until valid input |
| 14 | 19/27 | `paso-13.1.jpeg` | ¿Cuál es tu peso actual? | Numeric input + unit toggle (lbs / kg, kg active) | Value field "0 kg" | Continuar pale (empty state) |
| 15 | 19/27 | `paso-13.2 (resultado).jpeg` | ¿Cuál es tu peso actual? (with 126 kg entered) | Numeric input | 126 kg | Immediate BMI feedback, red banner: "! Tu IMC es 33.5, lo cual se considera obesidad - Tienes mucho que ganar perdiendo un poco de peso. Usaremos tu IMC para crear el programa de pérdida de peso que necesitas." Continuar becomes active |
| 16 | 20/27 | `paso-14 (...azul - verde - naranja).jpeg` | ¿Cuál es tu peso objetivo? | Numeric input + unit toggle (lbs / kg) | 110 kg entered | Dynamic banner keyed to the target-loss ratio. Captured variant (green, 13% loss): "BENEFICIOS PARA LA SALUD: pierde el 13% de tu peso - Estudios muestran que perder el 10% de tu peso reduce el riesgo de ataques cardíacos e inflamación arterial." The filename documents that the message has blue / green / orange variants depending on the loss ratio; only the green variant is visible in the capture |
| 17 | 21/27 | `paso-15.jpeg` | ¿Qué edad tienes? | Numeric input | 40 entered | Info box: "Necesitamos tu edad para crear tu plan personal - Las personas mayores suelen tener más grasa corporal y un metabolismo más lento que los jóvenes con el mismo IMC." |
| 18 | not visible (between 21 and 23) | `paso-16 (resumen).jpeg` | Tu resumen personal | Info-only (computed summary) | Sections: "Índice de Masa Corporal (IMC)" gauge with bands Bajo peso / Saludable / Sobrepeso / Obesidad and marker "Tú: 33.5"; red banner "! Tu IMC es 33.5, lo cual se considera obesidad - Mejorarás mucho tu salud perdiendo un poco de peso. Crearemos el plan específico que necesitas."; profile card: Grasa corporal 33.18%, Nivel de actividad Medio, Nivel de energía Alto, Objetivo Perder peso, with an avatar photo | BMI gauge, body-fat % estimate, activity/energy classifications derived from earlier answers |
| 19 | not visible (timestamp 09:56, likely 22/27) | `paso-24.jpeg` | Pierde tres veces más peso con nuestro plan personalizado frente a otras dietas | Info-only (marketing claim) | Bar chart "Tasa de pérdida de peso": Otras dietas (red, small) vs the app (green, tall, "3x 🎉"); footnote "Basado en un estudio de 4 semanas con usuarios de [la app]" | None |
| 20 | 23/27 | `paso-23.jpeg` | ¡Predecimos que pesarás 110 kg para el 25 de agosto de 2026! | Info-only (computed projection) | Weight curve from 126 kg (9 jul) to 110 kg (25 ago), red-to-green gradient, "Meta 110 kg" flag; green banner "🙌 ¡Buenas noticias! Basándonos en usuarios con perfiles similares, predecimos que alcanzarás tu peso ideal de 110 kg antes del 25 de agosto de 2026." | Projected date computed from current weight, target weight and (per the copy) similar-user profiles. Note: the projected loss rate shown is ~16 kg in ~7 weeks |
| 21 | 24/27 | `paso-17.jpeg` | ¿Cuántas comidas al día te gustaría tener? / Puedes cambiar esto en los ajustes más tarde | Single-select (rows with descriptions) | Tres (Desayuno, comida y cena); Cuatro (Desayuno, snack, comida y cena); Cinco (Desayuno, comida, cena y dos snacks) | Copy signals reversibility ("puedes cambiar esto... más tarde") |
| 22 | 25/27 | `paso-18 (selección de alimentos).jpeg` | Lo amo o lo odio / Si no lo sabes, elige Neutral | Card-swipe rating, one food per card | Card shown: "Pollo Frito" (photo, stacked deck behind); buttons: Lo odio (black) / Neutral (outline) / Lo amo (orange) | Tinder-style food preference elicitation; number of cards not visible |
| 23 | not visible (likely 26/27; header scrolled off) | `paso-19.jpeg` | ¿Te gustaría excluir alguno de estos productos de tu plan? / Proteínas y lácteos: | Multi-select (checkboxes, emoji per row) with mutually-exclusive "eat everything" option | Los como todos (pre-checked, highlighted); Pollo; Pavo; Carne roja; Huevos; Yogur griego; Queso; Atún; list truncated below fold | - |
| 24 | 27/27 | `paso-20.jpeg` | ¿Te gustaría excluir alguno de estos productos de tu plan? / Otros: | Multi-select (checkboxes, emoji per row) | Los como todos; Tomates; Brócoli; Calabacín; Zanahorias; Pimientos; Aguacates; Champiñones; list truncated below fold | Continuar pale until a choice is made |
| 25 | post-quiz | `paso-21.jpeg` | Generando... | Info-only (processing screen) | 98% progress ring; checklist all ticked: Revisando tus respuestas...; Analizando tus preferencias...; Ajustando tu cronograma de pérdida de peso...; Finalizando tu plan personalizado... | Simulated processing/anticipation screen |
| 26 | post-quiz | `paso-22.jpeg` | Basándonos en tus preferencias, hemos creado | Info-only (marketing claim) | "1000+ Combinaciones de comidas que se adaptan perfectamente a ti y te ayudarán a alcanzar un peso saludable de la manera más amena." | None |
| 27 | post-quiz | `reseña.jpeg` | Ingresa tu email para recibir tu plan de pérdida de peso personalizado | Text input (email) | Field "Tu email"; button "Reclamar mi plan"; small print: "Al continuar, aceptas nuestra Política de Privacidad. Respetamos tu privacidad. Nunca venderemos, alquilaremos ni compartiremos tu dirección de correo electrónico. ¡Más que una política, es nuestra garantía personal!" | Email gate before delivering the plan (lead capture) |

All 27 screenshots were legible; none unreadable.

## Data collected

**Identity / demographics**

- Edad (numeric)
- Email (final gate)
- (Sex/gender is not asked in any captured screen, yet body-type photos are male and one option uses feminine "cansada" - presumably asked in one of the uncaptured steps 1-5/27 or inferred from an entry funnel)

**Anthropometrics**

- Estatura (cm/in, unit toggle)
- Peso actual (kg/lbs, unit toggle)
- Peso objetivo (kg/lbs)
- Tipo de cuerpo actual (Delgado / Normal / Con barriga / Con sobrepeso)
- Cuerpo deseado (Unas tallas menos / Esbelto / Atlético / Definido)
- Zonas a mejorar (Brazos, Pecho, Espalda, Abdomen, Glúteos, Piernas)

**Lifestyle / activity**

- Día a día (Trabajo de oficina / Mucho movimiento / Entrenando siempre / Paso tiempo en casa)
- Niveles de energía durante el día (4 levels)
- Frecuencia de ejercicio (Nunca ... Casi todos los días)

**Goals / motivation**

- Objetivos (multi-select, 9 options: perder peso, tonificar, salud, músculo, articulaciones, metabolismo, energía, salud intestinal, hambre/antojos)
- Razón principal para ponerse en forma (confianza, atractivo, salud/energía, salud mental, ropa, otra)
- Historial de peso: cómo suele cambiar el peso (3 patterns); última vez en peso ideal (4 ranges)
- Dietas probadas en los últimos 3 años (Keto, ayuno intermitente, vegetariana, vegana, baja en carbohidratos, sin gluten, otra, ninguna)

**Food preferences**

- Comidas al día deseadas (3 / 4 / 5)
- Rating por alimento "Lo amo / Neutral / Lo odio" (card deck; e.g. Pollo Frito)
- Exclusiones por categoría: "Proteínas y lácteos" (pollo, pavo, carne roja, huevos, yogur griego, queso, atún, ...) and "Otros" (tomates, brócoli, calabacín, zanahorias, pimientos, aguacates, champiñones, ...), each with a "Los como todos" opt-out

**Other**

- Acceptance of the privacy policy (implicit on email submit)

## Computed outputs

- **IMC (BMI):** computed live as soon as weight is entered (height already known): "Tu IMC es 33.5, lo cual se considera obesidad" (126 kg + the height entered at 18/27). Formula not shown on screen, only the explanation that IMC "usa tu estatura y peso". Classification bands shown on the summary gauge: Bajo peso / Saludable / Sobrepeso / Obesidad.
- **Risk-tiered target-weight messaging:** the target-weight screen shows a banner whose color and message depend on the requested loss ratio (blue / green / orange per the capture's filename). Captured green variant at 13% loss: "BENEFICIOS PARA LA SALUD: pierde el 13% de tu peso", citing that a 10% loss reduces cardiac risk. The loss percentage (13%) is computed from current vs target weight. Other variants not captured.
- **Grasa corporal (body fat %):** 33.18% on the summary. Formula not visible; presumably derived from BMI, age and sex - do not assume.
- **Classifications on the summary:** Nivel de actividad "Medio" (derived from activity answers), Nivel de energía "Alto" (from the energy answer), Objetivo "Perder peso" (from goals).
- **Weight projection:** "¡Predecimos que pesarás 110 kg para el 25 de agosto de 2026!" - a dated goal curve (126 -> 110 kg, 9 jul -> 25 ago) framed as "basándonos en usuarios con perfiles similares". Method not shown; the implied rate (~16 kg in ~7 weeks) is aggressive.
- **Plan-scale claim:** "1000+ Combinaciones de comidas" adapted to the answers.
- **Comparative claim:** "3x" weight-loss rate vs "otras dietas", footnoted only as "un estudio de 4 semanas con usuarios de [la app]".

## UX patterns worth adopting vs rejecting for a professional B2B tool

**Adopt (adapted to a nutritionist-driven assessment):**

- Progress indicator ("N/27" + bar): sets effort expectations for a long intake; equally useful for patient-filled pre-assessment forms.
- One question per screen: near-zero cognitive load and clean mobile ergonomics for patients completing an intake on their phone.
- Immediate computed feedback (BMI on weight entry): instant validation of derived values catches data-entry errors at the source - for professionals, show the number, not the scare copy.
- Tiered feedback keyed to target ratio (blue/green/orange): a sound clinical-guardrail pattern - flag unrealistic or unsafe weight-loss targets at capture time; in Nutrionyx this should cite clinical criteria, not motivational copy.
- Unit toggles (kg/lbs, cm/in) inline with the input: removes a whole class of unit errors.
- Optional-step affordance ("Si estás conforme..., presiona Continuar") and reversibility copy ("Puedes cambiar esto en los ajustes más tarde"): honest, reduces abandonment.
- "Los como todos" fast-path on exclusion lists: a one-tap escape for the majority case, with structured exclusions grouped by food category for the rest.
- Card-based food like/neutral/dislike rating: fast preference elicitation that could feed a professional's meal-plan builder (with "Neutral" as the explicit don't-know).

**Reject:**

- The fake "Generando... 98%" processing checklist: theatrical delay with no real computation shown; a professional tool must not simulate work.
- Unverifiable marketing claims ("3x" vs other diets from a self-run 4-week study; "1000+ combinaciones"): inadmissible in a clinical context.
- The social-proof/testimonial interstitial (before/after photos, "Bajé 28 kg y recuperé mis abs", 5 stars): consumer persuasion, not evidence; irrelevant to a nutritionist's workflow.
- The email gate ("Reclamar mi plan") holding the deliverable hostage for lead capture: dark-pattern adjacent; in B2B the professional already owns the data.
- The aggressive dated promise ("pesarás 110 kg para el 25 de agosto") built on opaque "similar users" logic: overpromising outcomes (~2.3 kg/week) is clinically irresponsible; projections in Nutrionyx must be practitioner-set or evidence-based with uncertainty.
- Shame-tinged framing on the BMI result ("Tienes mucho que ganar perdiendo un poco de peso"): emotional steering; a professional tool reports classifications neutrally.
- Aspirational body-image imagery (idealized torsos as answer options): reinforces appearance-first framing; a clinical intake should use neutral descriptors or validated scales.

## Open questions

- **Steps not captured:** counter positions 1-5/27 (except the goals screen, which shows no counter), 9/27, 16/27, 22/27 and 26/27 are missing or lack a visible counter. In particular, where sex/gender, name, or an initial goal-branching question is asked is unknown (the male imagery plus feminine "cansada" copy suggests inconsistent or absent gender adaptation).
- **Validation rules:** min/max for estatura, peso, edad; behavior on implausible values (e.g. target weight above current weight, or below a safe BMI) is not shown - only the green banner variant was captured.
- **Banner thresholds:** the exact loss-ratio cutoffs for the blue / green / orange messages are documented only by the filename, not observable.
- **Skip logic / branching:** whether earlier answers (goals, body type) change later questions is not observable from single captures.
- **Error and empty states:** no error state, offline state, or invalid-email handling captured.
- **Food-rating deck size:** how many "Lo amo o lo odio" cards are shown, and whether swipe gestures are supported in addition to buttons.
- **Exclusion list length:** both exclusion screens are truncated below the fold; full option lists unknown. Whether "Los como todos" auto-unchecks other selections is unverified.
- **After the final step:** what follows the email gate (paywall, plan preview, account creation, pricing) was not captured.
- **Formulas:** BMI is implied (height + weight) but the body-fat 33.18% derivation and the projection model ("usuarios con perfiles similares") are opaque.
- **Where the review request happens:** despite the filename `reseña.jpeg`, that capture shows the email gate; no app-store/review prompt is visible in any screenshot.
