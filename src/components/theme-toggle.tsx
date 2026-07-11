"use client";

import { useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { Sun } from "reicon-react/icons/Sun";
import { Moon } from "reicon-react/icons/Moon";

const STORAGE_KEY = "nutrionyx-theme";
const EVENT = "nutrionyx-theme-change";

// The theme is external DOM state ([data-theme] on <html>). Read it with
// useSyncExternalStore so React stays in sync without setState-in-effect and
// SSR renders the deterministic light snapshot (design.md 18.2).
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
      role="switch"
      aria-checked={dark}
      aria-label={t(dark ? "themeLight" : "themeDark")}
      onClick={toggle}
      className="relative inline-flex h-7 w-12 items-center rounded-full border border-hairline bg-surface-3 transition-colors"
    >
      <span
        className={`inline-flex size-5 items-center justify-center rounded-full bg-surface-1 text-ink-subtle shadow-sm transition-transform ${
          dark ? "translate-x-6" : "translate-x-1"
        }`}
      >
        {dark ? (
          <Moon size={14} aria-hidden="true" />
        ) : (
          <Sun size={14} aria-hidden="true" />
        )}
      </span>
    </button>
  );
}
