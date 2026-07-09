import { getRequestConfig } from "next-intl/server";

// Single-locale setup (es) per ADR-0001: Spanish UI, i18n architecture
// from day one. Adding locales later means adding message files and a
// locale strategy here - no component changes.
export default getRequestConfig(async () => ({
  locale: "es",
  messages: (await import("../../messages/es.json")).default,
}));
