import { TEMPLATE_NAME_MAX } from "@/components/template-bar";

/**
 * A free name for a copy. Templates are unique on (organizationId, name),
 * so duplicating has to pick a name nobody holds rather than let the
 * upsert silently overwrite the original.
 *
 * "Volumen" -> "Volumen (copia)" -> "Volumen (copia 2)" -> ...
 */
const SUFFIX = /\s*\(copia(?: (\d+))?\)$/;

export function nextCopyName(name: string, taken: Iterable<string>): string {
  const used = new Set([...taken].map((n) => n.toLowerCase()));
  // Copying a copy keeps one suffix rather than stacking them.
  const base = name.replace(SUFFIX, "").trim() || name.trim();

  for (let n = 1; ; n++) {
    const suffix = n === 1 ? " (copia)" : ` (copia ${n})`;
    // The cap is a database column limit: trim the base, never the suffix,
    // or the result stops being unique.
    const room = TEMPLATE_NAME_MAX - suffix.length;
    const candidate = `${base.slice(0, Math.max(1, room)).trim()}${suffix}`;
    if (!used.has(candidate.toLowerCase())) return candidate;
  }
}
