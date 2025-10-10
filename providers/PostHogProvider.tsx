"use client"

import posthog from "posthog-js"
import { PostHogProvider as PHProvider } from "posthog-js/react"
import { useEffect } from "react"

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Prefer a short path "/ph" to avoid some content blockers.
    const apiHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || "/ph";
    try {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
        api_host: apiHost,
        ui_host: "https://us.posthog.com",
        defaults: '2025-05-24',
        capture_exceptions: true,
        // Keep debug off to avoid noisy console errors when blockers are active
        debug: false,
        persistence: "memory",
      });
    } catch {
      // If a content blocker interferes, gracefully disable capturing
      posthog.opt_out_capturing();
    }
  }, [])

  return (
    <PHProvider client={posthog}>
      {children}
    </PHProvider>
  )
}
