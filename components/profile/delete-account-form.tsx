"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/cn";

const CONFIRM_WORD = "DELETE";

export function DeleteAccountForm() {
  const router = useRouter();
  const [confirmText, setConfirmText] = useState("");
  const canDelete = confirmText === CONFIRM_WORD;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canDelete) return;
    router.push("/login");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col items-center gap-5 px-4 py-8 text-center"
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
        <AlertTriangle size={26} />
      </span>

      <div>
        <h1 className="font-heading text-xl font-semibold text-navy">
          Delete your account?
        </h1>
        <p className="mt-2 font-body text-sm text-text-grey">
          This permanently deletes your trips, itineraries, documents, and
          payment history. This action cannot be undone.
        </p>
      </div>

      <div className="w-full text-left">
        <Input
          label={`Type "${CONFIRM_WORD}" to confirm`}
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder={CONFIRM_WORD}
          autoComplete="off"
        />
      </div>

      <button
        type="submit"
        disabled={!canDelete}
        className={cn(
          "w-full rounded-md py-3 font-body text-sm font-semibold text-white transition-colors",
          canDelete
            ? "bg-red-600 hover:bg-red-700"
            : "cursor-not-allowed bg-red-600/30"
        )}
      >
        Delete My Account
      </button>

      <Link
        href="/profile"
        className="font-body text-sm text-text-grey hover:text-navy"
      >
        Cancel
      </Link>
    </form>
  );
}
