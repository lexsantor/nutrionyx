import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Guards the rule stated in events.ts: an event payload carries
 * identifiers, never values. `/admin/auditoria` exposes this table to the
 * platform operator, who under adr/0004 must never see clinical data, so a
 * `value`, a `bmi` or a `drugName` slipping into a payload is a privacy
 * defect and not a style one.
 *
 * The check reads source rather than running the calls: every payload is
 * written as an object literal at its call site, and this catches a new one
 * the day it is added instead of the day someone opens the audit view.
 */

/** Non-id keys that name a category or a version, never a measurement. */
const ALLOWED = new Set(["kind", "sender", "version", "name", "from", "to"]);

function tsFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) return tsFiles(path);
    return path.endsWith(".ts") && !path.endsWith(".test.ts") ? [path] : [];
  });
}

/** Keys of every `payload: { ... }` object literal in a source file. */
function payloadKeys(source: string): { keys: string[]; line: number }[] {
  const out: { keys: string[]; line: number }[] = [];
  const re = /payload:\s*\{([^}]*)\}/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(source)) !== null) {
    const keys = [...match[1].matchAll(/(\w+)\s*:/g)].map((m) => m[1]);
    out.push({
      keys,
      line: source.slice(0, match.index).split("\n").length,
    });
  }
  return out;
}

describe("domain event payloads", () => {
  const files = tsFiles("src/modules");

  it("finds the call sites it is meant to police", () => {
    const total = files
      .flatMap((f) => payloadKeys(readFileSync(f, "utf8")))
      .filter((p) => p.keys.length > 0).length;
    // A regex that silently matches nothing would pass every assertion
    // below without ever reading a payload.
    expect(total).toBeGreaterThan(15);
  });

  it("carries identifiers, never values", () => {
    const offenders: string[] = [];
    for (const file of files) {
      for (const { keys, line } of payloadKeys(readFileSync(file, "utf8"))) {
        for (const key of keys) {
          if (key.endsWith("Id") || ALLOWED.has(key)) continue;
          offenders.push(`${file}:${line} -> ${key}`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });
});
