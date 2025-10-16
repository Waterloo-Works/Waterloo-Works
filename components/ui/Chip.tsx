import clsx from "clsx";
import type { HTMLAttributes, ReactNode } from "react";

type Props = HTMLAttributes<HTMLSpanElement> & {
  children: ReactNode;
};

export default function Chip({ className, children, ...rest }: Props) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border border-zinc-200 bg-white px-3 py-1 text-sm text-zinc-700",
        className
      )}
      {...rest}
    >
      {children}
    </span>
  );
}

