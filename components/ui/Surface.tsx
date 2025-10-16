import * as React from "react";
import { cn } from "@/lib/utils";

export interface SurfaceProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * Soft card surface per design system.
 */
export function Surface({ className, ...props }: SurfaceProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-colors hover:border-zinc-300",
        className,
      )}
      {...props}
    />
  );
}

export default Surface;

