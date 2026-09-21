"use client";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export function SkipActivitiesDialog({
  open,
  destinationName,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  destinationName: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <ConfirmDialog
      open={open}
      title="Skip activities?"
      description={`You can add activities later from the ${destinationName} plan.`}
      confirmLabel="Skip Activities"
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}
