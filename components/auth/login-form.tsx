"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Button } from "@/components/ui/button";
import { SegmentedTabs } from "@/components/ui/segmented-tabs";

export function LoginForm() {
  const router = useRouter();
  const [tab, setTab] = useState<"email" | "phone">("email");
  const [phone, setPhone] = useState("");

  function handleEmailSubmit(e: FormEvent) {
    e.preventDefault();
    router.push("/dashboard");
  }

  function handlePhoneSubmit(e: FormEvent) {
    e.preventDefault();
    router.push(
      `/verify-phone?returnTo=login&phone=${encodeURIComponent(phone)}`
    );
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
          />
          <div className="flex flex-col gap-2">
            <PasswordInput label="Password" required placeholder="••••••••" />
            <Link
              href="/forgot-password"
              className="self-end font-body text-base font-medium text-orange hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

          <Button type="submit" variant="accent" size="lg" className="w-full">
            Log In
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
