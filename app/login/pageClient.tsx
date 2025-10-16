"use client";

import { useState } from "react";
import posthog from "posthog-js";
import { createClient } from "@/utils/supabase/client";

export default function LoginClient() {
  const [error, setError] = useState<string | null>(null);

  const handleGoogle = async () => {
    posthog.capture("google_signin_clicked");
    try {
      const supabase = createClient();

      // Preserve the 'next' parameter if present
      const searchParams = new URLSearchParams(window.location.search);
      const next = searchParams.get('next');
      const callbackUrl = next
        ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`
        : `${window.location.origin}/auth/callback`;

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: callbackUrl,
          queryParams: { prompt: "select_account" },
        },
      });
      if (error) {
        setError(error.message || "Google sign-in is unavailable.");
        return;
      }
      if (data?.url) {
        window.location.href = data.url;
        return;
      }
      // Fallback: Supabase should handle redirect automatically, but guard anyway
      window.location.href = callbackUrl;
    } catch (e) {
      setError("Google sign-in is unavailable.");
    }
  };

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm transition-all hover:border-zinc-300 hover:bg-zinc-50 hover:shadow-md">
      <h2 className="font-header text-2xl font-semibold text-zinc-900 mb-2">Sign in</h2>
      <p className="font-body text-zinc-700 mb-6 text-sm">
        Sign in with your Google account to get started.
      </p>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm font-body mb-4">{error}</div>
      )}

      {/* Google Sign-in */}
      <button
        onClick={handleGoogle}
        className="w-full px-6 py-2.5 bg-zinc-900 text-white rounded-full hover:bg-zinc-800 transition-colors font-medium"
      >
        Continue with Google
      </button>
    </div>
  );
}
