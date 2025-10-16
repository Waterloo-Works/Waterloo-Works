import clsx from "clsx";
import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

type Props<T extends ElementType> = {
  as?: T;
  children: ReactNode;
  size?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  className?: string;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "children">;

const sizeClasses: Record<NonNullable<Props<"h2">["size"]>, string> = {
  h1: "text-4xl md:text-5xl",
  h2: "text-3xl md:text-4xl",
  h3: "text-2xl md:text-3xl",
  h4: "text-xl md:text-2xl",
  h5: "text-lg md:text-xl",
  h6: "text-base md:text-lg",
};

export function Heading<T extends ElementType = "h2">({
  as,
  children,
  size = "h3",
  className,
  ...rest
}: Props<T>) {
  const Comp = (as || size) as ElementType;
  return (
    <Comp
      className={clsx("font-title tracking-tight text-zinc-900", sizeClasses[size], className)}
      {...rest}
    >
      {children}
    </Comp>
  );
}

export default Heading;

