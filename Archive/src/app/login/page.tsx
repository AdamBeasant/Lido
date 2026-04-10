"use client";

import { Suspense, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [magicSent, setMagicSent] = useState(false);
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") || "/";
  const mode = (searchParams.get("mode") as "signin" | "signup" | "magic") || "signin";
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?returnTo=${encodeURIComponent(returnTo)}`,
          },
        });
        if (error) {
          setError(error.message);
        } else {
          router.push(returnTo);
        }
      } else if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          setError(error.message);
        } else {
          router.push(returnTo);
        }
      } else {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?returnTo=${encodeURIComponent(returnTo)}`,
          },
        });
        if (error) {
          setError(error.message);
        } else {
          setMagicSent(true);
        }
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    }

    setLoading(false);
  }

  async function handleGoogleLogin() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?returnTo=${encodeURIComponent(returnTo)}`,
      },
    });
  }

  if (magicSent) {
    return (
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-sm text-center space-y-4 py-8">
          <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          </div>
          <p className="text-neutral-900 font-medium">Check your email</p>
          <p className="text-neutral-500 text-sm">
            We sent a sign-in link to <span className="font-medium text-neutral-700">{email}</span>
          </p>
          <Link
            href="/login"
            className="text-sm text-blue-500 hover:text-blue-600 inline-block py-2"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 py-12" style={{ WebkitOverflowScrolling: "touch" }}>
      <div className="w-full max-w-sm mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-neutral-900">
            Lido
          </h1>
          <p className="text-neutral-500 text-sm">
            Your holiday companion
          </p>
        </div>

        <div className="space-y-6">
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full h-12 flex items-center justify-center gap-2 border border-neutral-200 rounded-xl text-neutral-700 font-medium hover:bg-neutral-50 active:bg-neutral-100 transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-neutral-200" />
            <span className="text-xs text-neutral-400 uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-neutral-200" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 outline-none focus:border-neutral-400 focus:ring-1 focus:ring-neutral-400 transition-colors"
                style={{ fontSize: "16px" }}
                autoComplete="email"
              />
            </div>

            {mode !== "magic" && (
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 outline-none focus:border-neutral-400 focus:ring-1 focus:ring-neutral-400 transition-colors"
                  style={{ fontSize: "16px" }}
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  minLength={6}
                />
              </div>
            )}

            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-neutral-900 text-white font-medium rounded-xl hover:bg-neutral-800 active:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              {loading
                ? "Loading..."
                : mode === "signup"
                ? "Create account"
                : mode === "magic"
                ? "Send magic link"
                : "Sign in"}
            </button>
          </form>

          <div className="flex flex-col items-center gap-3 pb-8">
            {mode === "signin" && (
              <>
                <Link
                  href={`/login?mode=signup&returnTo=${encodeURIComponent(returnTo)}`}
                  className="text-sm text-neutral-500 py-3 px-6 rounded-lg active:bg-neutral-100"
                >
                  Don&apos;t have an account? <span className="font-medium text-neutral-800">Sign up</span>
                </Link>
                <Link
                  href={`/login?mode=magic&returnTo=${encodeURIComponent(returnTo)}`}
                  className="text-sm text-neutral-400 py-3 px-6 rounded-lg active:bg-neutral-100"
                >
                  Use magic link instead
                </Link>
              </>
            )}
            {mode === "signup" && (
              <Link
                href={`/login?returnTo=${encodeURIComponent(returnTo)}`}
                className="text-sm text-neutral-500 py-3 px-6 rounded-lg active:bg-neutral-100"
              >
                Already have an account? <span className="font-medium text-neutral-800">Sign in</span>
              </Link>
            )}
            {mode === "magic" && (
              <Link
                href={`/login?returnTo=${encodeURIComponent(returnTo)}`}
                className="text-sm text-neutral-500 py-3 px-6 rounded-lg active:bg-neutral-100"
              >
                Use password instead
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
