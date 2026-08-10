/**
 * Parametric body silhouette (patient Medidas tile). Waist/hip widths and
 * overall softness respond to the latest measurements - an illustration of
 * the recorded numbers, not a scan. Decorative: the real values render as
 * text next to it (aria-hidden here).
 */
export function BodyFigure({
  waistCm,
  hipCm,
  bodyFatPct,
}: {
  waistCm: number | null;
  hipCm: number | null;
  bodyFatPct: number | null;
}) {
  const clamp = (v: number, min: number, max: number) =>
    Math.min(max, Math.max(min, v));

  const hasData = waistCm != null || hipCm != null || bodyFatPct != null;
  // Half-widths in viewBox units around x=60; neutral defaults when unset.
  const waist = clamp(((waistCm ?? 88) / 88) * 16, 11, 24);
  const hip = clamp(((hipCm ?? 98) / 98) * 19, 14, 27);
  const fat = clamp((bodyFatPct ?? 25) / 25, 0.75, 1.4);
  const shoulder = 22;
  const limb = clamp(5.5 * fat, 4.5, 8);

  const torso = `
    M ${60 - shoulder} 34
    C ${60 - shoulder - 2} 44, ${60 - waist - 2} 52, ${60 - waist} 62
    C ${60 - waist + 1} 70, ${60 - hip} 74, ${60 - hip} 82
    L ${60 + hip} 82
    C ${60 + hip} 74, ${60 + waist - 1} 70, ${60 + waist} 62
    C ${60 + waist + 2} 52, ${60 + shoulder + 2} 44, ${60 + shoulder} 34
    Q 60 28, ${60 - shoulder} 34
    Z`;

  return (
    <svg
      viewBox="0 0 120 190"
      className={`h-full w-auto ${hasData ? "fill-ink/25" : "fill-ink/10"}`}
      aria-hidden="true"
    >
      <circle cx="60" cy="16" r="11" />
      <path d={torso} />
      {/* arms */}
      <rect x={60 - shoulder - limb - 3} y="36" width={limb * 1.6} height="46" rx={limb * 0.8} />
      <rect x={60 + shoulder + 3 - limb * 0.6} y="36" width={limb * 1.6} height="46" rx={limb * 0.8} />
      {/* legs */}
      <rect x={60 - hip + 2} y="82" width={hip - 5} height="72" rx={(hip - 5) / 2.5} />
      <rect x={63} y="82" width={hip - 5} height="72" rx={(hip - 5) / 2.5} />
    </svg>
  );
}
