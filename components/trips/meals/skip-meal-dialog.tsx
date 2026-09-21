"use client";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { MEAL_LABELS } from "@/lib/meal-plan";
import { MealType } from "@/lib/listing-draft";

export function SkipMealDialog({
  open,
  mealType,
  destinationName,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  mealType: MealType;
  destinationName: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <ConfirmDialog
      open={open}
      title={`Skip ${MEAL_LABELS[mealType].toLowerCase()}?`}
      description={`No restaurant or meal order will be arranged through TripConsole for this ${MEAL_LABELS[mealType].toLowerCase()} in ${destinationName}.`}
      confirmLabel="Skip Meal"
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}
