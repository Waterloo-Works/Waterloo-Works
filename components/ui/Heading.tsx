"use client";

import { clsx } from "clsx";
import React from "react";

type Variant = "h2" | "h3";

type Props = {
  as?: Variant;
  className?: string;
  children: React.ReactNode;
};

/**
 * Design system Heading component. Strictly maps to our type scale.
 * - h2: 48px/1, letter-spacing -0.04em, header font
 * - h3: 36px/1, letter-spacing -0.02em, header font
 */
export function Heading({ as = "h2", className, children }: Props) {
  if (as === "h3") {
    return (
      <h3
        className={clsx(
          "font-header text-h3 tracking-tight-02 leading-heading",
          className,
        )}
      >
        {children}
      </h3>
    );
  }

  return (
    <h2
      className={clsx(
        "font-header text-h2 tracking-tight-04 leading-heading",
        className,
      )}
    >
      {children}
    </h2>
  );
}

export default Heading;
