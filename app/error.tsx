"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Global route error:", error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="mx-auto max-w-3xl px-8 py-20">
          <h1 className="font-title text-2xl font-semibold text-zinc-900">Something went wrong</h1>
          <p className="mt-2 font-body text-zinc-600">Try reloading this page. If you use Safari, temporarily disable extensions and refresh.</p>
          <div className="mt-6 flex items-center gap-3">
            <button onClick={reset} className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-800 hover:bg-zinc-50">
              Reload page
            </button>
            <Link href="/" className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-800 hover:bg-zinc-50">Go home</Link>
          </div>
          {process.env.NODE_ENV !== "production" && (
            <pre className="mt-6 overflow-auto rounded-xl border border-zinc-200 bg-white p-4 text-xs text-zinc-700 shadow-sm">
              {String(error?.stack || error?.message)}
            </pre>
          )}
        </div>
      </body>
    </html>
  );
}
