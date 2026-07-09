import { describe, expect, it } from "vitest";
import { orgSlug, slugify } from "./slug";

describe("slugify", () => {
  it("strips Spanish diacritics and lowercases", () => {
    expect(slugify("Consulta María José")).toBe("consulta-maria-jose");
  });

  it("collapses symbols and trims dashes", () => {
    expect(slugify("  Núñez & Asociados!  ")).toBe("nunez-asociados");
  });

  it("falls back for names with no usable characters", () => {
    expect(slugify("¡¡¡")).toBe("org");
  });

  it("caps the base length at 40 characters", () => {
    expect(slugify("a".repeat(80)).length).toBe(40);
  });
});

describe("orgSlug", () => {
  it("appends a 4-character suffix", () => {
    const slug = orgSlug("Clínica Delta");
    expect(slug).toMatch(/^clinica-delta-[a-z0-9]{4}$/);
  });
});
