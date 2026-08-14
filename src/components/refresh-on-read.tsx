"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Clears the sidebar's unread badge after a thread is opened.
 *
 * The count is read in the layout, and the App Router does not re-render a
 * shared layout when you navigate between its children: opening the thread
 * marked the messages read but the badge kept its old number until a full
 * reload. Measured, not assumed - it still said "1" after reading and moving
 * to another section.
 *
 * `router.refresh()` re-fetches the layout too. It fires once and cannot
 * loop: `when` is computed from the unread count taken *before* the page
 * marked them read, so the render it triggers passes false.
 *
 * Marking read still happens on the server during render, so it works with
 * no JavaScript; only the badge's freshness depends on this.
 */
export function RefreshOnRead({ when }: { when: boolean }) {
  const router = useRouter();
  useEffect(() => {
    if (when) router.refresh();
  }, [when, router]);
  return null;
}
