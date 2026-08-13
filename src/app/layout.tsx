import type { Metadata } from "next";
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
        {/* Vercel Web Analytics, as the script rather than @vercel/analytics.
            Installing the package rewrote package-lock.json and dropped the
            next-intl/@swc/helpers entry that CI's `npm ci` needs — the exact
            failure tasks/todo.md warns about — and the package's only real
            advantage here is counting client-side route changes, which a
            single-page landing does not have.

            No cookies, so it adds no consent obligation. It only reports once
            Web Analytics is enabled on the Vercel project; until then the
            script 404s silently and nothing else breaks. */}
        <script defer src="/_vercel/insights/script.js" />
      </body>
    </html>
  );
}
