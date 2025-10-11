"use client";

import { useState } from "react";
import posthog from "posthog-js";
import { createClient } from "@/utils/supabase/client";

export default function LoginClient() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
        posthog.capture("login_magic-link_failed", { email: normalized, error_message: errorMessage });
        return;
      }
      posthog.capture("login_magic-link_requested", { email: normalized });
      window.location.href = "/auth/check-email";
    } catch (err) {
      const errorMessage = "Something went wrong. Please try again.";
      setError(errorMessage);
      posthog.capture("login_magic-link_failed", { email: normalized, error_message: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    posthog.capture("google_signin_clicked");
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
    <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm transition-all hover:border-zinc-300 hover:bg-zinc-50 hover:shadow-md">
      <h2 className="font-title text-2xl font-semibold text-zinc-900 mb-2">Sign in</h2>
      <p className="font-body text-zinc-700 mb-6 text-sm">
        Sign in with Google or use a magic link sent to your email.
      </p>

      {/* Google Sign-in (prioritized) */}
      <button
        onClick={handleGoogle}
        className="w-full px-6 py-2.5 bg-zinc-900 text-white rounded-full hover:bg-zinc-800 transition-colors font-medium mb-4"
      >
        Continue with Google
      </button>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-zinc-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-zinc-500 font-body">or use magic link</span>
        </div>
      </div>

      {/* Magic Link Form */}
      <form onSubmit={handleSendMagicLink} className="space-y-3">
        <input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2.5 border border-zinc-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-zinc-300 font-body text-sm transition-all"
          required
        />
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm font-body">{error}</div>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full px-6 py-2.5 border border-zinc-200 bg-white text-zinc-900 rounded-full hover:bg-zinc-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm"
        >
          {loading ? "Sending..." : "Send magic link"}
        </button>
      </form>
    </div>
  );
}
