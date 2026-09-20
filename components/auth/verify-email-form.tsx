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
    router.push("/dashboard");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-mint/40 text-navy">
        <Mail size={20} />
      </span>

      <div>
        <h1 className="text-[2.5rem] font-heading font-semibold leading-[1.02] text-navy">
          Verify your email
        </h1>
        <p className="mt-2 font-body text-base text-text-grey">
          We&rsquo;ve sent a 6-digit verification code to{" "}
          <span className="font-semibold text-navy">{email}</span>. Enter it
          below to activate your account.
        </p>
      </div>

      <OtpInput length={6} value={code} onChange={setCode} />

      <Button type="submit" variant="accent" size="lg" className="w-full">
        Verify & Continue
      </Button>

      <div className="flex items-center justify-between">
        <ResendCountdown seconds={30} />
        <Link
          href="/signup/create"
          className="font-body text-base font-medium text-navy underline"
        >
          Change email address
        </Link>
      </div>
    </form>
  );
}
