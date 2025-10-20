"use client";

import { useState } from "react";
import posthog from "posthog-js";
import { createClient } from "@/utils/supabase/client";

export default function LoginClient() {
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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

  const handleGitHub = async () => {
    posthog.capture("github_signin_clicked");
    try {
      const supabase = createClient();
      const searchParams = new URLSearchParams(window.location.search);
      const next = searchParams.get('next');
      const callbackUrl = next
        ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`
        : `${window.location.origin}/auth/callback`;
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: { redirectTo: callbackUrl }
      });
      if (error) return setError(error.message || "GitHub sign-in unavailable.");
      if (data?.url) window.location.href = data.url;
    } catch {
      setError("GitHub sign-in unavailable.");
    }
  };

  const handleLinkedIn = async () => {
    posthog.capture("linkedin_signin_clicked");
    try {
      const supabase = createClient();
      const searchParams = new URLSearchParams(window.location.search);
      const next = searchParams.get('next');
      const callbackUrl = next
        ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`
        : `${window.location.origin}/auth/callback`;
      const { data, error } = await supabase.auth.signInWithOAuth({
        // linkedin provider id can be 'linkedin' or 'linkedin_oidc' depending on project settings
        provider: "linkedin_oidc" as any,
        options: { redirectTo: callbackUrl }
      });
      if (error) return setError(error.message || "LinkedIn sign-in unavailable.");
      if (data?.url) window.location.href = data.url;
    } catch {
      setError("LinkedIn sign-in unavailable.");
    }
  };

  const handleEmailPassword = async () => {
    try {
      const supabase = createClient();
      setError(null);
      if (!email || !password) return setError("Please enter email and password.");
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return setError(error.message);
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) return setError(error.message);
        // Attempt immediate sign-in if confirmations are disabled
        await supabase.auth.signInWithPassword({ email, password }).catch(() => {});
      }
      // Redirect to callback (preserve next)
      const searchParams = new URLSearchParams(window.location.search);
      const next = searchParams.get('next');
      const target = next ? next : "/explore";
      window.location.href = target;
    } catch (e: any) {
      setError(e?.message || "Unable to authenticate with email/password.");
    }
  };

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm transition-all hover:border-zinc-300 hover:bg-zinc-50 hover:shadow-md">
      <h2 className="font-header text-2xl font-semibold text-zinc-900 mb-2">{mode === 'signin' ? 'Sign in' : 'Create account'}</h2>
      <p className="font-body text-zinc-700 mb-6 text-sm">Use email & password or continue with a provider.</p>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm font-body mb-4">{error}</div>
      )}

      {/* Email / Password */}
      <div className="space-y-3 mb-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-300"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-300"
        />
        <button onClick={handleEmailPassword} className="w-full px-6 py-2.5 bg-zinc-900 text-white rounded-full hover:bg-zinc-800 transition-colors font-medium">
          {mode === 'signin' ? 'Continue with Email' : 'Create account'}
        </button>
        <div className="text-center text-xs text-zinc-500">
          {mode === 'signin' ? (
            <>No account? <button className="underline" onClick={() => setMode('signup')}>Sign up</button></>
          ) : (
            <>Already have an account? <button className="underline" onClick={() => setMode('signin')}>Sign in</button></>
          )}
        </div>
      </div>

      {/* Google Sign-in */}
      <div className="grid grid-cols-1 gap-2">
        <button onClick={handleGoogle} className="w-full px-6 py-2.5 bg-zinc-900 text-white rounded-full hover:bg-zinc-800 transition-colors font-medium">Continue with Google</button>
        <button onClick={handleGitHub} className="w-full px-6 py-2.5 bg-zinc-900 text-white rounded-full hover:bg-zinc-800 transition-colors font-medium">Continue with GitHub</button>
        <button onClick={handleLinkedIn} className="w-full px-6 py-2.5 bg-zinc-900 text-white rounded-full hover:bg-zinc-800 transition-colors font-medium">Continue with LinkedIn</button>
      </div>
    </div>
  );
}
