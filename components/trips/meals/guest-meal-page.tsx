"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Check } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatCurrency } from "@/lib/mock-trips";
import { addGuestResponse, getSharedMeal, generateGuestId, MEAL_LABELS, SharedMealSnapshot } from "@/lib/meal-plan";

type Stage = "loading" | "not-found" | "identify" | "select" | "done";

export function GuestMealPage({ token }: { token: string }) {
  const [stage, setStage] = useState<Stage>("loading");
  const [snapshot, setSnapshot] = useState<SharedMealSnapshot | null>(null);
  const [name, setName] = useState("");
  const [dietFilter, setDietFilter] = useState<"all" | "veg" | "non-veg">("all");
  const [activeCategory, setActiveCategory] = useState("");
  const [mainItemId, setMainItemId] = useState<string | null>(null);
  const [extraItemId, setExtraItemId] = useState<string | null>(null);

  useEffect(() => {
    const found = getSharedMeal(token);
    if (!found) {
      setStage("not-found");
      return;
    }
    setSnapshot(found);
    setActiveCategory(found.categories[0]?.id ?? "");
    setStage("identify");
  }, [token]);

  const mainCategory = useMemo(() => snapshot?.categories.find((c) => c.name.toLowerCase().includes("main")), [snapshot]);
  const currentCategory = snapshot?.categories.find((c) => c.id === activeCategory);
  const isMainCategory = mainCategory?.id === activeCategory;

  const filteredItems = useMemo(() => {
    if (!currentCategory) return [];
    return currentCategory.items.filter((i) => {
      if (dietFilter === "veg") return i.diet === "veg" || i.diet === "vegan" || i.diet === "jain";
      if (dietFilter === "non-veg") return i.diet === "non-veg";
      return true;
    });
  }, [currentCategory, dietFilter]);

  function selectItem(itemId: string) {
    if (isMainCategory) setMainItemId(itemId);
    else setExtraItemId((current) => (current === itemId ? null : itemId));
  }

  function handleSubmit() {
    if (!snapshot || !mainCategory || !mainItemId) return;
    const mainItem = mainCategory.items.find((i) => i.id === mainItemId);
    if (!mainItem) return;
    let extraItem = null as null | { id: string; name: string; price: number };
    if (extraItemId) {
      for (const c of snapshot.categories) {
        const found = c.items.find((i) => i.id === extraItemId);
        if (found) {
          extraItem = { id: found.id, name: found.name, price: found.price };
          break;
        }
      }
    }
    addGuestResponse(token, {
      guestId: generateGuestId(),
      guestName: name.trim(),
      mainItemId: mainItem.id,
      mainItemName: mainItem.name,
      mainPrice: mainItem.price,
      extraItemId: extraItem?.id,
      extraItemName: extraItem?.name,
      extraPrice: extraItem?.price,
      respondedAt: new Date().toISOString(),
    });
    setStage("done");
  }

  if (stage === "loading") {
    return <CenteredShell><div className="h-40 w-full max-w-sm animate-pulse rounded-2xl bg-navy/[0.06]" /></CenteredShell>;
  }

  if (stage === "not-found") {
    return (
      <CenteredShell>
        <p className="font-heading text-lg font-semibold text-navy">This meal link isn&rsquo;t available.</p>
        <p className="mt-2 max-w-sm text-center font-body text-sm text-text-grey">
          It may have expired, or was opened in a different browser than the one that generated it.
        </p>
      </CenteredShell>
    );
  }

  if (!snapshot) return null;

  if (stage === "identify") {
    return (
      <CenteredShell>
        <div className="w-full max-w-sm rounded-2xl border border-navy/10 bg-white p-6">
          <p className="font-body text-xs font-semibold uppercase tracking-wide text-orange">
            {snapshot.tripName}
          </p>
          <h1 className="mt-1 font-heading text-lg font-semibold text-navy">
            Day {snapshot.dayIndex} &middot; {MEAL_LABELS[snapshot.mealType]}
          </h1>
          <p className="font-body text-sm text-text-grey">
            {snapshot.restaurantName} &middot; {snapshot.destinationName}
          </p>
          <p className="mt-4 font-body text-sm font-medium text-navy">What&rsquo;s your name?</p>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Arjun S."
            className="mt-2 w-full rounded-xl border border-navy/15 bg-navy/[0.03] px-4 py-3 font-body text-base text-navy placeholder:text-text-grey/60 focus:border-navy focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy/10"
          />
          <p className="mt-1.5 font-body text-xs text-text-grey">
            Use the same name your organizer knows you by, to avoid duplicates.
          </p>
          <button
            type="button"
            disabled={!name.trim()}
            onClick={() => setStage("select")}
            className="mt-4 w-full rounded-full bg-orange px-6 py-3 font-body text-sm font-semibold text-white transition-colors hover:bg-orange/90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Continue
          </button>
        </div>
      </CenteredShell>
    );
  }

  if (stage === "done") {
    const mainItem = mainCategory?.items.find((i) => i.id === mainItemId);
    return (
      <CenteredShell>
        <motion.span
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-mint/50 text-navy"
        >
          <Check size={26} />
        </motion.span>
        <p className="mt-4 font-heading text-lg font-semibold text-navy">You&rsquo;re all set!</p>
        <p className="mt-1 font-body text-sm text-text-grey">Your choice:</p>
        <p className="font-body text-base font-semibold text-navy">{mainItem?.name}</p>
        {mainItem && <p className="font-body text-sm text-text-grey">{formatCurrency(mainItem.price)}</p>}
        <p className="mt-4 font-body text-sm text-text-grey">You can close this page now.</p>
      </CenteredShell>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col gap-5 bg-[#FAF8F4] px-5 py-8">
      <div>
        <p className="font-body text-xs font-semibold uppercase tracking-wide text-orange">TripConsole</p>
        <h1 className="font-heading text-xl font-bold text-navy">Hi {name.split(" ")[0]} 👋</h1>
        <p className="font-body text-sm text-text-grey">
          Choose your {snapshot.mealType.toLowerCase()}. {snapshot.restaurantName}
        </p>
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
        {snapshot.categories.map((c) => (
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

      {isMainCategory && <p className="font-body text-xs font-medium text-orange">Choose 1 main course</p>}

      <div className="flex flex-col gap-2">
        {filteredItems.map((i) => {
          const selected = isMainCategory ? mainItemId === i.id : extraItemId === i.id;
          return (
            <button
              key={i.id}
              type="button"
              onClick={() => selectItem(i.id)}
              className={cn(
                "flex items-center justify-between gap-3 rounded-xl border bg-white px-4 py-3 text-left transition-colors",
                selected ? "border-orange bg-orange/5" : "border-navy/10"
              )}
            >
              <div>
                <p className="font-body text-sm font-semibold text-navy">{i.name}</p>
                <p className="font-body text-xs text-text-grey">{i.description}</p>
                <p className="font-body text-sm font-semibold text-navy">{formatCurrency(i.price)}</p>
              </div>
              <span
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                  selected ? "border-orange bg-orange text-white" : "border-navy/20"
                )}
              >
                {selected && <Check size={12} />}
              </span>
            </button>
          );
        })}
      </div>

      <div className="sticky bottom-0 mt-4 border-t border-navy/10 bg-[#FAF8F4] py-4">
        <button
          type="button"
          disabled={!mainItemId}
          onClick={handleSubmit}
          className="w-full rounded-full bg-orange px-6 py-3 font-body text-sm font-semibold text-white transition-colors hover:bg-orange/90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Confirm My Choice
        </button>
      </div>
    </div>
  );
}

function CenteredShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-2 bg-[#FAF8F4] px-6 text-center">
      {children}
    </div>
  );
}
