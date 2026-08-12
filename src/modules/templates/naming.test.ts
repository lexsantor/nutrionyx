import { describe, expect, it } from "vitest";
import { TEMPLATE_NAME_MAX } from "@/components/template-bar";
import { nextCopyName } from "./naming";

describe("nextCopyName", () => {
  it("suffixes the first copy and numbers the rest", () => {
    expect(nextCopyName("Volumen", [])).toBe("Volumen (copia)");
    expect(nextCopyName("Volumen", ["Volumen (copia)"])).toBe("Volumen (copia 2)");
    expect(
      nextCopyName("Volumen", ["Volumen (copia)", "Volumen (copia 2)"]),
    ).toBe("Volumen (copia 3)");
  });

  it("does not stack suffixes when copying a copy", () => {
    expect(nextCopyName("Volumen (copia)", ["Volumen (copia)"])).toBe(
      "Volumen (copia 2)",
    );
    expect(nextCopyName("Volumen (copia 3)", ["Volumen (copia)"])).toBe(
      "Volumen (copia 2)",
    );
  });

  it("ignores case when deciding a name is taken", () => {
    expect(nextCopyName("Volumen", ["volumen (COPIA)"])).toBe("Volumen (copia 2)");
  });

  it("trims the base, never the suffix, so the result stays unique", () => {
    const long = "x".repeat(TEMPLATE_NAME_MAX);
    const first = nextCopyName(long, []);
    expect(first.length).toBeLessThanOrEqual(TEMPLATE_NAME_MAX);
    expect(first.endsWith("(copia)")).toBe(true);

    const second = nextCopyName(long, [first]);
    expect(second.length).toBeLessThanOrEqual(TEMPLATE_NAME_MAX);
    expect(second).not.toBe(first);
  });

  it("never returns the source name, which callers always pass as taken", () => {
    // The real invariant: a copy that keeps the original's name would
    // overwrite it on upsert. Callers pass every existing name, source
    // included, so the source is always in `taken`.
    for (const source of ["Volumen", "(copia)", "  ", "x".repeat(200)]) {
      expect(nextCopyName(source, [source])).not.toBe(source);
    }
  });
});
