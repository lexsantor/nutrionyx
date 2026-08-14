Lee `next-steps.md` y `docs/build/roadmap-2026-08-14.md`, que es la única
tabla de tiers válida. `roadmap-feature-tiers.md` está sustituido y lo dice en
su primera línea.

Verifica el estado real antes de nada:

```sh
npm run lint && npx tsc --noEmit && npm run build
npx vitest run 2>&1 | grep -E "Test Files|Tests |FAIL"
```

Deberías ver 150 pasando y 24 saltados, sobre `4ff9941`. Filtra por el
resultado, nunca por `tail`: la línea de duración se ve igual en verde y en
rojo, y así llegó un commit a CI en rojo.

**Y cuando esperes a CI, busca por SHA, nunca `gh run list --limit 1`.** Ayer
eso dio "success" leyendo el run del commit anterior, y dos commits estuvieron
en rojo mientras yo los daba por buenos:

```sh
SHA=$(git rev-parse --short HEAD)
gh run list --limit 12 --json headSha,status,conclusion \
  -q ".[] | select(.headSha[0:7]==\"$SHA\") | .status + \" \" + (.conclusion // \"\")"
```

Aviso: `~/.nutrionyx/creds.json` sigue en disco por decisión del owner. Léelo
programáticamente, nunca imprimas los valores, y avísale al empezar.

## Tarea: importar el catálogo de alimentos de USDA/CIQUAL

Decidido por el owner el 2026-08-14. Hoy `src/modules/diet/foods.ts` tiene 80
filas escritas a mano con cifras genéricas, y el propio fichero avisa de que no
es fuente clínica. Es lo único que separa el producto de poder prescribir de
verdad, y bloquea las recetas del Tier 2.

Licencias ya estudiadas en el plan de la slice 29: **USDA es dominio público,
CIQUAL exige atribución, Open Food Facts es share-alike y hay que evitarla**,
y los términos comerciales de BEDCA están sin confirmar.

Antes de escribir nada, decide y argumenta:

- **Qué pasa con las 80 claves actuales.** No son una tabla suelta: `foodKey`
  está guardado dentro de `DietPlan.content` y de `DietTemplate.content` de
  planes reales. `normalizeContent` descarta la clave cuya comida ya no existe
  en el catálogo y deja el texto libre, así que un import que renombre claves
  no rompe nada visible pero **deja de contar calorías en silencio**. Eso es
  peor que un error.
- **Qué subconjunto.** USDA completo son miles de entradas y el selector es un
  `<select>` con `<optgroup>`. Un catálogo de 8.000 filas no es utilizable.
- **Dónde vive la atribución** si entra CIQUAL.
- **De dónde salen los datos en tiempo de build o de ejecución.** Hoy el
  catálogo es un array TypeScript, no una tabla. Cambiarlo a base de datos es
  otra decisión.

`foods.test.ts` comprueba cada fila contra los factores de Atwater. Eso caza un
dígito transpuesto y no caza un valor simplemente equivocado; mantenlo.

## Lo otro que quedó a medias, y es lo único cargado en `main`

Las **preguntas propias de la evaluación** (`260716c`) se shipearon con la
mitad del paciente sin recorrer en navegador: el paso de la pregunta, guardar
la respuesta, la revisión y la ficha. La aritmética de pasos sí tiene tests
—`src/modules/assessment/definition.ts`, y ahí es donde un off-by-one deja a un
paciente atrapado en una evaluación que no puede terminar—, pero el cableado no
se caminó.

Va **inerte a propósito**: ninguna consulta tiene preguntas configuradas, y con
cero el código se reduce a lo que había antes. No lo actives sin recorrerlo.

No se pudo verificar porque dar de alta un paciente de prueba está roto por dos
fallos ajenos: **Resend rechaza direcciones `example.com` en sandbox**, y
`listInvitations` devuelve un 500 de Neon Auth, así que el enlace de invitación
nunca se pinta. En cuanto el owner verifique el dominio de Resend, esto se
cierra en una sesión: añade dos preguntas en Ajustes, invita a un paciente,
completa los diez pasos fijos y comprueba que aterriza en la primera pregunta
propia y no en la revisión.

## Cómo se verifica aquí

Un build verde es un suelo, no un veredicto. Recorre con Playwright y **mide
rectángulos**, nunca `documentElement.scrollWidth`. Trampas de selector que
costaron una pasada cada una ayer:

- El primer `button[type="submit"]` de cualquier página autenticada es
  **"Cerrar sesión"**. Apunta por texto.
- El primer `a[href^="/panel/pacientes/"]` ya no es Alejandro: hay pacientes de
  prueba invitados por delante. Filtra por nombre.
- `[role="alert"]` sin acotar caza el *route announcer* de Next, que lleva el
  título de la página. Acota a `main`.
- `.disabled` en un input refleja solo su propio atributo y da `false` bajo un
  `fieldset[disabled]`. El estado efectivo se lee con `:disabled`.
- Un `waitForURL` contra "ya no estoy en el origen" resuelve en el primer salto
  de una cadena de redirects. Espera al destino.

Y si tocas dependencias: **un `npm ci` local en macOS no puede dar por bueno un
lockfile**, solo lo puede hacer CI en Linux. El procedimiento que funciona está
en `tasks/lessons.md`, entrada del 2026-08-14.

## Al terminar

Gates en verde, recorrido en navegador, commit, y espera a que CI pase **por
SHA** antes de darlo por hecho. Captura cualquier corrección en
`tasks/lessons.md` y actualiza la fila del roadmap con lo que encuentres, no
con lo que planeabas.
