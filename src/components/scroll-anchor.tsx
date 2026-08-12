"use client";

import { useEffect, useRef } from "react";

/** Chat convention: land on the newest message and follow appended ones. */
export function ScrollAnchor({ watch }: { watch?: unknown }) {
  const ref = useRef<HTMLLIElement>(null);
  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: "instant", block: "end" });
  }, [watch]);
  return <li ref={ref} aria-hidden="true" className="h-0 list-none" />;
}
