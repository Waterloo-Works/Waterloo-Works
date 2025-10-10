"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function PageHeaderPortal({ children }: { children: React.ReactNode }) {
  const [target, setTarget] = useState<HTMLElement | null>(null);
  useEffect(() => {
    setTarget(document.getElementById("page-header-slot"));
  }, []);
  if (!target) return null;
  return createPortal(
    <div className="hidden md:flex items-center gap-3">{children}</div>,
    target
  );
}

