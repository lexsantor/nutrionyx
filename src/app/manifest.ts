import type { MetadataRoute } from "next";

/**
 * Web app manifest (roadmap 2026-08-14, Tier 1). The patient's space is the
 * daily screen and it lived in a browser tab; this makes it installable.
 *
 * **No service worker, so no offline.** Registering one would mean caching
 * authenticated clinical data in the browser of whatever device installed the
 * app, which is an Art. 9 decision for the owner rather than something to slip
 * in with an icon set. Installability itself no longer requires one.
 *
 * `start_url` is "/" rather than an area, because the landing already routes a
 * signed-in visitor by domain role (`roleHome`): a specialist lands in the
 * console and a patient in their space, from the same installed shortcut.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Nutrionyx",
    short_name: "Nutrionyx",
    description:
      "Tu dieta, tu entreno y tu seguimiento con tu consulta, en un solo sitio.",
    lang: "es",
    start_url: "/",
    scope: "/",
    display: "standalone",
    // The default canvas and the ink of the NORTE tokens. A single pair, not a
    // theme-aware one: the app's dark mode is an explicit choice kept in
    // localStorage, and a manifest cannot read it.
    background_color: "#f5f8fa",
    theme_color: "#f5f8fa",
    categories: ["health", "medical", "lifestyle"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
