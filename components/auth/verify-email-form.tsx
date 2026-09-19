"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail } from "lucide-react";
import { OtpInput } from "@/components/auth/otp-input";
import { ResendCountdown } from "@/components/auth/resend-countdown";
import { Button } from "@/components/ui/button";

export function VerifyEmailForm({ email }: { email: string }) {
  const router = useRouter();
  const [code, setCode] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    router.push("/onboarding/role");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col items-center gap-6 text-center"
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-mint/40 text-navy">
        <Mail size={24} />
      </span>

      <div>
        <h1 className="font-heading text-2xl font-semibold text-navy">
          Verify your email
        </h1>
        <p className="mt-2 font-body text-sm text-text-grey">
          We&rsquo;ve sent a 6-digit verification code to{" "}
          <span className="font-semibold text-navy">{email}</span>. Enter it
          below to activate your account.
        </p>
      </div>

      <OtpInput length={6} value={code} onChange={setCode} />

      <Button type="submit" variant="accent" size="lg" className="w-full">
        Verify & Continue
      </Button>

      <ResendCountdown seconds={30} />

      <Link
        href="/signup/create"
        className="font-body text-sm font-medium text-navy underline"
      >
        Change email address
      </Link>
    </form>
  );
}
