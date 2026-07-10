import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { GeistMono } from "geist/font/mono";
import "@fontsource-variable/syne";
import "@fontsource-variable/dm-sans";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nutrionyx",
  description: "Plataforma de nutrición para profesionales",
};

// Set the theme before first paint to avoid a flash (design.md 18.2).
const themeInit = `(function(){try{if(localStorage.getItem('nutrionyx-theme')==='dark')document.documentElement.dataset.theme='dark';}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${GeistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
