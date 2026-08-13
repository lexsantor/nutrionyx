import type { MetadataRoute } from "next";

/**
 * Only what robots.ts allows. Listing a route here that `disallow` blocks is
 * a contradiction a crawler resolves in the crawler's favour, and the
 * authenticated areas have nothing to index anyway.
 *
 * The auth pages are inside the blocked `/auth` prefix on purpose: a sign-in
 * form is not a landing page, and indexing it splits the ranking of the one
 * page that should rank.
 */
const BASE = "https://nutrionyx.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  // Stamped at build time rather than per request: a lastModified that moves
  // on every crawl tells a crawler nothing and costs it a fetch.
  const lastModified = new Date("2026-08-13");

  return [
    { url: BASE, lastModified, changeFrequency: "weekly", priority: 1 },
    {
      url: `${BASE}/privacidad`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE}/terminos`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
