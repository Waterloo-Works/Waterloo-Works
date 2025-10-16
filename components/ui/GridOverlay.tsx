"use client";

import clsx from "clsx";
import type { CSSProperties } from "react";

type Props = {
  height?: number | string;
  fullHeight?: boolean;
  showTopTicks?: boolean;
  showBottomTicks?: boolean;
  variant?: "full" | "sides";
  showNodes?: boolean;
  className?: string;
  style?: CSSProperties;
};

export default function GridOverlay({
  height = 160,
  fullHeight = false,
  showTopTicks = true,
  showBottomTicks = false,
  variant = "full",
  showNodes = true,
  className,
  style: styleProp,
}: Props) {
  const style = fullHeight ? { height: "100svh" } : { height };
  return (
    <div
      aria-hidden
      className={clsx(
        "pointer-events-none absolute inset-x-0 top-0 hidden md:block",
        className
      )}
      style={styleProp}
    >
      {variant === "full" ? (
        <div className="grid-overlay-vert opacity-50" style={style} />
      ) : (
        <div className="grid-overlay-sides opacity-60" style={style} />
      )}

      {/* Tickers */}
      {showTopTicks && <div className="grid-overlay-ticks h-6 opacity-60" />}
      {showBottomTicks && <div className="grid-overlay-ticks-bottom h-6 opacity-60" />}
      {showNodes && variant === "sides" && (
        <div className="grid-overlay-nodes" />
      )}
    </div>
  );
}
