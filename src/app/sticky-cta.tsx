"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/**
 * The landing's action, kept within thumb reach on a phone.
 *
 * It appears only once the hero's own CTA has scrolled away, so it never
 * competes with the button it duplicates, and it is hidden from sm up where
 * the nav bar already carries one. Rendered but translated off-screen rather
 * than mounted on scroll: a bar that pops into existence shifts nothing, but
 * one that animates in from below reads as deliberate.
 *
 * No JS, no bar. That is the right failure: the hero CTA and the nav are
 * both server-rendered.
 */
export function StickyCta({
  label,
  anchorId,
}: {
  label: string;
  /** The hero's own CTA. The bar shows once this scrolls away. */
  anchorId: string;
}) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = document.getElementById(anchorId);
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => setShown(!entry.isIntersecting),
      { rootMargin: "-120px 0px 0px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [anchorId]);

  // Rendered at the end of <main>, never inside the hero: an ancestor with a
  // transform makes `fixed` resolve against that ancestor instead of the
  // viewport, and the bar came out pinned over the nav rather than at the
  // bottom. The anchor stays in the hero; only the bar moved.
  return (
    <div
        className={`pointer-events-none fixed inset-x-0 bottom-0 z-30 p-4 transition-transform duration-500 ease-spring sm:hidden ${
          shown ? "translate-y-0" : "translate-y-[130%]"
        }`}
      >
      <Link
        href="/auth/sign-up"
        className="pointer-events-auto flex h-12 w-full items-center justify-center rounded-full bg-primary text-sm font-semibold text-on-primary no-underline shadow-el-lg"
      >
        {label}
      </Link>
    </div>
  );
}
