import * as React from "react";
import { cn } from "@/lib/utils";

export type DividerProps = React.HTMLAttributes<HTMLHRElement> & {
  inset?: boolean;
};

export function Divider({ className, inset = false, ...props }: DividerProps) {
  return (
    <hr
      className={cn(
        "border-t border-zinc-200",
        inset && "mx-6",
        className,
      )}
      {...props}
    />
  );
}

export default Divider;

