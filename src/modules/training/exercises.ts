/**
 * Exercise catalogue (docs/build/slice-21-plan.md, slice D). The
 * specialist picks from this list instead of typing, so every routine
 * uses the same vocabulary and each entry can carry one illustration.
 *
 * `key` is the stable identifier: it is what routines store and what the
 * image files are named after (`public/exercises/{key}.png`). Renaming a
 * `name` here updates every routine that references it; changing a `key`
 * would orphan them, so keys are append-only in practice.
 */

export const MUSCLE_GROUPS = [
  "CHEST",
  "BACK",
  "LEGS",
  "SHOULDERS",
  "ARMS",
  "CORE",
  "CARDIO",
] as const;

export type MuscleGroup = (typeof MUSCLE_GROUPS)[number];

export type CatalogueExercise = {
  key: string;
  name: string;
  group: MuscleGroup;
};

export const EXERCISES: readonly CatalogueExercise[] = [
  // Chest
  { key: "press-banca", name: "Press de banca", group: "CHEST" },
  { key: "press-inclinado", name: "Press inclinado con mancuernas", group: "CHEST" },
  { key: "aperturas", name: "Aperturas con mancuernas", group: "CHEST" },
  { key: "fondos-paralelas", name: "Fondos en paralelas", group: "CHEST" },
  { key: "flexiones", name: "Flexiones", group: "CHEST" },

  // Back
  { key: "dominadas", name: "Dominadas", group: "BACK" },
  { key: "jalon-al-pecho", name: "Jalón al pecho", group: "BACK" },
  { key: "remo-barra", name: "Remo con barra", group: "BACK" },
  { key: "remo-mancuerna", name: "Remo con mancuerna", group: "BACK" },
  { key: "peso-muerto", name: "Peso muerto", group: "BACK" },
  { key: "hiperextensiones", name: "Hiperextensiones lumbares", group: "BACK" },

  // Legs
  { key: "sentadilla", name: "Sentadilla", group: "LEGS" },
  { key: "prensa", name: "Prensa de piernas", group: "LEGS" },
  { key: "zancada", name: "Zancadas", group: "LEGS" },
  { key: "peso-muerto-rumano", name: "Peso muerto rumano", group: "LEGS" },
  { key: "extension-cuadriceps", name: "Extensión de cuádriceps", group: "LEGS" },
  { key: "curl-femoral", name: "Curl femoral", group: "LEGS" },
  { key: "elevacion-gemelos", name: "Elevación de gemelos", group: "LEGS" },
  { key: "hip-thrust", name: "Hip thrust", group: "LEGS" },

  // Shoulders
  { key: "press-militar", name: "Press militar", group: "SHOULDERS" },
  { key: "elevaciones-laterales", name: "Elevaciones laterales", group: "SHOULDERS" },
  { key: "pajaro", name: "Pájaro (deltoide posterior)", group: "SHOULDERS" },
  { key: "face-pull", name: "Face pull", group: "SHOULDERS" },

  // Arms
  { key: "curl-biceps", name: "Curl de bíceps", group: "ARMS" },
  { key: "curl-martillo", name: "Curl martillo", group: "ARMS" },
  { key: "extension-triceps", name: "Extensión de tríceps en polea", group: "ARMS" },
  { key: "press-frances", name: "Press francés", group: "ARMS" },

  // Core
  { key: "plancha", name: "Plancha", group: "CORE" },
  { key: "plancha-lateral", name: "Plancha lateral", group: "CORE" },
  { key: "crunch", name: "Crunch abdominal", group: "CORE" },
  { key: "elevacion-piernas", name: "Elevación de piernas", group: "CORE" },
  { key: "rueda-abdominal", name: "Rueda abdominal", group: "CORE" },

  // Cardio
  { key: "carrera", name: "Carrera continua", group: "CARDIO" },
  { key: "bici-estatica", name: "Bicicleta estática", group: "CARDIO" },
  { key: "eliptica", name: "Elíptica", group: "CARDIO" },
  { key: "remo-maquina", name: "Remo en máquina", group: "CARDIO" },
  { key: "cinta-inclinada", name: "Cinta caminando en inclinación", group: "CARDIO" },
] as const;

const BY_KEY = new Map(EXERCISES.map((exercise) => [exercise.key, exercise]));

export function findExercise(key: string): CatalogueExercise | undefined {
  return BY_KEY.get(key);
}

export function isCatalogueKey(key: string): boolean {
  return BY_KEY.has(key);
}

/** Catalogue grouped for a <select> with <optgroup>, in listed order. */
export function exercisesByGroup(): {
  group: MuscleGroup;
  exercises: CatalogueExercise[];
}[] {
  return MUSCLE_GROUPS.map((group) => ({
    group,
    exercises: EXERCISES.filter((exercise) => exercise.group === group),
  })).filter((entry) => entry.exercises.length > 0);
}

/**
 * Illustration path for a catalogue entry, or null when that exercise has
 * no image yet. Images land progressively (credit-bound), so every
 * consumer must render fine without one.
 */
export function exerciseImage(key: string): string | null {
  return ILLUSTRATED.has(key) ? `/exercises/${key}.png` : null;
}

/**
 * Keys with an illustration in public/exercises/. Add a key here only
 * once its file exists — a missing image renders as a broken box.
 *
 * Every file is the same mannequin as public/mannequin-male-front.png,
 * generated with it as the style reference, background removed, cropped
 * to content on a square canvas at 320px. Keeping to that recipe is what
 * makes the set look like one set.
 */
export const ILLUSTRATED = new Set<string>([
  "press-banca",
  "sentadilla",
  "press-militar",
  "dominadas",
]);
