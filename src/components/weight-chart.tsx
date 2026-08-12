import { getFormatter, getTranslations } from "next-intl/server";
import { chartRange, weightDelta } from "@/modules/measurement/progress";

type Point = { recordedAt: Date; valueKg: number };

// design.md 12: one protagonist series (current point in primary, history in
// surface-4), dashed goal line, y-axis never anchored at zero, sentiment by
// proximity to the goal (not the sign of the change), never bare axes.
export async function WeightChart({
  points,
  targetKg,
}: {
  points: Point[];
  targetKg: number | null;
}) {
  const t = await getTranslations("progress");
  const format = await getFormatter();

  const fmtKg = (v: number) =>
    `${format.number(v, {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    })} kg`;

  const latest = points[points.length - 1]!;
  const delta = targetKg != null ? weightDelta(latest.valueKg, targetKg) : null;

  // Wide plot: matches the aspect the cards actually give it (roughly
  // 3.6:1), so w-full needs no per-surface height cap.
  const W = 720;
  const H = 200;
  const padX = 16;
  const padY = 20;
  const values = points.map((p) => p.valueKg);
  const range = chartRange(targetKg != null ? [...values, targetKg] : values);
  const span = range.max - range.min || 1;
  const n = points.length;
  const x = (i: number) =>
    padX + (n === 1 ? (W - 2 * padX) / 2 : (i / (n - 1)) * (W - 2 * padX));
  const y = (v: number) => H - padY - ((v - range.min) / span) * (H - 2 * padY);
  const linePath = points
    .map(
      (p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(p.valueKg).toFixed(1)}`,
    )
    .join(" ");
  const goalY = targetKg != null ? y(targetKg) : null;

  return (
    <figure className="flex flex-col gap-3">
      <figcaption className="flex items-baseline justify-between gap-4">
        <span className="font-display text-2xl font-semibold tabular-nums">{fmtKg(latest.valueKg)}</span>
        {delta != null ? (
          <span
            className={
              delta === 0
                ? "text-sm font-medium text-success"
                : "text-sm font-medium text-ink-subtle"
            }
          >
            {delta === 0
              ? t("atGoal")
              : t("toGoal", {
                  delta: fmtKg(Math.abs(delta)),
                  direction: delta > 0 ? t("above") : t("below"),
                })}
          </span>
        ) : null}
      </figcaption>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        role="img"
        aria-label={t("chartLabel")}
      >
        {goalY != null ? (
          <line
            x1={padX}
            x2={W - padX}
            y1={goalY}
            y2={goalY}
            strokeDasharray="4 4"
            strokeWidth={1}
            style={{ stroke: "var(--color-accent-text)" }}
          />
        ) : null}
        <path
          d={linePath}
          fill="none"
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
          style={{ stroke: "var(--color-primary)" }}
        />
        {points.map((p, i) => (
          <circle
            key={i}
            cx={x(i)}
            cy={y(p.valueKg)}
            r={i === n - 1 ? 4 : 3}
            style={{
              fill:
                i === n - 1 ? "var(--color-primary)" : "var(--color-surface-4)",
            }}
          />
        ))}
      </svg>

      {n > 1 ? (
        <div aria-hidden="true" className="flex justify-between text-xs text-ink-subtle">
          <span>
            {format.dateTime(points[0]!.recordedAt, { day: "numeric", month: "short" })}
          </span>
          <span>
            {format.dateTime(latest.recordedAt, { day: "numeric", month: "short" })}
          </span>
        </div>
      ) : null}

      <table className="sr-only">
        <caption>{t("chartLabel")}</caption>
        <thead>
          <tr>
            <th>{t("dateLabel")}</th>
            <th>{t("weightLabel")}</th>
          </tr>
        </thead>
        <tbody>
          {points.map((p, i) => (
            <tr key={i}>
              <td>{format.dateTime(p.recordedAt, { dateStyle: "medium" })}</td>
              <td>{fmtKg(p.valueKg)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
