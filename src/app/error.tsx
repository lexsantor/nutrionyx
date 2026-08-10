"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("boundary");
  useEffect(() => {
    console.error("[boundary]", error);
  }, [error]);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="font-display text-2xl font-semibold tracking-tight">
        {t("errorTitle")}
      </h1>
      <p className="max-w-sm text-sm text-ink-subtle">{t("errorText")}</p>
      <Button onClick={reset} className="mt-2">
        {t("retry")}
      </Button>
    </main>
  );
}
