"use client";

import { useEffect, useRef } from "react";

/** Chat convention: land on the newest message, not the oldest. */
export function ScrollAnchor() {
  const ref = useRef<HTMLLIElement>(null);
  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: "instant", block: "end" });
  }, []);
  return <li ref={ref} aria-hidden="true" className="h-0 list-none" />;
}
