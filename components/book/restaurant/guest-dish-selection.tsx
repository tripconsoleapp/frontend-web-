"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Check } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatCurrency } from "@/lib/mock-trips";
import { BookingStepper } from "@/components/book/shared/booking-stepper";
import { Button } from "@/components/ui/button";
import { getRestaurantDetails } from "@/lib/restaurant-booking-api";
import { getRestaurantBookingDraft, getNextIncompleteGuestIndex, saveGuestDishSelection } from "@/lib/restaurant-booking-state";
import type { Restaurant } from "@/lib/restaurant-booking-data";

const STEPS = ["Search", "Restaurant", "Menu", "Guests", "Payment", "Confirmation"];

export function GuestDishSelection({ index }: { index: number }) {
  const router = useRouter();
  const draft = getRestaurantBookingDraft();
  const search = draft.search;
  const [restaurant, setRestaurant] = useState<Restaurant | null | undefined>(undefined);
  const [dietFilter, setDietFilter] = useState<"all" | "veg" | "non-veg">("all");
  const [activeCategory, setActiveCategory] = useState("");
  const [dishId, setDishId] = useState<string | null>(null);

  const guestCount = search?.guestCount ?? 0;
  const validIndex = Number.isInteger(index) && index >= 0 && index < guestCount;
  const guestName = draft.guestNames?.[index];

  useEffect(() => {
    if (!search || !draft.selectedRestaurantId) {
      router.replace("/book/restaurant");
      return;
    }
    if (!validIndex || !guestName) {
      router.replace(validIndex ? `/book/restaurant/guests/${index}/identify` : "/book/restaurant/review");
      return;
    }
    getRestaurantDetails(draft.selectedRestaurantId).then((r) => {
      setRestaurant(r);
      setActiveCategory(r?.menu[0]?.id ?? "");
    });
    const existing = draft.guestSelections?.find((s) => s.guestId === `guest-${index}`);
    setDishId(existing?.dishId ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  if (!search || !draft.selectedRestaurantId || !validIndex || !guestName) return null;

  if (restaurant === undefined) {
    return (
      <div className="flex flex-col gap-6 pb-16">
        <BookingStepper title="Book a Restaurant" steps={STEPS} activeIndex={3} />
        <div className="h-64 w-full animate-pulse rounded-2xl bg-navy/[0.06]" />
      </div>
    );
  }
  if (restaurant === null) return null;

  const currentCategory = restaurant.menu.find((c) => c.id === activeCategory);
  const filteredItems =
    currentCategory?.items.filter((i) => {
      if (dietFilter === "veg") return i.diet === "veg" || i.diet === "vegan";
      if (dietFilter === "non-veg") return i.diet === "non-veg";
      return true;
    }) ?? [];

  function handleConfirm() {
    if (!dishId) return;
    const dish = restaurant!.menu.flatMap((c) => c.items).find((i) => i.id === dishId)!;
    saveGuestDishSelection({ guestId: `guest-${index}`, guestName: guestName!, dishId: dish.id, dishName: dish.name, price: dish.price });
    const nextIncomplete = getNextIncompleteGuestIndex(getRestaurantBookingDraft());
    router.push(nextIncomplete >= guestCount ? "/book/restaurant/review" : `/book/restaurant/guests/${nextIncomplete}/identify`);
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-5 pb-32">
      <BookingStepper title="Book a Restaurant" steps={STEPS} activeIndex={3} />

      <button type="button" onClick={() => router.push(`/book/restaurant/guests/${index}/identify`)} className="inline-flex w-fit items-center gap-1.5 font-body text-xs font-semibold text-navy">
        <ArrowLeft size={14} /> Back
      </button>

      <div>
        <p className="font-body text-xs font-semibold uppercase tracking-wide text-orange">
          Guest {index + 1} of {guestCount}
        </p>
        <h1 className="font-heading text-xl font-bold text-navy">Hi {guestName.split(" ")[0]} 👋</h1>
        <p className="font-body text-sm text-text-grey">Choose your dish at {restaurant.name}.</p>
      </div>

      <div className="flex gap-2">
        {(["all", "veg", "non-veg"] as const).map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => setDietFilter(d)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 font-body text-sm font-medium transition-colors",
              dietFilter === d ? "border-orange bg-orange/10 text-orange" : "border-navy/15 text-navy"
            )}
          >
            {d === "all" ? "All" : d === "veg" ? "Veg" : "Non-Veg"}
          </button>
        ))}
      </div>

      <div className="flex gap-2 overflow-x-auto">
        {restaurant.menu.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setActiveCategory(c.id)}
            className={cn(
              "shrink-0 rounded-full border px-3.5 py-1.5 font-body text-sm font-medium transition-colors",
              activeCategory === c.id ? "border-navy bg-navy text-white" : "border-navy/15 text-navy"
            )}
          >
            {c.name}
          </button>
        ))}
      </div>

      <p className="font-body text-xs font-medium text-orange">Choose 1 dish</p>

      <div className="flex flex-col gap-2">
        {filteredItems.map((i) => {
          const selected = dishId === i.id;
          return (
            <button
              key={i.id}
              type="button"
              onClick={() => setDishId(i.id)}
              className={cn(
                "flex items-center justify-between gap-3 rounded-xl border bg-white px-4 py-3 text-left transition-colors",
                selected ? "border-orange bg-orange/5" : "border-navy/10"
              )}
            >
              <div className="flex items-center gap-3">
                {i.imageUrl && (
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg">
                    <Image src={i.imageUrl} alt="" fill sizes="48px" className="object-cover" />
                  </div>
                )}
                <div>
                  <p className="font-body text-sm font-semibold text-navy">{i.name}</p>
                  <p className="font-body text-xs text-text-grey">{i.description}</p>
                  <p className="font-body text-sm font-semibold text-navy">{formatCurrency(i.price)}</p>
                </div>
              </div>
              <span className={cn("flex h-5 w-5 shrink-0 items-center justify-center rounded-full border", selected ? "border-orange bg-orange text-white" : "border-navy/20")}>
                {selected && <Check size={12} />}
              </span>
            </button>
          );
        })}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-navy/10 bg-white px-6 py-4">
        <Button type="button" variant="accent" size="lg" className="mx-auto w-full max-w-xl" disabled={!dishId} onClick={handleConfirm}>
          Confirm {guestName.split(" ")[0]}&rsquo;s Choice
        </Button>
      </div>
    </div>
  );
}
