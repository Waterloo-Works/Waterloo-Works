"use client";

import { clsx } from "clsx";
import React from "react";

type Size = "sm" | "md" | "lg";

type Props = {
  size?: Size;
  className?: string;
  children: React.ReactNode;
};

/**
 * Design system Text primitive for body copy.
 */
export function Text({ size = "md", className, children }: Props) {
  const sizeClass =
    size === "sm" ? "text-sm" : size === "lg" ? "text-lg" : "text-base";
  return (
    <p className={clsx("font-body tracking-wide-01 leading-body", sizeClass, className)}>
      {children}
    </p>
  );
}

export default Text;
