"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreateStepper } from "@/components/trips/create-stepper";
import { SharedLocationPicker, type GeocodedPlace } from "@/components/trips/location/shared-location-picker";

export function LocationPicker({
  basePath,
  template,
}: {
  basePath: string;
  template?: string;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<GeocodedPlace | null>(null);

  function handleConfirm() {
    if (!selected) return;
    const params = new URLSearchParams();
    if (template) params.set("template", template);
    params.set("startLabel", selected.name);
    params.set("startDistrict", selected.district);
    params.set("startLat", String(selected.lat));
    params.set("startLng", String(selected.lng));
    router.push(`${basePath}?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-6">
      <CreateStepper activeIndex={1} />

      <div>
        <h1 className="font-serif text-3xl text-navy">Choose Starting Location</h1>
        <p className="mt-1 font-body text-sm text-text-grey">Pick where your group will begin the journey from.</p>
      </div>

      <SharedLocationPicker
        value={selected}
        onChange={setSelected}
        confirmLabel="Confirm Starting Location"
        onConfirm={handleConfirm}
        className="lg:h-[70vh] lg:min-h-[520px]"
      />
    </div>
  );
}
