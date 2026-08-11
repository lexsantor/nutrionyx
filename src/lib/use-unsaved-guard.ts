"use client";

import { useEffect } from "react";

/**
 * Warns before leaving with unsaved edits: beforeunload for tab close /
 * reload / external nav, plus a capture-phase click guard for in-app links
 * (App Router has no route-change event to intercept). The link guard uses
 * window.confirm deliberately - the beforeunload dialog is native anyway,
 * and a two-step pattern cannot wrap arbitrary links.
 */
export function useUnsavedGuard(dirty: boolean, message: string) {
  useEffect(() => {
    if (!dirty) return;

    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    const onClickCapture = (e: MouseEvent) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const anchor = (e.target as Element).closest?.(
        'a[href^="/"], a[href^="."]',
      );
      if (!anchor) return;
      if (!window.confirm(message)) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("click", onClickCapture, true);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("click", onClickCapture, true);
    };
  }, [dirty, message]);
}
