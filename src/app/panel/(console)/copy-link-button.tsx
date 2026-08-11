"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

/** Copies an invite link; confirmation swaps the label for a moment. */
export function CopyLinkButton({ text }: { text: string }) {
  const t = useTranslations("panel.invitations");
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          // Clipboard unavailable (permissions/http): leave the link selectable.
        }
      }}
      className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border border-hairline bg-surface-1 px-3 text-xs font-semibold text-ink transition-[transform,background-color,border-color] hover:border-hairline-strong hover:bg-surface-2 active:scale-[0.97] active:duration-150"
    >
      {copied ? (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>
      ) : (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
      )}
      <span aria-live="polite">{copied ? t("copied") : t("copy")}</span>
    </button>
  );
}
