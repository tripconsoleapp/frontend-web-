"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound } from "lucide-react";
import {
  PasswordInput,
  PasswordStrengthMeter,
} from "@/components/ui/password-input";
import { Button } from "@/components/ui/button";

export function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    router.push("/reset-password/success");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-mint/40 text-navy">
          <KeyRound size={22} />
        </span>
        <h1 className="font-heading text-2xl font-semibold text-navy">
          Create a new password
        </h1>
        <p className="font-body text-sm text-text-grey">
          Must be at least 8 characters.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <PasswordInput
          label="New Password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />
        <PasswordStrengthMeter password={password} />
      </div>

      <PasswordInput
        label="Confirm Password"
        required
        placeholder="••••••••"
      />

      <Button type="submit" variant="accent" size="lg" className="w-full">
        Update Password
      </Button>
    </form>
  );
}
