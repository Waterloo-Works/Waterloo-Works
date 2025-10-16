"use client";

import clsx from "clsx";

type Props = {
  height?: number | string;
  fullHeight?: boolean;
  showBottomTicks?: boolean;
  variant?: "full" | "sides";
  className?: string;
};

export default function GridOverlay({
  height = 160,
  fullHeight = false,
  showBottomTicks = false,
  variant = "full",
  className,
}: Props) {
  const style = fullHeight ? { height: "100svh" } : { height };
  return (
    <div
      aria-hidden
      className={clsx(
        "pointer-events-none absolute inset-x-0 top-0 hidden md:block",
        className
      )}
    >
      {variant === "full" ? (
        <>
          {/* Vertical columns + center line */}
          <div className="grid-overlay-vert opacity-50" style={style} />
          {/* Top tick marks row */}
          <div className="grid-overlay-ticks h-6 opacity-60" />
          {/* Bottom tick marks row (optional) */}
          {showBottomTicks && (
            <div className="grid-overlay-ticks-bottom h-6 opacity-60" />
          )}
        </>
      ) : (
        <>
          {/* Side-only vertical rails aligned to content container */}
          <div className="grid-overlay-sides opacity-60" style={style} />
        </>
      )}
    </div>
  );
}
