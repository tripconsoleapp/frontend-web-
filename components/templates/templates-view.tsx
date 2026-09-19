"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { FilterGroup, FilterCheckbox } from "@/components/templates/filter-group";
import { TemplateBrowseCard } from "@/components/templates/template-browse-card";
import { formatCurrency } from "@/lib/mock-trips";
import {
  DESTINATION_TYPE_LABELS,
  DestinationType,
  GROUP_TYPE_LABELS,
  GroupType,
  Template,
} from "@/lib/mock-templates";

const DESTINATION_OPTIONS = Object.keys(
  DESTINATION_TYPE_LABELS
) as DestinationType[];
const GROUP_OPTIONS = Object.keys(GROUP_TYPE_LABELS) as GroupType[];

const DURATION_OPTIONS = [
  { value: "any", label: "Any" },
  { value: "1", label: "1 Day" },
  { value: "2-3", label: "2-3 Days" },
  { value: "3-5", label: "3-5 Days" },
  { value: "5+", label: "5+ Days" },
];

function matchesDuration(days: number, value: string) {
  switch (value) {
    case "1":
      return days === 1;
    case "2-3":
      return days >= 2 && days <= 3;
    case "3-5":
      return days >= 3 && days <= 5;
    case "5+":
      return days >= 5;
    default:
      return true;
  }
}

function toggleValue<T>(list: T[], value: T): T[] {
  return list.includes(value)
    ? list.filter((item) => item !== value)
    : [...list, value];
}

export function TemplatesView({ templates }: { templates: Template[] }) {
  const [search, setSearch] = useState("");
  const [destinationTypes, setDestinationTypes] = useState<DestinationType[]>(
    []
  );
  const [groupTypes, setGroupTypes] = useState<GroupType[]>([]);
  const [duration, setDuration] = useState("any");
  const [maxBudget, setMaxBudget] = useState(3000);

  const filtered = templates.filter((template) => {
    if (
      search &&
      !`${template.name} ${template.location}`
        .toLowerCase()
        .includes(search.toLowerCase())
    ) {
      return false;
    }
    if (
      destinationTypes.length &&
      !template.destinationTypes.some((type) =>
        destinationTypes.includes(type)
      )
    ) {
      return false;
    }
    if (
      groupTypes.length &&
      !template.groupTypes.some((type) => groupTypes.includes(type))
    ) {
      return false;
    }
    if (!matchesDuration(template.durationDays, duration)) return false;
    if (template.pricePerPerson > maxBudget) return false;
    return true;
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-navy">
          Templates
        </h1>
        <div className="relative mt-4 max-w-md">
          <Search
            size={18}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-grey"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search destinations in Kerala..."
            className="w-full rounded-md border border-navy/15 py-2.5 pl-10 pr-4 font-body text-sm text-navy placeholder:text-text-grey/60 focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="flex flex-col gap-6 lg:border-r lg:border-navy/10 lg:pr-6">
          <FilterGroup title="Destination Type">
            {DESTINATION_OPTIONS.map((type) => (
              <FilterCheckbox
                key={type}
                label={DESTINATION_TYPE_LABELS[type]}
                checked={destinationTypes.includes(type)}
                onChange={() =>
                  setDestinationTypes(toggleValue(destinationTypes, type))
                }
              />
            ))}
          </FilterGroup>

          <FilterGroup title="Group Type">
            {GROUP_OPTIONS.map((type) => (
              <FilterCheckbox
                key={type}
                label={GROUP_TYPE_LABELS[type]}
                checked={groupTypes.includes(type)}
                onChange={() => setGroupTypes(toggleValue(groupTypes, type))}
              />
            ))}
          </FilterGroup>

          <FilterGroup title="Duration">
            {DURATION_OPTIONS.map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-2.5 font-body text-sm text-navy"
              >
                <input
                  type="radio"
                  name="duration"
                  checked={duration === option.value}
                  onChange={() => setDuration(option.value)}
                  className="h-4 w-4 border-navy/30 text-orange focus:ring-orange/30"
                />
                {option.label}
              </label>
            ))}
          </FilterGroup>

          <FilterGroup title="Budget per Student">
            <input
              type="range"
              min={500}
              max={5000}
              step={100}
              value={maxBudget}
              onChange={(e) => setMaxBudget(Number(e.target.value))}
              className="w-full accent-orange"
            />
            <p className="font-body text-xs text-text-grey">
              Up to {formatCurrency(maxBudget)}
            </p>
          </FilterGroup>
        </aside>

        <div>
          <p className="mb-4 font-body text-sm text-text-grey">
            {filtered.length} {filtered.length === 1 ? "template" : "templates"}{" "}
            found
          </p>

          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-navy/10 bg-white px-6 py-16 text-center">
              <h2 className="font-heading text-lg font-semibold text-navy">
                No templates match your filters
              </h2>
              <p className="mt-2 font-body text-sm text-text-grey">
                Try adjusting the filters or search terms above.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((template) => (
                <TemplateBrowseCard key={template.id} template={template} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
