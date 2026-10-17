"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, ArrowRight, MapPin, Star } from "lucide-react";
import { BookingStepper } from "@/components/book/shared/booking-stepper";
import { Button } from "@/components/ui/button";
import { getRestaurantDetails } from "@/lib/restaurant-booking-api";
import { getRestaurantBookingDraft, saveRestaurantSelection } from "@/lib/restaurant-booking-state";
import type { Restaurant } from "@/lib/restaurant-booking-data";

const STEPS = ["Search", "Restaurant", "Menu", "Guests", "Payment", "Confirmation"];

export function RestaurantDetails({ restaurantId }: { restaurantId: string }) {
  const router = useRouter();
  const draft = getRestaurantBookingDraft();
  const search = draft.search;
  const [restaurant, setRestaurant] = useState<Restaurant | null | undefined>(undefined);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  useEffect(() => {
    if (!search) {
      router.replace("/book/restaurant");
      return;
    }
    getRestaurantDetails(restaurantId).then((r) => {
      setRestaurant(r);
      setActiveImage(r?.heroImage ?? null);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId]);

  if (!search) return null;

  if (restaurant === undefined) {
    return (
      <div className="flex flex-col gap-6 pb-16">
        <BookingStepper title="Book a Restaurant" steps={STEPS} activeIndex={1} />
        <div className="h-72 w-full animate-pulse rounded-2xl bg-navy/[0.06]" />
      </div>
    );
  }

  if (restaurant === null) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-navy/10 bg-navy/[0.02] px-6 py-16 text-center">
        <p className="font-heading text-base font-semibold text-navy">This restaurant could not be found.</p>
        <button type="button" onClick={() => router.push("/book/restaurant/listings")} className="font-body text-sm font-semibold text-orange underline underline-offset-2">
          Back to listings
        </button>
      </div>
    );
  }

  function handleViewMenu() {
    saveRestaurantSelection(restaurant!.id);
    router.push(`/book/restaurant/${restaurant!.id}/menu`);
  }

  const thumbnails = [restaurant.heroImage, ...restaurant.galleryImages];

  return (
    <div className="flex flex-col gap-6 pb-16">
      <BookingStepper title="Book a Restaurant" steps={STEPS} activeIndex={1} />

      <button type="button" onClick={() => router.push("/book/restaurant/listings")} className="inline-flex w-fit items-center gap-1.5 font-body text-xs font-semibold text-navy">
        <ArrowLeft size={14} /> Back to results
      </button>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-4 sm:grid-rows-2">
        <div className="relative col-span-1 row-span-2 h-64 overflow-hidden rounded-2xl sm:col-span-3 sm:h-[360px]">
          {activeImage && <Image src={activeImage} alt={restaurant.name} fill sizes="(min-width: 640px) 70vw, 100vw" className="object-cover" priority />}
        </div>
        {thumbnails.length > 1 &&
          thumbnails.slice(0, 2).map((img, i) => (
            <button key={i} type="button" onClick={() => setActiveImage(img)} className="relative hidden h-[176px] overflow-hidden rounded-2xl sm:block">
              <Image src={img} alt="" fill sizes="25vw" className="object-cover transition-transform duration-300 hover:scale-105" />
              {img === activeImage && <span className="absolute inset-0 ring-2 ring-inset ring-orange" />}
            </button>
          ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-6">
          <div>
            <span className="rounded-full bg-navy/5 px-2.5 py-1 font-body text-[11px] font-semibold uppercase tracking-wide text-navy">{restaurant.priceTier}</span>
            <h1 className="mt-2 font-heading text-2xl font-bold text-navy">{restaurant.name}</h1>
            <p className="mt-1 font-body text-sm text-text-grey">{restaurant.cuisine}</p>
            <p className="mt-1 flex items-center gap-1.5 font-body text-sm text-text-grey">
              <MapPin size={13} /> {restaurant.locationLabel}
            </p>
            <div className="mt-2 flex items-center gap-2 font-body text-sm text-navy">
              <span className="flex items-center gap-1 rounded-full bg-navy px-2.5 py-1 text-white">
                <Star size={12} className="fill-white" /> {restaurant.rating}
              </span>
              <span className="text-text-grey">{restaurant.reviewCount.toLocaleString("en-IN")} reviews</span>
            </div>
          </div>

          <p className="font-body text-base leading-relaxed text-navy/80">{restaurant.description}</p>

          <div>
            <h2 className="font-heading text-base font-semibold text-navy">Amenities</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {restaurant.amenities.map((a) => (
                <span key={a} className="rounded-full bg-navy/[0.04] px-3 py-1.5 font-body text-sm text-navy">
                  {a}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:sticky lg:top-8 lg:h-fit">
          <div className="rounded-2xl border border-navy/10 bg-white p-5">
            <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Your reservation</p>
            <p className="mt-1 font-body text-sm text-navy">
              {search.reservationDate} &middot; {search.reservationTime}
            </p>
            <p className="font-body text-sm text-navy">
              {search.guestCount} guest{search.guestCount === 1 ? "" : "s"}
            </p>
            <Button type="button" variant="accent" size="lg" className="mt-4 w-full" onClick={handleViewMenu}>
              View Menu <ArrowRight size={14} className="ml-1.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
