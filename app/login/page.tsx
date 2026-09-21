"use client";

import { Suspense, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Lock, Mail, AlertCircle } from "lucide-react";
import { Container } from "@/components/primitives/Container";
import { Button } from "@/components/primitives/Button";
import { signIn } from "@/lib/auth/auth-client";
import { getSafeReturnTo } from "@/lib/validation/forms";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawReturnTo = searchParams.get("returnTo") || "";
  const returnTo = getSafeReturnTo(rawReturnTo, "");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        const { data, error: signInError } = await signIn.email({
          email,
          password,
        });

        if (signInError) {
          setError(signInError.message || "Invalid email or password.");
          return;
        }

        if (data?.user || !signInError) {
          const userRole = (data?.user as { role?: string })?.role;
          const fallback = userRole === "admin" || userRole === "staff" ? "/admin" : "/account";
          const destination = getSafeReturnTo(returnTo, fallback);
          window.location.href = destination;
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to sign in";
        setError(msg);
      }
    });
  };

  return (
    <div className="mx-auto max-w-md">
      <div className="text-center mb-8">
        <span className="text-label uppercase tracking-widest text-red-600 font-semibold">Account Access</span>
        <h1 className="mt-2 font-serif text-display-md text-text-primary">Sign in to HTC</h1>
        <p className="mt-2 text-body-md text-text-secondary">
          Track your property applications, saved homes, and submissions.
        </p>
      </div>

      <div className="rounded-2xl border border-border-subtle bg-surface-raised p-8 shadow-md">
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-body-sm text-red-800">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-body-sm font-medium text-text-primary mb-1.5" htmlFor="email">
              Email address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 h-5 w-5 text-text-tertiary" />
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full rounded-lg border border-border-strong bg-surface-base pl-11 pr-4 py-2.5 text-body-md text-text-primary placeholder:text-text-tertiary focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-body-sm font-medium text-text-primary" htmlFor="password">
                Password
              </label>
              <Link href="/forgot-password" className="text-body-xs font-medium text-red-600 hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 h-5 w-5 text-text-tertiary" />
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-border-strong bg-surface-base pl-11 pr-4 py-2.5 text-body-md text-text-primary placeholder:text-text-tertiary focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full justify-center mt-6"
            disabled={isPending}
          >
            {isPending ? "Signing in..." : "Sign in"}
            {!isPending && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </form>

        <div className="mt-8 border-t border-border-subtle pt-6 text-center text-body-sm text-text-secondary">
          Don&apos;t have an account?{" "}
          <Link
            href={`/signup${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ""}`}
            className="font-medium text-red-600 hover:underline"
          >
            Create one now
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="py-16 md:py-24">
      <Container>
        <Suspense fallback={<div className="py-12 text-center text-text-tertiary">Loading login...</div>}>
          <LoginForm />
        </Suspense>
      </Container>
    </div>
  );
}
