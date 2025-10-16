import * as React from "react";
import { cn } from "@/lib/utils";

export interface ChipProps extends React.HTMLAttributes<HTMLSpanElement> {}

/**
 * Quiet chip per design system.
 */
export function Chip({ className, ...props }: ChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-zinc-200 bg-white px-3 py-1 text-sm text-zinc-800",
        className,
      )}
      {...props}
    />
  );
}

export default Chip;

