"use client";

import clsx from "clsx";

type Props = {
  height?: number;
  className?: string;
};

export default function GridOverlay({ height = 160, className }: Props) {
  return (
    <div
      aria-hidden
      className={clsx(
        "pointer-events-none absolute inset-x-0 top-0 hidden md:block",
        className
      )}
    >
      {/* Vertical columns + center line */}
      <div
        className="grid-overlay-vert opacity-50"
        style={{ height }}
      />
      {/* Top tick marks row */}
      <div className="grid-overlay-ticks h-6 opacity-60" />
    </div>
  );
}

