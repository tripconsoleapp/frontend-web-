import { AppShell } from "@/components/layout/app-shell";
import { PaymentConsole } from "@/components/trips/payment/payment-console";

export default async function PaymentRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <AppShell>
      <PaymentConsole tripId={id} />
    </AppShell>
  );
}
