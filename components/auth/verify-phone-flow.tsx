"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Phone as PhoneIcon, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { OtpInput } from "@/components/auth/otp-input";
import { ResendCountdown } from "@/components/auth/resend-countdown";

const RETURN_DESTINATIONS: Record<string, string> = {
  login: "/",
  "reset-password": "/reset-password",
};

export function VerifyPhoneFlow({
  initialPhone,
  returnTo,
}: {
  initialPhone?: string;
  returnTo: string;
}) {
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "otp">(
    initialPhone ? "otp" : "phone"
  );
  const [phone, setPhone] = useState(initialPhone ?? "");
  const [code, setCode] = useState("");

  function handleSendOtp(e: FormEvent) {
    e.preventDefault();
    setStep("otp");
  }

  function handleVerify(e: FormEvent) {
    e.preventDefault();
    router.push(RETURN_DESTINATIONS[returnTo] ?? "/");
  }

  if (step === "phone") {
    return (
      <form
        key="phone"
        onSubmit={handleSendOtp}
        className="flex flex-col items-center gap-6 text-center"
      >
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-mint/40 text-navy">
          <PhoneIcon size={22} />
        </span>

        <div>
          <h1 className="font-heading text-2xl font-semibold text-navy">
            Enter your mobile number
          </h1>
          <p className="mt-2 font-body text-sm text-text-grey">
            We&rsquo;ll send a 4-digit OTP to verify it&rsquo;s you.
          </p>
        </div>

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

        <p className="font-body text-xs text-text-grey">
          Your number is only used for verification and trip alerts.
        </p>
      </form>
    );
  }

  return (
    <form
      key="otp"
      onSubmit={handleVerify}
      className="flex flex-col items-center gap-6 text-center"
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-mint/40 text-navy">
        <ShieldCheck size={22} />
      </span>

      <div>
        <h1 className="font-heading text-2xl font-semibold text-navy">
          Verify your number
        </h1>
        <p className="mt-2 font-body text-sm text-text-grey">
          OTP sent to +91 {phone || "98765 43210"}
        </p>
        <button
          type="button"
          onClick={() => setStep("phone")}
          className="mt-1 font-body text-sm font-medium text-orange hover:underline"
        >
          Wrong number? Change
        </button>
      </div>

      <OtpInput length={4} value={code} onChange={setCode} />

      <Button type="submit" variant="accent" size="lg" className="w-full">
        Verify & Continue
      </Button>

      <ResendCountdown seconds={30} />

      <p className="font-body text-xs text-text-grey">
        Your number is only used for verification and trip alerts.
      </p>
    </form>
  );
}
