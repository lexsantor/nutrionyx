import { describe, expect, it } from "vitest";
import { safeRedirect } from "./safe-redirect";

describe("safeRedirect", () => {
  it("allows same-origin paths", () => {
    expect(safeRedirect("/panel")).toBe("/panel");
    expect(safeRedirect("/auth/accept-invitation?invitationId=x")).toBe(
      "/auth/accept-invitation?invitationId=x",
    );
  });

  it("rejects protocol-relative and absolute URLs", () => {
    expect(safeRedirect("//evil.com")).toBe("/");
    expect(safeRedirect("https://evil.com")).toBe("/");
    expect(safeRedirect("/\\evil.com")).toBe("/");
  });

  it("rejects non-strings and empty values", () => {
    expect(safeRedirect(null)).toBe("/");
    expect(safeRedirect(undefined)).toBe("/");
    expect(safeRedirect("")).toBe("/");
  });
});
