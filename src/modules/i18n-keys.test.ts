import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import messages from "../../messages/es.json";

/**
 * Guards the class of bug that shipped a raw `medication.next.logCta`
 * onto the patient home: a dead-key sweep matched the literal `"logCta"`,
 * but the call site reads `t("next.logCta")` under a `medication`
 * namespace, so the key looked unused and was deleted.
 *
 * Per file, learn which identifiers are translators and what namespace
 * each one carries, then resolve every literal key they are called with.
 * Template-literal keys are dynamic by construction and out of scope.
 */

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (entry === "generated") continue;
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) walk(path, out);
    else if (/\.tsx?$/.test(path) && !/\.test\.tsx?$/.test(path)) out.push(path);
  }
  return out;
}

function hasKey(path: string): boolean {
  let node: unknown = messages;
  for (const part of path.split(".")) {
    if (!node || typeof node !== "object") return false;
    node = (node as Record<string, unknown>)[part];
  }
  return node !== undefined;
}

describe("i18n keys", () => {
  it("resolves every literal translation key against messages/es.json", () => {
    const missing: string[] = [];

    for (const file of walk(join(process.cwd(), "src"))) {
      const source = readFileSync(file, "utf8");

      // const t = useTranslations("ns") | await getTranslations("ns").
      // One file can declare the same name in sibling component scopes
      // with different namespaces, so collect every candidate: a key is
      // satisfied if it resolves under any of them.
      const translators = new Map<string, Set<string>>();
      const decl =
        /const\s+(\w+)\s*=\s*(?:await\s+)?(?:useTranslations|getTranslations)\(\s*(?:"([^"]*)")?\s*\)/g;
      for (const m of source.matchAll(decl)) {
        const set = translators.get(m[1]) ?? new Set<string>();
        set.add(m[2] ?? "");
        translators.set(m[1], set);
      }
      if (translators.size === 0) continue;

      for (const [name, namespaces] of translators) {
        const call = new RegExp(
          `\\b${name}(?:\\.rich)?\\(\\s*"([^"]+)"`,
          "g",
        );
        for (const m of source.matchAll(call)) {
          const key = m[1];
          const candidates = [...namespaces].map((ns) =>
            ns ? `${ns}.${key}` : key,
          );
          if (!candidates.some(hasKey)) {
            missing.push(
              `${file.replace(process.cwd() + "/", "")}: ${candidates.join(" | ")}`,
            );
          }
        }
      }
    }

    expect(missing).toEqual([]);
  });
});
