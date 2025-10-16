import clsx from "clsx";

export default function Divider({ className }: { className?: string }) {
  return <div className={clsx("border-t border-zinc-200", className)} />;
}

