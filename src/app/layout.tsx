import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";
import "@fontsource-variable/syne";
import "@fontsource-variable/dm-sans";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://nutrionyx.vercel.app"),
  title: { default: "Nutrionyx", template: "%s · Nutrionyx" },
  description:
    "La ficha única del paciente para nutricionistas: evaluación, dieta, entreno, medicación, mensajes y citas en un solo lugar. RGPD por diseño.",
  openGraph: {
    type: "website",
    locale: "es_ES",
    siteName: "Nutrionyx",
    title: "Nutrionyx",
    description:
      "La ficha única del paciente para nutricionistas: evaluación, dieta, entreno, medicación, mensajes y citas en un solo lugar.",
  },
  // Safari ignores the manifest for the home screen: without this, installing
  // on an iPhone opens a Safari chrome with a screenshot for an icon, and
  // "installable" would mean Android only.
  appleWebApp: {
    capable: true,
    title: "Nutrionyx",
    statusBarStyle: "default",
  },
  // `appleWebApp.capable` emits the standardised `mobile-web-app-capable`,
  // not Apple's legacy prefixed name. Which one WebKit honours today could
  // not be verified here without an iOS device, so both go out: one line, and
  // the answer stops mattering.
  other: { "apple-mobile-web-app-capable": "yes" },
};

// Set the theme before first paint to avoid a flash (design.md 18.2).
const themeInit = `(function(){try{if(localStorage.getItem('nutrionyx-theme')==='dark')document.documentElement.dataset.theme='dark';}catch(e){}})();`;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Explicit locale: without it the client provider falls back to the
  // default and every client-rendered locale-dependent element drifts
  // from the server HTML.
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider locale={locale}>{children}</NextIntlClientProvider>
        {/* Vercel Web Analytics. This was a bare <script src="/_vercel/
            insights/script.js"> for a while, to dodge the lockfile trap in
            tasks/lessons.md — installing the package rewrote package-lock.json
            and CI's `npm ci` failed. The dodge never worked: that path 404s
            even with Analytics switched on for the project, and served the
            app's own HTML, so every page loaded a document as JavaScript.

            The trap turned out to be stale. It came from next-intl declaring
            @swc/helpers and npm nesting a second copy; next-intl 4.13.1 does
            not declare it at all, the lockfile no longer records it, and a
            real `npm ci` passes.

            No cookies, so it adds no consent obligation. */}
        <Analytics />
      </body>
    </html>
  );
}
