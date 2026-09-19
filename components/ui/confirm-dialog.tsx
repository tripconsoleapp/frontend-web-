"use client";

import { cn } from "@/lib/cn";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  destructive?: boolean;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  onConfirm,
  onCancel,
  destructive,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy/40 px-4"
    >
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="font-heading text-lg font-semibold text-navy">
          {title}
        </h2>
        <p className="mt-2 font-body text-sm text-text-grey">{description}</p>
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-md border border-navy/15 py-2.5 font-body text-sm font-medium text-navy hover:bg-navy/5"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={cn(
              "flex-1 rounded-md py-2.5 font-body text-sm font-medium text-white",
              destructive ? "bg-red-600 hover:bg-red-700" : "bg-orange hover:bg-orange/90"
            )}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
