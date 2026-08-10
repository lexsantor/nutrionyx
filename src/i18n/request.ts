import { getRequestConfig } from "next-intl/server";

// Single-locale setup (es) per ADR-0001: Spanish UI, i18n architecture
// from day one. Adding locales later means adding message files and a
// locale strategy here - no component changes.
export default getRequestConfig(async () => ({
  locale: "es",
  // Single-market app (ES): render every date/time in Madrid wall-clock
  // regardless of server timezone (Vercel runs UTC). Appointment inputs
  // are parsed with the same zone (modules/scheduling/time.ts).
  timeZone: "Europe/Madrid",
  messages: (await import("../../messages/es.json")).default,
}));
