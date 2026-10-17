/**
 * Standalone Activity Booking — MOCK catalog (frontend-only).
 *
 * Deliberately separate from lib/mock-activity-catalog.ts, which belongs to
 * the Trip Builder's per-destination Activity flow (tied to a trip's stay
 * dates and participant count). This standalone "Book a single activity"
 * flow has its own date/time-slot + ticket-quantity booking lifecycle and
 * must not be coupled to Trip Builder state. The shape below intentionally
 * mirrors that catalog's conventions (activity → schedule/pricing) for
 * visual/naming consistency, but nothing here is imported from it.
 *
 * Slot availability is DETERMINISTIC, not random: `getSlotRemaining()`
 * hashes (activityId, date, time) to a stable number so the same inputs
 * always produce the same remaining-capacity figure across renders and
 * page loads, per the no-fake-live-inventory requirement.
 */

export type ActivityCategory = "Adventure" | "Nature" | "Tours" | "Culture" | "Wildlife" | "Water Sports";
export type Difficulty = "Easy" | "Moderate" | "Challenging";

export interface ActivityDestination {
  id: string;
  name: string;
  region: string;
  heroImage: string;
}

export interface TicketType {
  id: string;
  label: string;
  /** Per-person price for this ticket type. */
  price: number;
  /** Informational age band shown next to the ticket label, e.g. "5–12 yrs". */
  ageLabel?: string;
  /** Optional per-booking cap for this specific ticket type (e.g. a private
   *  group slot only ever sells 1). Independent of overall slot capacity. */
  maxPerBooking?: number;
}

export interface Activity {
  id: string;
  destinationId: string;
  name: string;
  category: ActivityCategory;
  heroImage: string;
  galleryImages: string[];
  rating: number;
  reviewCount: number;
  durationHours: number;
  difficulty?: Difficulty;
  /** Overall minimum age to participate at all, if any. When set, the
   *  catalog entry's own `ticketTypes` already reflects it (e.g. no "Child"
   *  ticket is offered) — this field is shown to the customer as the
   *  explanation, not enforced generically against every activity. */
  minAge?: number;
  location: string;
  shortDescription: string;
  fullDescription: string;
  highlights: string[];
  included: string[];
  excluded: string[];
  meetingPoint: string;
  whatToBring?: string[];
  safetyInfo?: string[];
  cancellationPolicy: string;
  ticketTypes: TicketType[];
  timesAvailable: string[];
  capacityPerSlot: number;
  /** Weekdays (0=Sun..6=Sat) this activity doesn't run at all, e.g. a
   *  plantation closed on Mondays for maintenance. Deterministic, not
   *  random, so "no slots this day" is reliably testable. */
  closedWeekdays?: number[];
  /** Specific ISO dates explicitly sold out, for a guaranteed, testable
   *  "fully booked date" scenario independent of the hash-based remaining
   *  count below. */
  fullyBookedDates?: string[];
}

export const ACTIVITY_DESTINATIONS: ActivityDestination[] = [
  { id: "munnar", name: "Munnar", region: "Kerala", heroImage: "https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=800&q=80" },
  { id: "thekkady", name: "Thekkady", region: "Kerala", heroImage: "https://images.unsplash.com/photo-1609920658906-8223bd289001?auto=format&fit=crop&w=800&q=80" },
  { id: "kovalam", name: "Kovalam", region: "Kerala", heroImage: "https://images.unsplash.com/photo-1540202404-a2f29016b523?auto=format&fit=crop&w=800&q=80" },
  { id: "alappuzha", name: "Alappuzha", region: "Kerala", heroImage: "https://images.unsplash.com/photo-1593693411515-c20261bcad6e?auto=format&fit=crop&w=800&q=80" },
  { id: "wayanad", name: "Wayanad", region: "Kerala", heroImage: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80" },
  { id: "kochi", name: "Kochi", region: "Kerala", heroImage: "https://images.unsplash.com/photo-1583395363028-3e2ebf33ea5c?auto=format&fit=crop&w=800&q=80" },
];

const IMG = {
  hillTea: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80",
  safariSunset: "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80",
  mountainSunrise: "https://images.unsplash.com/photo-1585409677983-0f6c41ca9c3b?auto=format&fit=crop&w=1200&q=80",
  forestMonastery: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80",
  goldenTerrace: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1200&q=80",
  localFood: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1200&q=80",
  backwater: "https://images.unsplash.com/photo-1593693411515-c20261bcad6e?auto=format&fit=crop&w=1200&q=80",
  kayak: "https://images.unsplash.com/photo-1526188717906-ab4aed6d9a54?auto=format&fit=crop&w=1200&q=80",
  kathakali: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80",
};

export const ACTIVITIES: Activity[] = [
  {
    id: "munnar-tea-plantation-walk",
    destinationId: "munnar",
    name: "Guided Tea Plantation Walk",
    category: "Tours",
    heroImage: IMG.hillTea,
    galleryImages: [IMG.goldenTerrace],
    rating: 4.8,
    reviewCount: 126,
    durationHours: 2,
    difficulty: "Easy",
    location: "Munnar · Tea Estate Road",
    shortDescription: "A quiet guided walk through working tea gardens, ending with a tasting session.",
    fullDescription:
      "Walk through century-old tea plantations with a local guide, learning how the leaves are picked and processed, before a guided tasting session at a working tea factory.",
    highlights: ["Walk through working tea gardens", "Visit a tea factory", "Guided tasting of fresh Munnar tea"],
    included: ["Local guide", "Tea tasting", "Factory entry"],
    excluded: ["Transport to meeting point", "Personal expenses"],
    meetingPoint: "Tea Estate Road entrance, Munnar",
    whatToBring: ["Comfortable walking shoes", "Light jacket (hill weather)"],
    cancellationPolicy: "Free cancellation up to 24 hours before start time.",
    ticketTypes: [
      { id: "adult", label: "Adult", price: 900 },
      { id: "child", label: "Child", price: 450, ageLabel: "5–12 yrs" },
    ],
    timesAvailable: ["06:00", "08:00", "15:30"],
    capacityPerSlot: 25,
    closedWeekdays: [1],
  },
  {
    id: "munnar-jeep-wildlife-safari",
    destinationId: "munnar",
    name: "Jeep Safari to Top Station",
    category: "Wildlife",
    heroImage: IMG.safariSunset,
    galleryImages: [IMG.mountainSunrise],
    rating: 4.6,
    reviewCount: 98,
    durationHours: 3,
    difficulty: "Moderate",
    minAge: 5,
    location: "Munnar · Top Station Road",
    shortDescription: "An open-jeep ride along winding hill roads to one of the Western Ghats' highest viewpoints.",
    fullDescription:
      "An open-jeep ride along winding hill roads to Top Station, with stops for photos and panoramic views across the Western Ghats.",
    highlights: ["Panoramic Western Ghats views", "Off-road hill terrain", "Photo stops along the route"],
    included: ["Jeep with driver", "Fuel", "Viewpoint entry"],
    excluded: ["Meals", "Personal expenses"],
    meetingPoint: "Munnar town jeep stand",
    safetyInfo: ["Seatbelts required at all times", "Not recommended during heavy monsoon"],
    cancellationPolicy: "Free cancellation up to 12 hours before start time.",
    ticketTypes: [
      { id: "adult", label: "Adult", price: 1600 },
      { id: "child", label: "Child", price: 900, ageLabel: "5–12 yrs" },
    ],
    timesAvailable: ["07:00", "14:00"],
    capacityPerSlot: 12,
  },
  {
    id: "thekkady-spice-plantation-visit",
    destinationId: "thekkady",
    name: "Spice Plantation Visit",
    category: "Culture",
    heroImage: IMG.goldenTerrace,
    galleryImages: [IMG.hillTea],
    rating: 4.5,
    reviewCount: 87,
    durationHours: 2,
    difficulty: "Easy",
    location: "Thekkady · Spice Village Road",
    shortDescription: "A guided walk through a working spice plantation growing cardamom, pepper and vanilla.",
    fullDescription:
      "A guided walk through a working spice plantation growing cardamom, pepper, clove and vanilla, with tasting samples and a small on-site market.",
    highlights: ["Taste fresh-picked spices", "Learn traditional cultivation methods", "Small on-site spice market"],
    included: ["Guide", "Plantation entry", "Tasting samples"],
    excluded: ["Transport", "Purchases at the spice market"],
    meetingPoint: "Spice Village Road entrance, Thekkady",
    cancellationPolicy: "Free cancellation up to 24 hours before start time.",
    ticketTypes: [
      { id: "adult", label: "Adult", price: 400 },
      { id: "child", label: "Child", price: 200, ageLabel: "5–12 yrs" },
      { id: "student", label: "Student", price: 300, ageLabel: "With valid ID" },
    ],
    timesAvailable: ["09:00", "11:30", "15:00"],
    capacityPerSlot: 45,
  },
  {
    id: "thekkady-waterfall-guided-trek",
    destinationId: "thekkady",
    name: "Waterfall Guided Trek",
    category: "Adventure",
    heroImage: IMG.forestMonastery,
    galleryImages: [IMG.mountainSunrise],
    rating: 4.4,
    reviewCount: 52,
    durationHours: 4,
    difficulty: "Challenging",
    minAge: 12,
    location: "Thekkady · Periyar Tiger Reserve",
    shortDescription: "A forest-department-run trek to a remote waterfall inside the Periyar reserve.",
    fullDescription:
      "A forest-department-run trek through dense reserve forest to a remote waterfall, with steep, uneven terrain not suitable for young children.",
    highlights: ["Remote waterfall viewpoint", "Guided forest trek", "Wildlife spotting en route"],
    included: ["Forest department permit", "Guide", "First-aid kit on trek"],
    excluded: ["Meals", "Personal expenses"],
    meetingPoint: "Periyar Tiger Reserve trek office",
    whatToBring: ["Sturdy trekking shoes", "Rain jacket", "Water bottle"],
    safetyInfo: ["Minimum age 12 — steep, uneven terrain", "Not recommended for those with knee/heart conditions"],
    cancellationPolicy: "Non-refundable — limited daily forest permits.",
    ticketTypes: [{ id: "adult", label: "Adult (12+)", price: 1800 }],
    timesAvailable: ["07:00"],
    capacityPerSlot: 15,
    fullyBookedDates: [],
  },
  {
    id: "alappuzha-backwater-houseboat-cruise",
    destinationId: "alappuzha",
    name: "Backwater Houseboat Cruise",
    category: "Tours",
    heroImage: IMG.backwater,
    galleryImages: [IMG.goldenTerrace],
    rating: 4.7,
    reviewCount: 210,
    durationHours: 3,
    difficulty: "Easy",
    location: "Alappuzha · Finishing Point Jetty",
    shortDescription: "A relaxed half-day cruise through Alappuzha's backwaters on a traditional houseboat.",
    fullDescription:
      "A relaxed half-day cruise through Alappuzha's palm-lined backwaters and paddy fields on a traditional Kerala houseboat, with a light lunch included.",
    highlights: ["Traditional Kerala houseboat", "Palm-lined backwater views", "On-board light lunch"],
    included: ["Houseboat cruise", "Light lunch", "Life jackets"],
    excluded: ["Alcoholic beverages", "Personal expenses"],
    meetingPoint: "Finishing Point Jetty, Alappuzha",
    cancellationPolicy: "Free cancellation up to 24 hours before start time.",
    ticketTypes: [
      { id: "adult", label: "Adult", price: 1200 },
      { id: "child", label: "Child", price: 600, ageLabel: "5–12 yrs" },
    ],
    timesAvailable: ["09:00", "13:00"],
    capacityPerSlot: 20,
  },
  {
    id: "alappuzha-kayaking-backwaters",
    destinationId: "alappuzha",
    name: "Kayaking the Backwaters",
    category: "Water Sports",
    heroImage: IMG.kayak,
    galleryImages: [IMG.backwater],
    rating: 4.6,
    reviewCount: 68,
    durationHours: 2,
    difficulty: "Moderate",
    minAge: 10,
    location: "Alappuzha · Kainakary Village",
    shortDescription: "A guided kayaking trip through narrow backwater canals, away from the houseboat routes.",
    fullDescription:
      "A guided kayaking trip through narrow backwater canals in Kainakary village, reaching parts of the backwaters houseboats can't access.",
    highlights: ["Narrow village canals", "Guided kayak instruction", "Away from the main houseboat routes"],
    included: ["Kayak and paddle", "Life jacket", "Guide"],
    excluded: ["Transport to village", "Change of clothes"],
    meetingPoint: "Kainakary Village canal dock",
    safetyInfo: ["Minimum age 10", "Basic swimming ability recommended"],
    cancellationPolicy: "Free cancellation up to 24 hours before start time.",
    ticketTypes: [{ id: "adult", label: "Adult / Youth (10+)", price: 1100 }],
    timesAvailable: ["07:30", "16:00"],
    capacityPerSlot: 10,
  },
  {
    id: "wayanad-wildlife-sanctuary-safari",
    destinationId: "wayanad",
    name: "Wildlife Sanctuary Jeep Safari",
    category: "Wildlife",
    heroImage: IMG.safariSunset,
    galleryImages: [IMG.goldenTerrace],
    rating: 4.5,
    reviewCount: 76,
    durationHours: 2,
    difficulty: "Easy",
    minAge: 5,
    location: "Wayanad · Muthanga Wildlife Sanctuary",
    shortDescription: "An early-morning jeep safari through the Muthanga sanctuary, part of the Nilgiri Biosphere Reserve.",
    fullDescription:
      "An early-morning jeep safari through the Muthanga Wildlife Sanctuary, part of the Nilgiri Biosphere Reserve, with a naturalist guide spotting elephants, deer and langurs.",
    highlights: ["Spot elephants, deer and langurs", "Nilgiri Biosphere Reserve", "Early-morning wildlife activity"],
    included: ["Jeep with driver", "Forest department entry", "Guide"],
    excluded: ["Meals"],
    meetingPoint: "Muthanga Wildlife Sanctuary gate",
    cancellationPolicy: "Non-refundable — limited daily safari slots.",
    ticketTypes: [
      { id: "adult", label: "Adult", price: 1400 },
      { id: "child", label: "Child", price: 700, ageLabel: "5–12 yrs" },
    ],
    timesAvailable: ["06:00", "15:30"],
    capacityPerSlot: 18,
    fullyBookedDates: [],
  },
  {
    id: "wayanad-soochipara-nature-trail",
    destinationId: "wayanad",
    name: "Guided Nature Trail to Soochipara Falls",
    category: "Nature",
    heroImage: IMG.mountainSunrise,
    galleryImages: [IMG.forestMonastery],
    rating: 4.6,
    reviewCount: 143,
    durationHours: 2.5,
    difficulty: "Moderate",
    location: "Wayanad · Soochipara",
    shortDescription: "A rock-cut trail to a three-tiered waterfall, with sweeping views of the Wayanad plateau.",
    fullDescription:
      "A guided nature trail along a rock-cut path to Soochipara's three-tiered waterfall, with stops for photos and a swim-permitted pool at the base.",
    highlights: ["Three-tiered waterfall", "Panoramic plateau views", "Swim-permitted pool at the base"],
    included: ["Entry ticket", "Local guide"],
    excluded: ["Transport to trailhead", "Towels"],
    meetingPoint: "Soochipara Falls base parking",
    whatToBring: ["Swimwear (optional)", "Non-slip footwear"],
    cancellationPolicy: "Free cancellation up to 24 hours before start time.",
    ticketTypes: [
      { id: "adult", label: "Adult", price: 350 },
      { id: "child", label: "Child", price: 180, ageLabel: "5–12 yrs" },
    ],
    timesAvailable: ["08:00", "10:30", "14:00"],
    capacityPerSlot: 60,
  },
  {
    id: "kovalam-kathakali-cultural-experience",
    destinationId: "kovalam",
    name: "Kathakali Cultural Experience",
    category: "Culture",
    heroImage: IMG.kathakali,
    galleryImages: [IMG.localFood],
    rating: 4.7,
    reviewCount: 190,
    durationHours: 1.5,
    difficulty: "Easy",
    location: "Kovalam · Cultural Centre",
    shortDescription: "A live Kathakali performance with a pre-show demonstration of the traditional make-up process.",
    fullDescription:
      "Watch performers apply traditional Kathakali make-up before a live performance of this classical Kerala dance-drama, with an English narrator explaining the story.",
    highlights: ["Live traditional make-up demonstration", "Full Kathakali performance", "English narration"],
    included: ["Entry", "Programme booklet"],
    excluded: ["Transport", "Refreshments"],
    meetingPoint: "Kovalam Cultural Centre main entrance",
    cancellationPolicy: "Free cancellation up to 6 hours before start time.",
    ticketTypes: [
      { id: "adult", label: "Adult", price: 500 },
      { id: "child", label: "Child", price: 250, ageLabel: "5–12 yrs" },
      { id: "student", label: "Student", price: 350, ageLabel: "With valid ID" },
    ],
    timesAvailable: ["17:00", "19:00"],
    capacityPerSlot: 80,
  },
];

export function getActivitiesForDestination(destinationId: string) {
  return ACTIVITIES.filter((a) => a.destinationId === destinationId);
}

export function getPopularActivities(destinationId: string) {
  return getActivitiesForDestination(destinationId)
    .slice()
    .sort((a, b) => b.rating * b.reviewCount - a.rating * a.reviewCount)
    .slice(0, 3);
}

export function getActivity(id: string): Activity | null {
  return ACTIVITIES.find((a) => a.id === id) ?? null;
}

export function getActivityCategories(destinationId: string): ActivityCategory[] {
  return Array.from(new Set(getActivitiesForDestination(destinationId).map((a) => a.category)));
}

/** Simple, stable string hash (FNV-1a variant) — same inputs always
 *  produce the same output, across renders, reloads and server/client. */
function stableHash(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash);
}

export function getWeekday(dateISO: string): number {
  return new Date(`${dateISO}T00:00:00`).getDay();
}

/** Deterministic remaining-capacity for one (activity, date, time) slot.
 *  Returns 0 when the activity is closed that weekday or the date is in
 *  `fullyBookedDates` — otherwise a stable 1..capacityPerSlot figure. */
export function getSlotRemaining(activity: Activity, dateISO: string, time: string): number {
  if (activity.closedWeekdays?.includes(getWeekday(dateISO))) return 0;
  if (activity.fullyBookedDates?.includes(dateISO)) return 0;
  const hash = stableHash(`${activity.id}|${dateISO}|${time}`);
  return (hash % activity.capacityPerSlot) + 1;
}

export function isDateFullyUnavailable(activity: Activity, dateISO: string): boolean {
  return activity.timesAvailable.every((t) => getSlotRemaining(activity, dateISO, t) <= 0);
}
