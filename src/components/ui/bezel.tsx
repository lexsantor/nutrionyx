import type { ReactNode } from "react";

/**
 * Double-bezel enclosure: the house signature (an instrument plate sitting
 * in its tray). Outer shell carries the tint, hairline and depth; the inner
 * core carries the surface and a top inner highlight. Radii are concentric
 * (inner = outer - padding), so pass both together when overriding.
 */
export function Bezel({
  children,
  className = "",
  innerClassName = "",
  radius = "2rem",
}: {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
  radius?: string;
}) {
  return (
    <div
      style={{ borderRadius: radius }}
      className={`border border-hairline bg-ink/[0.04] p-1.5 shadow-el-bezel ${className}`}
    >
      <div
        style={{ borderRadius: `calc(${radius} - 0.375rem)` }}
        className={`bg-surface-1 shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)] ${innerClassName}`}
      >
        {children}
      </div>
    </div>
  );
}
