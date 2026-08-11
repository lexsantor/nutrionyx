"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

// Console error boundary: renders inside the persistent ConsoleShell layout,
// so navigation survives a content crash.
export default function ConsoleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("boundary");
  useEffect(() => {
    console.error("[console boundary]", error);
  }, [error]);

  return (
    <div className="flex flex-col items-start gap-4 py-10">
      <h1 className="font-display text-2xl font-semibold tracking-tight">
        {t("errorTitle")}
      </h1>
      <p className="max-w-sm text-sm text-ink-subtle">{t("errorText")}</p>
      <Button onClick={reset}>{t("retry")}</Button>
    </div>
  );
}
