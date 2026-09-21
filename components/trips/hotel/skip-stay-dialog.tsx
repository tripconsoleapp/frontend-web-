"use client";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export function SkipStayDialog({
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
      title="Skip accommodation?"
      description={`No hotel will be added for ${destinationName}. You can change this later from Your Stays.`}
      confirmLabel="Skip Stay"
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}
