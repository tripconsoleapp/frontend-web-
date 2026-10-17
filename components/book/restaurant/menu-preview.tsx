"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Flame, Star } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatCurrency } from "@/lib/mock-trips";
import { BookingStepper } from "@/components/book/shared/booking-stepper";
import { Button } from "@/components/ui/button";
import { getRestaurantDetails } from "@/lib/restaurant-booking-api";
import { getNextIncompleteGuestIndex, getRestaurantBookingDraft } from "@/lib/restaurant-booking-state";
import type { Restaurant } from "@/lib/restaurant-booking-data";

const STEPS = ["Search", "Restaurant", "Menu", "Guests", "Payment", "Confirmation"];

export function MenuPreview({ restaurantId }: { restaurantId: string }) {
  const router = useRouter();
  const draft = getRestaurantBookingDraft();
  const search = draft.search;
  const [restaurant, setRestaurant] = useState<Restaurant | null | undefined>(undefined);
  const [activeCategory, setActiveCategory] = useState("");

  useEffect(() => {
    if (!search || draft.selectedRestaurantId !== restaurantId) {
      router.replace("/book/restaurant");
      return;
    }
    getRestaurantDetails(restaurantId).then((r) => {
      setRestaurant(r);
      setActiveCategory(r?.menu[0]?.id ?? "");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId]);

  if (!search || draft.selectedRestaurantId !== restaurantId) return null;

  if (restaurant === undefined) {
    return (
      <div className="flex flex-col gap-6 pb-16">
        <BookingStepper title="Book a Restaurant" steps={STEPS} activeIndex={2} />
        <div className="h-64 w-full animate-pulse rounded-2xl bg-navy/[0.06]" />
      </div>
    );
  }
  if (restaurant === null) return null;

  const currentCategory = restaurant.menu.find((c) => c.id === activeCategory);

  function handleProceed() {
    const nextIndex = getNextIncompleteGuestIndex(draft);
    router.push(nextIndex >= search!.guestCount ? "/book/restaurant/review" : `/book/restaurant/guests/${nextIndex}/identify`);
  }

  return (
    <div className="flex flex-col gap-6 pb-32">
      <BookingStepper title="Book a Restaurant" steps={STEPS} activeIndex={2} />

      <button type="button" onClick={() => router.push(`/book/restaurant/${restaurant.id}`)} className="inline-flex w-fit items-center gap-1.5 font-body text-xs font-semibold text-navy">
        <ArrowLeft size={14} /> Back to restaurant
      </button>

      <div>
        <h1 className="font-heading text-xl font-bold text-navy">{restaurant.name}</h1>
        <p className="font-body text-sm text-text-grey">
          Menu preview &mdash; each of your {search.guestCount} guest{search.guestCount === 1 ? "" : "s"} will pick their own dish next.
        </p>
      </div>

      <div className="sticky top-0 z-10 -mx-1 flex gap-2 overflow-x-auto bg-[#FAF8F4] px-1 py-2">
        {restaurant.menu.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveCategory(cat.id)}
            className={cn(
              "shrink-0 rounded-full border px-3.5 py-1.5 font-body text-sm font-medium transition-colors",
              activeCategory === cat.id ? "border-orange bg-orange/10 text-orange" : "border-navy/15 text-navy hover:border-navy/30"
            )}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {currentCategory && (
        <div className="flex flex-col gap-3">
          {currentCategory.items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 border-b border-navy/10 pb-4">
              {item.imageUrl && (
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
                  <Image src={item.imageUrl} alt={item.name} fill sizes="64px" className="object-cover" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className={cn("inline-block h-2.5 w-2.5 shrink-0 rounded-sm border", item.diet === "veg" || item.diet === "vegan" ? "border-mint bg-mint" : "border-destructive bg-destructive")} />
                  <p className="font-body text-sm font-semibold text-navy">{item.name}</p>
                  {item.popular && <Star size={12} className="fill-orange text-orange" />}
                  {item.spicy && <Flame size={12} className="text-orange" />}
                </div>
                <p className="mt-0.5 font-body text-xs text-text-grey">{item.description}</p>
                <p className="mt-0.5 font-body text-sm font-semibold text-navy">{formatCurrency(item.price)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="fixed inset-x-0 bottom-0 z-20 flex items-center justify-between border-t border-navy/10 bg-white px-6 py-3">
        <p className="font-body text-sm text-text-grey">
          {search.guestCount} guest{search.guestCount === 1 ? "" : "s"} will choose individually
        </p>
        <Button type="button" variant="accent" onClick={handleProceed}>
          Proceed to Guest Selection <ArrowRight size={14} className="ml-1.5" />
        </Button>
      </div>
    </div>
  );
}
