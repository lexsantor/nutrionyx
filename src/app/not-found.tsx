import { getTranslations } from "next-intl/server";
import { ButtonLink } from "@/components/ui/button-link";

export default async function NotFound() {
  const t = await getTranslations("boundary");
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="font-display text-6xl font-semibold text-ink-tertiary">
        404
      </p>
      <h1 className="font-display text-2xl font-semibold tracking-tight">
        {t("notFoundTitle")}
      </h1>
      <p className="max-w-sm text-sm text-ink-subtle">{t("notFoundText")}</p>
      <ButtonLink href="/" variant="primary" className="mt-2">
        {t("back")}
      </ButtonLink>
    </main>
  );
}
