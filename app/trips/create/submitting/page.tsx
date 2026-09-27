import { AppShell } from "@/components/layout/app-shell";
import { SubmissionProcessing } from "@/components/trips/operations/submission-processing";

export default function TripSubmittingRoute() {
  return (
    <AppShell>
      <SubmissionProcessing />
    </AppShell>
  );
}
