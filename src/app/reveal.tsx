"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Scroll-entry reveal (landing only). Content is visible by default -
 * JS hides it just-in-time only when it starts below the viewport, the
 * observer is available and reduced-motion is off, so SSR, no-JS and
 * headless renderers always see the page.
 */
export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"visible" | "hidden">("visible");

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return;

    setState("hidden");
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setState("visible");
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-state={state}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-[transform,opacity] duration-500 ease-house data-[state=hidden]:translate-y-12 data-[state=hidden]:opacity-0 ${className}`}
    >
      {children}
    </div>
  );
}
