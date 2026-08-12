/**
 * Shared by the diet and training templates; both cap names the same.
 *
 * This lives in a plain module on purpose. It used to be exported from
 * components/template-bar.tsx, which carries "use client": imported into a
 * server action the export is not the number but a client reference, so
 * `name.slice(0, TEMPLATE_NAME_MAX)` coerced to NaN and returned "". Every
 * "save as template" then failed with "name required" while the name sat
 * filled in on screen. A constant shared across the server boundary cannot
 * live in a client component.
 */
export const TEMPLATE_NAME_MAX = 80;
