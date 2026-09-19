"use client";

import { useEffect, useState } from "react";

export function ResendCountdown({
  seconds = 30,
  onResend,
}: {
  seconds?: number;
  onResend?: () => void;
}) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    if (remaining <= 0) return;
    const timer = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(timer);
  }, [remaining]);

  if (remaining > 0) {
    return (
      <p className="font-body text-sm text-text-grey">
        Resend code in {remaining}s
      </p>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        setRemaining(seconds);
        onResend?.();
      }}
      className="font-body text-sm font-medium text-orange hover:underline"
    >
      Resend code
    </button>
  );
}
