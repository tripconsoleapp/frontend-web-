"use client";

import { cn } from "@/lib/cn";
import type { HotelSearchFilters, SortOrder } from "@/lib/hotel-booking-api";
import type { Hotel } from "@/lib/hotel-booking-data";

const STAR_OPTIONS = [3, 4, 5];
const GUEST_RATING_OPTIONS = [7, 8, 9];
const AMENITY_OPTIONS = ["Wi-Fi", "Parking", "Pool", "Restaurant", "Breakfast", "AC"];
const PROPERTY_TYPES: Hotel["propertyType"][] = ["Hotel", "Resort", "Villa", "Homestay"];

const SORT_OPTIONS: { value: SortOrder; label: string }[] = [
  { value: "recommended", label: "Recommended" },
  { value: "price_low", label: "Price: Low to High" },
  { value: "price_high", label: "Price: High to Low" },
  { value: "guest_rating", label: "Guest Rating" },
  { value: "star_rating", label: "Star Rating" },
];

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 font-body text-xs font-medium transition-colors",
        active ? "border-orange bg-orange text-white" : "border-navy/15 text-navy hover:border-navy/30"
      )}
    >
      {children}
    </button>
  );
}

export function FiltersPanel({
  filters,
  onFiltersChange,
  sort,
  onSortChange,
}: {
  filters: HotelSearchFilters;
  onFiltersChange: (next: HotelSearchFilters) => void;
  sort: SortOrder;
  onSortChange: (next: SortOrder) => void;
}) {
  function toggleAmenity(a: string) {
    const current = filters.amenities ?? [];
    const next = current.includes(a) ? current.filter((x) => x !== a) : [...current, a];
    onFiltersChange({ ...filters, amenities: next });
  }

  function togglePropertyType(t: Hotel["propertyType"]) {
    const current = filters.propertyTypes ?? [];
    const next = current.includes(t) ? current.filter((x) => x !== t) : [...current, t];
    onFiltersChange({ ...filters, propertyTypes: next });
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <label className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Sort by</label>
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value as SortOrder)}
          className="mt-2 w-full rounded-xl border border-navy/15 bg-white px-3 py-2.5 font-body text-sm text-navy"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Price per night</p>
        <div className="mt-2 flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice ?? ""}
            onChange={(e) => onFiltersChange({ ...filters, minPrice: e.target.value ? Number(e.target.value) : undefined })}
            className="w-full rounded-lg border border-navy/15 bg-white px-3 py-2 font-body text-sm text-navy"
          />
          <span className="text-text-grey">&ndash;</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice ?? ""}
            onChange={(e) => onFiltersChange({ ...filters, maxPrice: e.target.value ? Number(e.target.value) : undefined })}
            className="w-full rounded-lg border border-navy/15 bg-white px-3 py-2 font-body text-sm text-navy"
          />
        </div>
      </div>

      <div>
        <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Star rating</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {STAR_OPTIONS.map((s) => (
            <Chip key={s} active={filters.minStarRating === s} onClick={() => onFiltersChange({ ...filters, minStarRating: filters.minStarRating === s ? undefined : s })}>
              {s}+
            </Chip>
          ))}
        </div>
      </div>

      <div>
        <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Guest rating</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {GUEST_RATING_OPTIONS.map((g) => (
            <Chip key={g} active={filters.minGuestRating === g} onClick={() => onFiltersChange({ ...filters, minGuestRating: filters.minGuestRating === g ? undefined : g })}>
              {g}+
            </Chip>
          ))}
        </div>
      </div>

      <div>
        <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Property type</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {PROPERTY_TYPES.map((t) => (
            <Chip key={t} active={(filters.propertyTypes ?? []).includes(t)} onClick={() => togglePropertyType(t)}>
              {t}
            </Chip>
          ))}
        </div>
      </div>

      <div>
        <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Amenities</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {AMENITY_OPTIONS.map((a) => (
            <Chip key={a} active={(filters.amenities ?? []).includes(a)} onClick={() => toggleAmenity(a)}>
              {a}
            </Chip>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-2.5 font-body text-sm text-navy">
        <input
          type="checkbox"
          checked={!!filters.freeCancellationOnly}
          onChange={(e) => onFiltersChange({ ...filters, freeCancellationOnly: e.target.checked })}
          className="h-4 w-4 accent-orange"
        />
        Free cancellation only
      </label>

      <button
        type="button"
        onClick={() => onFiltersChange({})}
        className="self-start font-body text-xs font-semibold text-orange underline underline-offset-2"
      >
        Clear filters
      </button>
    </div>
  );
}
