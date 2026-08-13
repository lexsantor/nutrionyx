# Benchmark contra 10 plataformas del mercado, y qué nos falta

Fecha: 2026-08-14. Commit del inventario: `a14d6be`.

Amplía [benchmark-2026-08.md](benchmark-2026-08.md), que comparaba contra otra
clase de referencia (Healthie, Practice Better, SimplePractice). Aquel sigue
vigente; este no lo contradice, mira otro grupo: el mercado español y el de
fitness.

## Cuánto fiarse de cada lado

Asimétrico a propósito, y conviene decirlo antes de las tablas.

**Nutrionyx**: comprobado contra `src/` y `prisma/schema.prisma`, fichero a
fichero. Cada cifra de esta página sale del código, no de un documento de
planificación. Esa distinción no es pedantería: la tabla de tiers anterior se
escribió desde un plan y dos de cinco filas resultaron ser ficción, y esta
semana han sido cuatro las cifras de estado que no aguantaron el contraste.

**Las otras diez**: la tabla del encargo, es decir páginas de producto y
material del propio fabricante. No he usado ninguna. Un listado de funciones
escrito por quien vende exagera, y "lo tiene" puede significar desde un módulo
maduro hasta una casilla en un comparador. Trátese cada fila como *dicen que lo
tienen*. Antes de comprometerse a igualar cualquiera de ellas, verificar.

De precios solo hay tres datos en el encargo (INDYA 49 €/mes, Dietopro ~45
€/mes, TrainerStudio gratis hasta 3 clientes). No hay base para una comparación
económica y no la hago.

## Qué es Nutrionyx hoy, medido

34 rutas, 19 módulos de dominio, 122 tests. Tres portales sobre un mismo shell:
consola del especialista, espacio del paciente y admin de plataforma.

Construido y verificado:

- **Valoración inicial** versionada: sexo, fecha de nacimiento, altura, peso,
  peso objetivo, nivel de actividad, objetivos, patologías, alergias y
  medicación actual. Calcula IMC con categorías OMS, el ratio de pérdida
  implícita y un semáforo de agresividad.
- **Plan de dieta**: 7 días × 5 tomas, con hasta 5 alternativas por comida.
  Totales por día de kcal y proteína, más el número de filas sin contar.
- **Catálogo de alimentos**: 80 entradas con kcal, proteína, hidratos y grasa.
- **Entreno**: rutina de 7 días, catálogo de 41 ejercicios, 4 ilustrados.
- **Antropometría**: 10 tipos de medida sobre un mapa corporal de 7 zonas,
  histórico inalterable, índice cintura-cadera, masa grasa y masa magra.
- **Adherencia**: marca por comida (hecha / cambiada / saltada), sesiones de
  entreno, informe de 28 días, adherencia de proteína contra objetivo.
- **Consulta**: mensajería con aviso por email, agenda con cita solicitada por
  el paciente y confirmada por el especialista, recordatorios diarios por cron,
  documentos, notas privadas, fotos de progreso, plantillas de semana.
- **Medicación GLP-1**: plan del paciente, registro de dosis inalterable,
  rotación de zona de pinchazo, y compartir con el especialista desactivado por
  defecto.
- **Impresión**: dieta, entreno e informe de adherencia.
- **Cumplimiento**: ceguera del operador con tests, aislamiento por consulta con
  tests de integración, consentimiento DPA versionado, eventos de dominio que
  solo llevan identificadores.

Ausente, comprobado por búsqueda en `src/` (no por suposición): app nativa,
manifest de PWA, integración con wearables o apps de salud, registro de agua,
recetas, totales de hidratos y grasa, ecuaciones de gasto energético, pliegues
cutáneos, curvas de crecimiento, analíticas estructuradas, vademécum, dietas
automáticas por patología, IA, cobros, app con marca propia, CRM, roles de
equipo, y cualquier idioma que no sea español.

## Dónde ganamos hoy

No todo es déficit, y decidir solo desde la lista de lo que falta lleva a
copiar al líder y perder lo propio.

- **La adherencia está atada a lo prescrito.** La mayoría de la clase registra
  ingesta libre; aquí la marca es contra la comida que el especialista puso ese
  día, y el total del día dice cuántas filas no ha sabido contar. Un total que
  se calla lo que ignora es peor que no darlo.
- **La medicación es del paciente.** El propio encargo señala que el seguimiento
  de medicación es lo más flojo de la clase. Aquí existe, es específica de GLP-1,
  y se comparte solo si el paciente lo activa. Nutrionyx nunca sugiere dosis.
- **Ceguera del operador como regla con tests.** El admin de plataforma no puede
  ver datos clínicos, y hay un test que falla si un evento nuevo rompe eso. Es
  argumento de venta ante un RGPD Art. 9, no una casilla.
- **Papel.** Dieta, entreno e informe salen impresos. Suena viejo y es lo que
  el paciente pega en la nevera.

## Tier 0 - el suelo, bloqueado o legal

Nada aquí es una función. Todo detiene otra cosa. Las cuatro filas ya abiertas
(dominio en Resend, datos fiscales, revisión legal, estudio de Verifactu) siguen
en [roadmap-feature-tiers.md](../build/roadmap-feature-tiers.md) y no las repito.
Esta es la que añade el benchmark.

| Qué nos falta | Basado en | Nota actual | Esfuerzo | Impacto y beneficio | Nota final |
|---|---|---|---|---|---|
| Valores del catálogo revisados o importados de una fuente con licencia | Nutrium, Virtuagym (9 M+ alimentos) | 3 | M | 80 filas escritas a mano con cifras genéricas. El propio fichero avisa de que no es fuente clínica. Es la diferencia entre una demo y algo con lo que se prescribe. El trabajo de licencias ya está hecho en el plan de la slice 29: USDA es dominio público, CIQUAL pide atribución, Open Food Facts es *share-alike* y hay que evitarla | 8 |

## Tier 1 - ahora (S-M, se nota a diario)

Las cuatro tienen en común que los datos ya están en la base y lo que falta es
la cuenta o la pantalla. Mejor relación esfuerzo-resultado de todo el informe.

| Qué nos falta | Basado en | Nota actual | Esfuerzo | Impacto y beneficio | Nota final |
|---|---|---|---|---|---|
| **Hidratos y grasa en los totales del día** | Las diez | 4 | S | El catálogo ya guarda `carbsG` y `fatG`; `macrosFor` devuelve solo kcal y proteína, así que se tiran dos macros de tres al suelo en cada suma. Un dietista que reparte macros ve hoy un tercio de la respuesta. Es sumar dos campos que ya existen | 8 |
| **Ecuaciones de gasto energético** (Mifflin-St Jeor, Harris-Benedict, Katch-McArdle) | Nutrium (9 ecuaciones predictivas) | 2 | S | `kcalTarget` se teclea a ojo. La valoración ya guarda sexo, fecha de nacimiento, altura, peso y nivel de actividad: está todo lo que una ecuación necesita y no se usa para nada. Proponer la cifra y dejar que el especialista la corrija | 8 |
| **App instalable** (manifest, iconos, plan del día sin conexión) | Las diez tienen app; nosotros ninguna | 3 | S-M | No hay `manifest.json`. El espacio del paciente es la pantalla de uso diario y hoy vive en una pestaña del navegador. No es una app nativa, pero cierra la mayor parte de la distancia por una fracción del coste | 7 |
| **Qué comió cuando cambió la comida** | Nutrium, Virtuagym, NutriMind (registro fotográfico) | 4 | M | `MealLog` guarda hecha / cambiada / saltada. "Cambiada" es hoy un callejón sin salida: el especialista ve que hubo cambio y nada más, que es justo la información que necesitaba. Una foto o dos líneas de texto convierten un dato muerto en la conversación de la siguiente cita | 8 |

## Tier 2 - siguiente ola (M-L)

| Qué nos falta | Basado en | Nota actual | Esfuerzo | Impacto y beneficio | Nota final |
|---|---|---|---|---|---|
| **Analíticas de laboratorio estructuradas** | Dietetic.app, NutriMind | 3 | M | Hoy una analítica es un PDF adjunto: no se consulta, no se grafica, no se compara con la de hace seis meses. Es el dato que convierte el seguimiento en clínico | 8 |
| **Pliegues cutáneos y composición calculada** | NutriDesk (Σ6, 5 masas, Score-Z), NutriMind (ISAK, somatocarta) | 4 | M | `BODY_FAT_PCT` se teclea, y masa grasa y magra derivan de esa cifra tecleada. Es decir: la composición corporal la calcula el plicómetro del especialista, no nosotros. Con los pliegues y una ecuación, el porcentaje se deduce y el histórico gana sentido | 8 |
| **Recetas** | INDYA (miles), TrainerStudio (con ingredientes y macros) | 2 | M-L | Una fila es alimento + gramos. "Pollo al curry" hay que escribirlo como ingredientes sueltos o como texto que no cuenta y engorda el contador de filas sin contar. Es también lo que hace que un plan se lea como comida y no como una lista de la compra | 7 |
| **Biblioteca de ejercicios ilustrada** | Virtuagym (animaciones 3D), TrainerStudio | 4 | M | 41 ejercicios, 4 con dibujo. Bloqueado por créditos de Pletor, no por código. Un plan de entreno con 4 de 41 ilustrados se ve a medio hacer, en pantalla y en papel | 7 |

## Tier 3 - apuestas grandes (L-XL)

| Qué nos falta | Basado en | Nota actual | Esfuerzo | Impacto y beneficio | Nota final |
|---|---|---|---|---|---|
| **Wearables y apps de salud** (Apple Health, Google Fit) | Nutrium, Virtuagym, Trainerize (MyFitnessPal) | 0 | L | El peso y las sesiones se teclean. Leerlos del reloj elimina la fricción diaria que hace que un paciente abandone el registro en la semana tres. Ojo: son datos de salud de terceros, con su propio encaje RGPD | 7 |
| **Cobro y facturación** | Virtuagym, Harbiz | 0 | L-XL | La consulta cobra hoy fuera de la plataforma. Bloqueado de verdad hasta el estudio de Verifactu: la AEAT exige factura inalterable y dimensionar esto sin saberlo es dimensionarlo mal | 8 |
| **Generación asistida de planes** | INDYA | 0 | L | Es la promesa que más vende ahora mismo. También la que más riesgo trae: un plan nutricional generado por un modelo es responsabilidad clínica de alguien. Solo con el especialista como quien firma y edita antes de que el paciente lo vea | 7 |
| **App con la marca del profesional** | Trainerize, TrainerStudio, Harbiz | 1 | XL | Existe `logoUrl` y sale en los documentos impresos. Una app con marca propia es tienda de aplicaciones, revisión y mantenimiento por consulta. Con una consulta en producción, no toca | 6 |

## Tier 4 - no ahora, y por qué

Decidido, no olvidado.

- **Vademécum fármaco-nutriente** (Dietopro, NutriMind). Exige una base de datos
  de medicamentos con licencia y mantenimiento. Choca de frente con la postura
  del módulo de medicación: registra lo que otro prescribió y nunca sugiere.
- **Dietas automáticas por patología** (Dietopro). Misma responsabilidad clínica.
  Aquí prescribe el especialista; automatizar eso es cambiar de producto.
- **Curvas de crecimiento OMS** (NutriMind). Pediatría no es el paciente objetivo.
- **Gestión de gimnasio, CRM y multi-profesional** (Virtuagym, Harbiz). Una
  consulta, un titular. Ya registrado como YAGNI hasta que haya más.
- **Videollamada integrada.** La cita ya lleva `videoUrl` y modo vídeo. Montar
  una pila de vídeo para sustituir un enlace de Meet no es donde está el valor.
- **Multi-idioma.** Solo español, y el mercado objetivo es España. Cuesta poco
  mantenerlo así y mucho abrirlo antes de tiempo.

## Lo que yo haría

Las cuatro filas del Tier 1 antes que ninguna otra cosa de este informe. Tres de
ellas son cuentas sobre datos que ya están guardados, y la cuarta es un fichero
de manifest. Salen por menos de lo que cuesta una sola fila del Tier 2 y son las
que un especialista nota el primer día.

Después, el catálogo de alimentos del Tier 0: es lo único que hoy separa a
Nutrionyx de poder usarse para prescribir de verdad, y hasta que se resuelva
todo lo demás se construye encima de cifras que el propio código marca como no
clínicas.

Nada de lo anterior es *ponerse al día* con las diez. Con una consulta en
producción, perseguir los 9 millones de alimentos de Virtuagym o las animaciones
3D es perseguir el producto de otro. Lo que sí conviene defender es lo que ya
nos separa: la adherencia atada a lo prescrito, la medicación que decide el
paciente y la ceguera del operador demostrada con tests.
