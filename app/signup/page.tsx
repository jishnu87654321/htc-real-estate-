"use client";

import { Suspense, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Lock, Mail, User, Phone, AlertCircle } from "lucide-react";
import { Container } from "@/components/primitives/Container";
import { Button } from "@/components/primitives/Button";
import { signupAction } from "@/app/actions/auth";
import { getSafeReturnTo } from "@/lib/validation/forms";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawReturnTo = searchParams.get("returnTo") || "";
  const returnTo = getSafeReturnTo(rawReturnTo, "");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const res = await signupAction({
        name,
        email,
        phone,
        password,
        returnTo,
      });

      if (res.success) {
        const dest = getSafeReturnTo(res.returnTo, "/account");
        router.push(dest);
        router.refresh();
      } else {
        setError(res.error || "Signup failed");
      }
    });
  };

  return (
    <div className="mx-auto max-w-md">
      <div className="text-center mb-8">
        <span className="text-label uppercase tracking-widest text-red-600 font-semibold">Join HTC</span>
        <h1 className="mt-2 font-serif text-display-md text-text-primary">Create your account</h1>
        <p className="mt-2 text-body-md text-text-secondary">
          Apply to rent or buy homes, bookmark favorite properties, and list yours.
        </p>
      </div>

      <div className="rounded-2xl border border-border-subtle bg-surface-raised p-8 shadow-md">
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-body-sm text-red-800">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-body-sm font-medium text-text-primary mb-1.5" htmlFor="name">
              Full name
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-3 h-5 w-5 text-text-tertiary" />
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Srikanth Reddy"
                className="w-full rounded-lg border border-border-strong bg-surface-base pl-11 pr-4 py-2.5 text-body-md text-text-primary placeholder:text-text-tertiary focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
              />
            </div>
          </div>

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
            <label className="block text-body-sm font-medium text-text-primary mb-1.5" htmlFor="phone">
              Phone number (optional)
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-3 h-5 w-5 text-text-tertiary" />
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="9876543210"
                className="w-full rounded-lg border border-border-strong bg-surface-base pl-11 pr-4 py-2.5 text-body-md text-text-primary placeholder:text-text-tertiary focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-body-sm font-medium text-text-primary mb-1.5" htmlFor="password">
              Password (8+ characters)
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 h-5 w-5 text-text-tertiary" />
              <input
                id="password"
                type="password"
                required
                minLength={8}
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
            {isPending ? "Creating account..." : "Create Account"}
            {!isPending && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </form>

        <div className="mt-8 border-t border-border-subtle pt-6 text-center text-body-sm text-text-secondary">
          Already have an account?{" "}
          <Link
            href={`/login${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ""}`}
            className="font-medium text-red-600 hover:underline"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <div className="py-16 md:py-24">
      <Container>
        <Suspense fallback={<div className="py-12 text-center text-text-tertiary">Loading signup...</div>}>
          <SignupForm />
        </Suspense>
      </Container>
    </div>
  );
}
