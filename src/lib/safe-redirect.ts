/**
 * Only same-origin path redirects are allowed (prevents open redirects).
 */
export function safeRedirect(target: unknown, fallback = "/"): string {
  if (
    typeof target === "string" &&
    target.startsWith("/") &&
    !target.startsWith("//") &&
    !target.includes("\\")
  ) {
    return target;
  }
  return fallback;
}
