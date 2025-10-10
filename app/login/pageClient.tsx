"use client";

import { useEffect, useMemo, useState } from "react";
import posthog from "posthog-js";
import type { AuthVariant } from "@/lib/exp/flags";
import { createClient } from "@/utils/supabase/client";

export default function LoginClient({ variant }: { variant: AuthVariant }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    posthog.capture("login_variant_impression", { variant });
    try {
      const exposureProps: Record<string, string> = {
        $feature_flag: "auth_flow_variant",
        $feature_flag_response: variant,
      } as unknown as Record<string, string>;
      posthog.capture("$feature_flag_called", exposureProps);
    } catch {}
  }, [variant]);

  const showGoogle = useMemo(() => variant === "open_google", [variant]);

  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const normalized = email.trim().toLowerCase();
    try {
      const res = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalized }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const errorMessage = body?.error || "Could not send magic link.";
        setError(errorMessage);
        posthog.capture("login_magic-link_failed", { email: normalized, error_message: errorMessage, variant });
        return;
      }
      posthog.capture("login_magic-link_requested", { email: normalized, variant });
      window.location.href = "/auth/check-email";
    } catch (err) {
      const errorMessage = "Something went wrong. Please try again.";
      setError(errorMessage);
      posthog.capture("login_magic-link_failed", { email: normalized, error_message: errorMessage, variant });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    posthog.capture("google_signin_clicked", { variant });
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
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
      window.location.href = `${window.location.origin}/auth/callback`;
    } catch (e) {
      setError("Google sign-in is unavailable.");
    }
  };

  return (
    <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-zinc-200">
      <h2 className="font-title text-3xl md:text-4xl font-semibold text-zinc-900 mb-2">Sign in</h2>
      <p className="font-body text-zinc-700 mb-4 text-sm">
        {variant === "alum_only"
          ? "We’ll email you a magic link. Only @uwaterloo.ca emails are accepted."
          : "We’ll email you a magic link, or use Google if you prefer."}
      </p>
      <form onSubmit={handleSendMagicLink} className="space-y-3">
        <input
          type="email"
          placeholder={variant === "alum_only" ? "name@uwaterloo.ca" : "your@email.com"}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2.5 border border-zinc-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-zinc-300"
          required
        />
        {error && (
          <div className="p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full px-6 py-2.5 bg-zinc-900 text-white rounded-full hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {loading ? "Sending..." : "Send magic link"}
        </button>
      </form>

      {showGoogle && (
        <div className="mt-4">
          <button
            onClick={handleGoogle}
            className="w-full px-6 py-2.5 bg-white ring-1 ring-zinc-200 text-zinc-900 rounded-full hover:bg-zinc-50 transition-colors font-medium"
          >
            Continue with Google
          </button>
        </div>
      )}
    </div>
  );
}
