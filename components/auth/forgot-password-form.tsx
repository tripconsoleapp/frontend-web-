"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, KeyRound } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SegmentedTabs } from "@/components/ui/segmented-tabs";

export function ForgotPasswordForm() {
  const router = useRouter();
  const [tab, setTab] = useState<"email" | "phone">("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [sent, setSent] = useState(false);

  function handleEmailSubmit(e: FormEvent) {
    e.preventDefault();
    setSent(true);
  }

  function handlePhoneSubmit(e: FormEvent) {
    e.preventDefault();
    router.push(
      `/verify-phone?returnTo=reset-password&phone=${encodeURIComponent(phone)}`
    );
  }

  if (sent) {
    return (
      <div className="flex flex-col gap-4">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-mint/40 text-navy">
          <CheckCircle2 size={22} />
        </span>
        <h1 className="text-[2.5rem] font-heading font-semibold leading-[1.02] text-navy">
          Check your inbox
        </h1>
        <p className="font-body text-base text-text-grey">
          We sent a reset link to{" "}
          <span className="font-semibold text-navy">{email}</span>.
        </p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="self-start font-body text-base font-medium text-orange hover:underline"
        >
          Resend email
        </button>
        <Link
          href="/login"
          className="font-body text-base text-text-grey hover:text-navy"
        >
          Back to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-mint/40 text-navy">
          <KeyRound size={20} />
        </span>
        <h1 className="text-[2.5rem] font-heading font-semibold leading-[1.02] text-navy">
          Reset your password
        </h1>
        <p className="font-body text-base text-text-grey">
          Enter your registered email or mobile number and we&rsquo;ll help
          you get back in.
        </p>
      </div>

      <SegmentedTabs
        options={[
          { value: "email", label: "Email" },
          { value: "phone", label: "Phone" },
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
            label="Registered Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@school.edu"
          />
          <Button type="submit" variant="accent" size="lg" className="w-full">
            Send Reset Link
          </Button>
        </form>
      ) : (
        <form
          key="phone"
          onSubmit={handlePhoneSubmit}
          className="flex flex-col gap-5"
        >
          <Input
            label="Registered Mobile Number"
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

      <Link
        href="/login"
        className="font-body text-base text-text-grey hover:text-navy"
      >
        Back to Login
      </Link>
    </div>
  );
}
