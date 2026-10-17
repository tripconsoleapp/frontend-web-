"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Truck, Users } from "lucide-react";
import { RoleCard } from "@/components/onboarding/role-card";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";
import { useAuth, type UserRole } from "@/lib/auth-context";
import { ApiError } from "@/lib/api-client";
import { getPendingSignup, clearPendingSignup } from "@/lib/pending-signup";

const ROLES = [
  {
    id: "organizer",
    title: "Organizer",
    description: "Planning trips for groups",
    icon: <Users size={20} />,
    backendRole: "ORGANIZER" as UserRole,
  },
  {
    id: "operator",
    title: "Operator",
    description: "Managing fleet and logistics",
    icon: <Truck size={20} />,
    backendRole: "OPERATOR" as UserRole,
  },
  {
    id: "field-coordinator",
    title: "Field Coordinator",
    description: "On-ground operations support",
    icon: <MapPin size={20} />,
    backendRole: "FIELD_COORDINATOR" as UserRole,
  },
] as const;

export function RoleSelector({ email }: { email: string }) {
  const router = useRouter();
  const { register } = useAuth();
  const [selected, setSelected] = useState<(typeof ROLES)[number]["id"]>(
    "organizer"
  );
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const selectedRole = ROLES.find((role) => role.id === selected)!;

  async function handleContinue() {
    setError(null);
    const pending = getPendingSignup();
    if (!pending) {
      setError("Your signup details expired. Please start again.");
      return;
    }
    setSubmitting(true);
    try {
      await register({
        email: pending.email || email || undefined,
        phone: pending.phone,
        password: pending.password,
        role: selectedRole.backendRole,
      });
      clearPendingSignup();
      router.push(`/verify-email?email=${encodeURIComponent(email)}`);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
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

      <FormError message={error} />

      <div className="flex flex-col items-center gap-3">
        <Button
          variant="accent"
          size="lg"
          onClick={handleContinue}
          disabled={submitting}
          className="w-full"
        >
          {submitting ? "Creating Account..." : `Continue as ${selectedRole.title}`}
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
