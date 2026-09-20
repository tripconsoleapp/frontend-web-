"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Truck, Users } from "lucide-react";
import { RoleCard } from "@/components/onboarding/role-card";
import { Button } from "@/components/ui/button";

const ROLES = [
  {
    id: "organizer",
    title: "Organizer",
    description: "Planning trips for groups",
    icon: <Users size={20} />,
  },
  {
    id: "operator",
    title: "Operator",
    description: "Managing fleet and logistics",
    icon: <Truck size={20} />,
  },
  {
    id: "field-coordinator",
    title: "Field Coordinator",
    description: "On-ground operations support",
    icon: <MapPin size={20} />,
  },
] as const;

export function RoleSelector({ email }: { email: string }) {
  const router = useRouter();
  const [selected, setSelected] = useState<(typeof ROLES)[number]["id"]>(
    "organizer"
  );
  const selectedRole = ROLES.find((role) => role.id === selected)!;

  function handleContinue() {
    router.push(`/verify-email?email=${encodeURIComponent(email)}`);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        {ROLES.map((role) => (
          <RoleCard
            key={role.id}
            icon={role.icon}
            title={role.title}
            description={role.description}
            selected={selected === role.id}
            onSelect={() => setSelected(role.id)}
          />
        ))}
      </div>

      <div className="flex flex-col items-center gap-3">
        <Button
          variant="accent"
          size="lg"
          onClick={handleContinue}
          className="w-full"
        >
          Continue as {selectedRole.title}
        </Button>
        <button
          type="button"
          onClick={() => router.back()}
          className="font-body text-base text-text-grey hover:text-navy"
        >
          Go Back
        </button>
      </div>
    </div>
  );
}
