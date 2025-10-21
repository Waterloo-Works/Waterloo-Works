"use client";

import { useState } from "react";
import posthog from "posthog-js";
import { createClient } from "@/utils/supabase/client";

export default function LoginClient() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [newsletterConsent, setNewsletterConsent] = useState(false);

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

  const handleEmailPassword = async () => {
    try {
      const supabase = createClient();
      setError(null);
      setSuccess(null);
      if (!email || !password) return setError("Please enter email and password.");
      if (mode === "signup" && !newsletterConsent) {
        return setError("Please agree to receive newsletter updates to continue.");
      }
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          setError(error.message);
          return;
        }
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) return setError(error.message);
        // Attempt immediate sign-in if confirmations are disabled
        await supabase.auth.signInWithPassword({ email, password }).catch(() => {});
      }
      // Redirect to callback (preserve next)
      const searchParams = new URLSearchParams(window.location.search);
      const next = searchParams.get('next');
      // For new signups, add onboarding parameter to trigger modal
      const baseTarget = next ? next : '/explore';
      const target = mode === 'signup' ? `${baseTarget}?onboarding=true` : baseTarget;
      window.location.href = target;
    } catch (e: any) {
      setError(e?.message || "Unable to authenticate with email/password.");
    }
  };

  const handleForgotPassword = async () => {
    try {
      const supabase = createClient();
      setError(null);
      setSuccess(null);
      if (!email) return setError("Please enter your email.");

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?reset=true`,
      });

      if (error) return setError(error.message);

      setSuccess("Check your email for a password reset link!");
      posthog.capture("password_reset_requested");
    } catch (e: any) {
      setError(e?.message || "Unable to send reset link.");
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-8 md:p-10 shadow-xl">
      <h2 className="font-header text-3xl md:text-4xl font-medium text-foreground mb-3">
        {mode === 'signin' ? 'Sign in' : 'Create account'}
      </h2>
      <p className="font-body text-muted-foreground mb-8 text-base">
        {mode === 'signin' ? 'Welcome back to Waterloo App' : 'Join Waterloo App'}
      </p>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm font-body mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm font-body mb-4">
          {success}
        </div>
      )}

      {/* Show forgot password flow if needed */}
      {showForgotPassword ? (
        <div className="space-y-4 mb-6">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleForgotPassword()}
            className="w-full rounded-lg border border-input bg-background px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground focus:border-transparent transition-all"
          />
          <button
            onClick={handleForgotPassword}
            className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all font-medium text-base"
          >
            Send reset link
          </button>
          <div className="text-center text-xs text-muted-foreground">
            <button
              className="underline hover:text-foreground transition-colors"
              onClick={() => {
                setShowForgotPassword(false);
                setSuccess(null);
                setError(null);
              }}
            >
              Back to sign in
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Email / Password */}
          <div className="space-y-4 mb-6">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleEmailPassword()}
              className="w-full rounded-lg border border-input bg-background px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground focus:border-transparent transition-all"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleEmailPassword()}
              className="w-full rounded-lg border border-input bg-background px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground focus:border-transparent transition-all"
            />
            {mode === 'signin' && (
              <div className="text-sm text-right -mt-1">
                <button
                  className="text-muted-foreground hover:text-foreground underline transition-colors"
                  onClick={() => setShowForgotPassword(true)}
                >
                  Forgot password?
                </button>
              </div>
            )}
            {mode === 'signup' && (
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newsletterConsent}
                  onChange={(e) => setNewsletterConsent(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-input text-primary focus:ring-2 focus:ring-foreground focus:ring-offset-0"
                />
                <span className="text-sm text-muted-foreground leading-relaxed">
                  I agree to receive newsletter updates and job alerts from Waterloo App
                </span>
              </label>
            )}
            <button
              onClick={handleEmailPassword}
              className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all font-medium text-base"
            >
              {mode === 'signin' ? 'Sign in' : 'Create account'}
            </button>
            <div className="text-center text-sm text-muted-foreground pt-1">
              {mode === 'signin' ? (
                <>
                  Don&apos;t have an account?{' '}
                  <button className="underline hover:text-foreground transition-colors" onClick={() => {
                    setMode('signup');
                    setError(null);
                    setNewsletterConsent(false);
                  }}>
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button className="underline hover:text-foreground transition-colors" onClick={() => {
                    setMode('signin');
                    setError(null);
                  }}>
                    Sign in
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-card px-4 text-muted-foreground">Or</span>
            </div>
          </div>

          {/* Google Sign-in */}
          <button
            onClick={handleGoogle}
            className="w-full px-6 py-3 bg-card border border-input text-foreground rounded-lg hover:bg-muted transition-all font-medium text-base flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>
        </>
      )}
    </div>
  );
}
