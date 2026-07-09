/**
 * URL-friendly slug from an organization name (Spanish-aware:
 * strips diacritics, lowercases, collapses non-alphanumerics).
 * A random suffix avoids collisions without a availability round-trip.
 */
export function slugify(name: string): string {
  const base = name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return base.length > 0 ? base : "org";
}

export function orgSlug(name: string): string {
  return `${slugify(name)}-${randomSuffix(4)}`;
}

function randomSuffix(length: number): string {
  const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  for (let i = 0; i < length; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}
