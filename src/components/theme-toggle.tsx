"use client";

import { useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";

const STORAGE_KEY = "nutrionyx-theme";
const EVENT = "nutrionyx-theme-change";

// The theme is external DOM state ([data-theme] on <html>, set by the
// anti-FOUC script and by this toggle). Read it with useSyncExternalStore
// so React stays in sync without a setState-in-effect, and SSR renders the
// deterministic light snapshot (design.md 18.2).
function subscribe(callback: () => void) {
  window.addEventListener(EVENT, callback);
  return () => window.removeEventListener(EVENT, callback);
}

function getSnapshot() {
  return document.documentElement.dataset.theme === "dark";
}

function getServerSnapshot() {
  return false;
}

export function ThemeToggle() {
  const t = useTranslations("common");
  const dark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function toggle() {
    const root = document.documentElement;
    const next = !(root.dataset.theme === "dark");
    if (next) root.dataset.theme = "dark";
    else delete root.dataset.theme;
    try {
      localStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
    } catch {
      // storage unavailable (private mode); the toggle still works this session
    }
    window.dispatchEvent(new Event(EVENT));
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={t(dark ? "themeLight" : "themeDark")}
      className="grid size-11 place-items-center rounded-full border border-hairline bg-surface-1 text-ink-subtle transition-colors hover:text-ink"
    >
      {dark ? (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
      ) : (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </svg>
      )}
    </button>
  );
}
