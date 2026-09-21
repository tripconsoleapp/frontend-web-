"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "motion/react";
import { ArrowRight, Check, MapPin, Star } from "lucide-react";
import { Restaurant } from "@/lib/mock-restaurant-catalog";
import { useTripContext } from "@/lib/use-trip-context";
import { MEAL_LABELS, fitsGroup, parseMealKey } from "@/lib/meal-plan";
import { MealInstance, getServicesDraft, saveServicesDraft } from "@/lib/listing-draft";
import { MealContextHeader } from "./meal-context-header";

export function RestaurantDetail({
  mealKey: key,
  restaurant,
  template,
}: {
  mealKey: string;
  restaurant: Restaurant;
  template?: string;
}) {
  const router = useRouter();
  const trip = useTripContext();
  const { dayIndex, mealType } = parseMealKey(key);
  const templateQuery = template ? `?template=${template}` : "";

  const [activeImage, setActiveImage] = useState(restaurant.heroImage);
  // sessionStorage isn't available during SSR — defer the real read to an
  // effect so the first paint doesn't depend on it.
  const [meal, setMeal] = useState<MealInstance | null>(null);
  useEffect(() => {
    const found = getServicesDraft().restaurant.meals.find((m) => m.dayIndex === dayIndex && m.mealType === mealType);
    setMeal(found ?? null);
  }, [dayIndex, mealType]);
  const fits = fitsGroup(restaurant.capacity, trip.passengerCount);
  const thumbnails = [restaurant.heroImage, ...restaurant.galleryImages];

  function handleViewMenu() {
    const draft = getServicesDraft();
    const next = draft.restaurant.meals.map((m) =>
      m.dayIndex === dayIndex && m.mealType === mealType
        ? {
            ...m,
            status: "restaurant_selected" as const,
            restaurant: {
              id: restaurant.id,
              name: restaurant.name,
              cuisine: restaurant.cuisine,
              location: restaurant.locationLabel,
              imageUrl: restaurant.heroImage,
              rating: restaurant.rating,
              capacity: restaurant.capacity,
            },
          }
        : m
    );
    saveServicesDraft({ ...draft, restaurant: { ...draft.restaurant, meals: next } });
    router.push(`/trips/create/services/restaurant/${key}/menu${templateQuery}`);
  }

  return (
    <div className="flex flex-col gap-6 pb-10">
      <MealContextHeader
        backHref={`/trips/create/services/restaurant/${key}/restaurants${templateQuery}`}
        backLabel="Back to results"
        eyebrow="Restaurant"
        meal={meal ? { destinationName: meal.destinationName, dayIndex: meal.dayIndex, mealType: meal.mealType } : undefined}
      />

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-4 sm:grid-rows-2">
        <div className="relative col-span-1 row-span-2 h-64 overflow-hidden rounded-2xl sm:col-span-3 sm:h-[360px]">
          <Image src={activeImage} alt={restaurant.name} fill sizes="(min-width: 640px) 70vw, 100vw" className="object-cover" priority />
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
            <span className="rounded-full bg-navy/5 px-2.5 py-1 font-body text-[11px] font-semibold uppercase tracking-wide text-navy">
              {restaurant.priceTier}
            </span>
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

          <div>
            <h2 className="font-heading text-base font-semibold text-navy">Meals served</h2>
            <p className="mt-2 font-body text-sm text-navy">{restaurant.mealTypes.map((mt) => MEAL_LABELS[mt]).join(" · ")}</p>
          </div>
        </div>

        <div className="lg:sticky lg:top-8 lg:h-fit">
          <div className="rounded-2xl border border-navy/10 bg-white p-5">
            <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Group capacity</p>
            <p className="font-heading text-2xl font-bold text-navy">{restaurant.capacity} guests</p>
            <p
              className={
                fits
                  ? "mt-1 flex items-center gap-1.5 font-body text-sm font-medium text-navy"
                  : "mt-1 flex items-center gap-1.5 font-body text-sm font-medium text-orange"
              }
            >
              {fits ? (
                <>
                  <Check size={14} /> Suitable for {trip.passengerCount} guests
                </>
              ) : (
                `⚠ May not accommodate your ${trip.passengerCount}-guest group`
              )}
            </p>
            <motion.button
              type="button"
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleViewMenu}
              className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-full bg-orange px-6 py-3 font-body text-sm font-semibold text-white transition-colors hover:bg-orange/90"
            >
              View Menu <ArrowRight size={14} />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
