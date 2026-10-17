import { AppShell } from "@/components/layout/app-shell";
import { KsrtcDetails } from "@/components/book/vehicle/ksrtc-details";

export default async function BookVehicleKsrtcDetailsRoute({ params }: { params: Promise<{ serviceId: string }> }) {
  const { serviceId } = await params;
  return (
    <AppShell>
      <KsrtcDetails serviceId={serviceId} />
    </AppShell>
  );
}
