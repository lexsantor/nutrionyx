import { exerciseImage } from "@/modules/training/exercises";

/**
 * A catalogue exercise's illustration. Renders nothing for a keyless row
 * or for an entry not drawn yet, so it always sits at the end of its row:
 * a collapsing slot in the middle would shunt the text columns sideways
 * and leave a half-illustrated list looking ragged.
 *
 * `alt` is empty on purpose — the exercise is named beside it, and saying
 * it twice adds nothing for a screen reader.
 */
export function ExerciseThumb({
  exerciseKey,
  className,
}: {
  exerciseKey?: string;
  /** Carries the size; the rest of the box treatment is fixed here. */
  className: string;
}) {
  const src = exerciseKey ? exerciseImage(exerciseKey) : null;
  if (!src) return null;
  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={src}
      alt=""
      width={320}
      height={320}
      className={`shrink-0 rounded-xl border border-hairline bg-surface-2 object-contain p-1 ${className}`}
    />
  );
}
