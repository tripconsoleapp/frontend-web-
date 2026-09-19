"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Mail, Phone, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PasswordInput, PasswordStrengthMeter } from "@/components/ui/password-input";
import { Button } from "@/components/ui/button";

export function SignupForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/role-selection?email=${encodeURIComponent(email)}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-navy">
          Let&rsquo;s get you set up.
        </h1>
        <p className="mt-1 font-body text-text-grey">
          Takes less than 2 minutes.
        </p>
      </div>

      <Input
        label="Full Name"
        name="fullName"
        placeholder="Rahul Menon"
        leftElement={<User size={18} />}
        required
      />

      <Input
        label="Email Address"
        name="email"
        type="email"
        placeholder="you@school.edu"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        leftElement={<Mail size={18} />}
        rightElement={<CheckCircle2 size={18} className="text-mint" />}
        required
      />

      <Input
        label="Mobile Number"
        name="mobile"
        type="tel"
        placeholder="98765 43210"
        leftElement={<Phone size={18} />}
        hint="Used for trip alerts and coordination."
        required
      />

      <div className="flex flex-col gap-2">
        <PasswordInput
          label="Password"
          name="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <PasswordStrengthMeter password={password} />
      </div>

      <PasswordInput
        label="Confirm Password"
        name="confirmPassword"
        placeholder="••••••••"
        required
      />

      <label className="flex items-start gap-2.5 font-body text-sm text-text-grey">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-navy/30 text-navy focus:ring-navy/20"
          required
        />
        <span>
          I agree to the{" "}
          <Link href="/terms" className="font-medium text-navy underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="font-medium text-navy underline">
            Privacy Policy
          </Link>{" "}
          of TripConsole.
        </span>
      </label>

      <Button type="submit" variant="accent" size="lg" className="w-full">
        Create Account
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

      <p className="text-center font-body text-sm text-text-grey">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-navy underline">
          Log In
        </Link>
      </p>
    </form>
  );
}
