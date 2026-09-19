"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  PasswordInput,
  PasswordStrengthMeter,
} from "@/components/ui/password-input";
import { Button } from "@/components/ui/button";

export function ChangePasswordForm() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    router.push("/profile");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 px-4 py-6">
      <PasswordInput
        label="Current Password"
        required
        placeholder="••••••••"
      />

      <div className="flex flex-col gap-2">
        <PasswordInput
          label="New Password"
          required
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="••••••••"
        />
        <PasswordStrengthMeter password={newPassword} />
      </div>

      <PasswordInput
        label="Confirm New Password"
        required
        placeholder="••••••••"
      />

      <Button type="submit" variant="accent" size="lg" className="w-full">
        Update Password
      </Button>
    </form>
  );
}
