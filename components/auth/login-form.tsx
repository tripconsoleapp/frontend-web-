"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Button } from "@/components/ui/button";
import { SegmentedTabs } from "@/components/ui/segmented-tabs";
import { FormError } from "@/components/ui/form-error";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api-client";
import { DEMO_MODE, DEMO_CREDENTIALS } from "@/lib/demo-backend";

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [tab, setTab] = useState<"email" | "phone">("email");
  const [phone, setPhone] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleEmailSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(identifier, password);
      router.push("/dashboard");
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  function handlePhoneSubmit(e: FormEvent) {
    e.preventDefault();
    router.push(
      `/verify-phone?returnTo=login&phone=${encodeURIComponent(phone)}`
    );
  }

  /** Only reachable when NEXT_PUBLIC_DEMO_MODE is explicitly "true" at
   *  build time (the button below only renders in that case). Submits
   *  fixed, non-secret demo credentials through the same login() used by
   *  the real form — in demo mode every login resolves to the same demo
   *  session regardless of credentials, since there is no real backend to
   *  validate anything against; this button just makes that explicit and
   *  labeled instead of requiring the visitor to type something. */
  async function handleDemoLogin() {
    setError(null);
    setSubmitting(true);
    try {
      await login(DEMO_CREDENTIALS.identifier, DEMO_CREDENTIALS.password);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not start the demo session.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[2.5rem] font-heading font-semibold leading-[1.02] text-navy">
          Welcome back
        </h1>
        <p className="mt-2 font-body text-base text-text-grey">
          Log in to your TripConsole account.
        </p>
      </div>

      {DEMO_MODE && (
        <div className="flex flex-col gap-2 rounded-xl border border-orange/30 bg-orange/5 p-4">
          <p className="font-body text-sm font-semibold uppercase tracking-wide text-orange">Demo Mode</p>
          <p className="font-body text-sm text-navy/80">
            This build is running without a live backend. Continue with a demonstration session — no real account, no real data.
          </p>
          <Button type="button" variant="outline" className="w-full" disabled={submitting} onClick={handleDemoLogin}>
            {submitting ? "Starting Demo…" : "Continue in Demo Mode"}
          </Button>
        </div>
      )}

      <SegmentedTabs
        options={[
          { value: "email", label: "Email" },
          { value: "phone", label: "Phone / OTP" },
        ]}
        value={tab}
        onChange={(v) => setTab(v as "email" | "phone")}
      />

      {tab === "email" ? (
        <form
          key="email"
          onSubmit={handleEmailSubmit}
          className="flex flex-col gap-5"
        >
          <Input
            label="Email Address"
            type="email"
            required
            placeholder="you@school.edu"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
          />
          <div className="flex flex-col gap-2">
            <PasswordInput
              label="Password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Link
              href="/forgot-password"
              className="self-end font-body text-base font-medium text-orange hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

          <FormError message={error} />

          <Button
            type="submit"
            variant="accent"
            size="lg"
            className="w-full"
            disabled={submitting}
          >
            {submitting ? "Logging In..." : "Log In"}
          </Button>

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-navy/10" />
            <span className="font-body text-xs uppercase tracking-wide text-text-grey">
              Or
            </span>
            <div className="h-px flex-1 bg-navy/10" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button type="button" variant="outline" className="w-full">
              Google
            </Button>
            <Button type="button" variant="outline" className="w-full">
              Apple
            </Button>
          </div>

          <p className="text-center font-body text-base text-text-grey">
            Don&rsquo;t have an account?{" "}
            <Link href="/signup" className="font-medium text-navy underline">
              Sign Up
            </Link>
          </p>
        </form>
      ) : (
        <form
          key="phone"
          onSubmit={handlePhoneSubmit}
          className="flex flex-col gap-5"
        >
          <Input
            label="Mobile Number"
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="98765 43210"
            leftElement={
              <span className="text-sm font-medium text-navy">+91</span>
            }
          />
          <Button type="submit" variant="accent" size="lg" className="w-full">
            Send OTP
          </Button>
        </form>
      )}
    </div>
  );
}
