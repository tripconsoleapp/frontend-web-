"use client";

import { useState } from "react";
import {
  Briefcase,
  GraduationCap,
  Landmark,
  Mountain,
  Users,
} from "lucide-react";
import { cn } from "@/lib/cn";

const CATEGORIES = [
  { id: "school", label: "School Trips", icon: GraduationCap },
  { id: "pilgrimage", label: "Pilgrimage", icon: Landmark },
  { id: "family", label: "Family", icon: Users },
  { id: "corporate", label: "Corporate", icon: Briefcase },
  { id: "adventure", label: "Adventure", icon: Mountain },
];

export function CategoryNav() {
  const [active, setActive] = useState(CATEGORIES[0].id);

  return (
    <nav className="bg-white shadow-[0_4px_12px_-8px_rgba(45,62,80,0.2)]">
      <div
        role="tablist"
        aria-label="Trip categories"
        className="mx-auto flex max-w-6xl gap-8 overflow-x-auto px-6 py-4 sm:px-8"
      >
        {CATEGORIES.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={active === id}
            onClick={() => setActive(id)}
            className={cn(
              "flex shrink-0 flex-col items-center gap-2 border-b-2 px-1 pb-3 pt-1 font-body text-base font-medium transition-colors",
              active === id
                ? "border-navy text-navy"
                : "border-transparent text-text-grey hover:text-navy"
            )}
          >
            <Icon size={22} aria-hidden="true" strokeWidth={active === id ? 2.25 : 1.75} />
            {label}
          </button>
        ))}
      </div>
    </nav>
  );
}
