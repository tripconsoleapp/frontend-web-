/**
 * Mock activity + hidden-gem catalog for the destination-based Activity
 * flow. Structured so the shape (activity → schedule/pricing) maps
 * directly onto a future real inventory/booking API — swap the arrays
 * below for a fetch and the flow's capacity/conflict math keeps working
 * unchanged.
 *
 * Activities and Hidden Gems are deliberately separate arrays with
 * different shapes: an Activity is schedulable and priced, a HiddenGem is
 * discovery-only (no price, no duration commitment) — see AGENTS-level
 * spec section 2. They are tagged by `destinationId`, matching the ids in
 * `lib/kerala-locations.ts`.
 */

export type ActivityCategory =
  | "Adventure"
  | "Nature"
  | "Tours"
  | "Culture"
  | "Outdoor";

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
  capacity: number;
  pricingType: "per_person" | "per_group";
  unitPrice: number;
  location: string;
  lat: number;
  lng: number;
  description: string;
  highlights: string[];
  included: string[];
  excluded: string[];
  meetingPoint: string;
  timesAvailable: string[];
  difficulty?: "Easy" | "Moderate" | "Challenging";
  cancellationPolicy: string;
}

export type HiddenGemType = "Viewpoint" | "Waterfall" | "Village" | "Food Spot";

export interface HiddenGem {
  id: string;
  destinationId: string;
  name: string;
  type: HiddenGemType;
  imageUrl: string;
  distanceLabel: string;
  durationLabel: string;
  description: string;
  lat: number;
  lng: number;
}

const IMG = {
  hillTea: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80",
  safariSunset: "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80",
  mountainSunrise: "https://images.unsplash.com/photo-1585409677983-0f6c41ca9c3b?auto=format&fit=crop&w=1200&q=80",
  forestMonastery: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80",
  goldenTerrace: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1200&q=80",
  localFood: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1200&q=80",
};

export const ACTIVITIES: Activity[] = [
  // ---------- Munnar ----------
  {
    id: "munnar-tea-estate-tour",
    destinationId: "munnar",
    name: "Tea Estate Sunrise Tour",
    category: "Tours",
    heroImage: IMG.hillTea,
    galleryImages: [IMG.goldenTerrace],
    rating: 4.8,
    reviewCount: 126,
    durationHours: 2.5,
    capacity: 50,
    pricingType: "per_person",
    unitPrice: 1200,
    location: "Munnar · Tea Estate Road",
    lat: 10.0932,
    lng: 77.0641,
    description:
      "A guided walk through working tea gardens at sunrise, ending with a tasting session at a working tea factory.",
    highlights: [
      "Walk through century-old tea plantations",
      "Visit a working tea factory",
      "Guided tasting of fresh Munnar tea",
    ],
    included: ["Local guide", "Tea tasting", "Factory entry"],
    excluded: ["Transport to meeting point", "Personal expenses"],
    meetingPoint: "Tea Estate Road entrance, Munnar",
    timesAvailable: ["06:00", "07:30", "09:00"],
    difficulty: "Easy",
    cancellationPolicy: "Free cancellation up to 24 hours before start time.",
  },
  {
    id: "munnar-jeep-safari",
    destinationId: "munnar",
    name: "Jeep Safari to Top Station",
    category: "Adventure",
    heroImage: IMG.safariSunset,
    galleryImages: [IMG.mountainSunrise],
    rating: 4.6,
    reviewCount: 98,
    durationHours: 3,
    capacity: 24,
    pricingType: "per_group",
    unitPrice: 3200,
    location: "Munnar · Top Station Road",
    lat: 10.1201,
    lng: 77.1023,
    description:
      "An open-jeep ride along winding hill roads to Top Station, one of the highest viewpoints in the Western Ghats.",
    highlights: ["Panoramic Western Ghats views", "Off-road hill terrain", "Photo stops along the route"],
    included: ["Jeep with driver", "Fuel", "Viewpoint entry"],
    excluded: ["Meals", "Personal expenses"],
    meetingPoint: "Munnar town jeep stand",
    timesAvailable: ["07:00", "14:00"],
    difficulty: "Moderate",
    cancellationPolicy: "Free cancellation up to 12 hours before start time.",
  },
  {
    id: "munnar-eravikulam-trek",
    destinationId: "munnar",
    name: "Eravikulam National Park Trek",
    category: "Nature",
    heroImage: IMG.mountainSunrise,
    galleryImages: [IMG.forestMonastery],
    rating: 4.7,
    reviewCount: 64,
    durationHours: 2,
    capacity: 40,
    pricingType: "per_person",
    unitPrice: 500,
    location: "Munnar · Eravikulam National Park",
    lat: 10.1631,
    lng: 77.0508,
    description:
      "A guided trek through shola grasslands, home to the endangered Nilgiri Tahr, with views of Anamudi peak.",
    highlights: ["Spot the Nilgiri Tahr", "Views of Anamudi, South India's highest peak", "Shola grassland ecosystem"],
    included: ["Park entry", "Naturalist guide", "Shuttle within park"],
    excluded: ["Transport to park gate"],
    meetingPoint: "Eravikulam National Park gate",
    timesAvailable: ["08:00", "10:00", "13:00"],
    difficulty: "Moderate",
    cancellationPolicy: "Non-refundable — park permits are allocated per slot.",
  },

  // ---------- Thekkady ----------
  {
    id: "thekkady-spice-plantation-walk",
    destinationId: "thekkady",
    name: "Spice Plantation Walk",
    category: "Culture",
    heroImage: IMG.goldenTerrace,
    galleryImages: [IMG.hillTea],
    rating: 4.5,
    reviewCount: 87,
    durationHours: 2,
    capacity: 45,
    pricingType: "per_person",
    unitPrice: 400,
    location: "Thekkady · Spice Village Road",
    lat: 9.5989,
    lng: 77.1611,
    description: "A guided walk through a working spice plantation growing cardamom, pepper, clove and vanilla.",
    highlights: ["Taste fresh-picked spices", "Learn traditional cultivation methods", "Small on-site spice market"],
    included: ["Guide", "Plantation entry", "Tasting samples"],
    excluded: ["Transport", "Purchases at the spice market"],
    meetingPoint: "Spice Village Road entrance, Thekkady",
    timesAvailable: ["09:00", "15:00"],
    difficulty: "Easy",
    cancellationPolicy: "Free cancellation up to 24 hours before start time.",
  },
  {
    id: "thekkady-bamboo-rafting",
    destinationId: "thekkady",
    name: "Bamboo Rafting Experience",
    category: "Adventure",
    heroImage: IMG.forestMonastery,
    galleryImages: [IMG.mountainSunrise],
    rating: 4.4,
    reviewCount: 52,
    durationHours: 4,
    capacity: 20,
    pricingType: "per_person",
    unitPrice: 1800,
    location: "Thekkady · Periyar Tiger Reserve",
    lat: 9.5936,
    lng: 77.1892,
    description:
      "A forest-department-run bamboo raft trip along the Periyar reservoir, combined with a guided forest walk.",
    highlights: ["Bamboo raft on Periyar Lake", "Guided forest walk", "Wildlife spotting from the water"],
    included: ["Forest department permit", "Life jacket", "Guide"],
    excluded: ["Meals", "Personal expenses"],
    meetingPoint: "Periyar Tiger Reserve boat jetty",
    timesAvailable: ["07:00"],
    difficulty: "Challenging",
    cancellationPolicy: "Non-refundable — limited daily permits.",
  },

  // ---------- Wayanad ----------
  {
    id: "wayanad-edakkal-caves-trek",
    destinationId: "wayanad",
    name: "Edakkal Caves Trek",
    category: "Adventure",
    heroImage: IMG.mountainSunrise,
    galleryImages: [IMG.forestMonastery],
    rating: 4.6,
    reviewCount: 143,
    durationHours: 2.5,
    capacity: 60,
    pricingType: "per_person",
    unitPrice: 350,
    location: "Wayanad · Edakkal Hills",
    lat: 11.5734,
    lng: 76.0004,
    description: "A rock-cut trail up to prehistoric cave carvings, with sweeping views of the Wayanad plateau.",
    highlights: ["Prehistoric rock carvings", "Panoramic plateau views", "Moderate rock-cut trail"],
    included: ["Entry ticket", "Local guide"],
    excluded: ["Transport to hill base"],
    meetingPoint: "Edakkal Caves base parking",
    timesAvailable: ["08:00", "10:30", "14:00"],
    difficulty: "Moderate",
    cancellationPolicy: "Free cancellation up to 24 hours before start time.",
  },
  {
    id: "wayanad-wildlife-safari",
    destinationId: "wayanad",
    name: "Wildlife Sanctuary Jeep Safari",
    category: "Nature",
    heroImage: IMG.safariSunset,
    galleryImages: [IMG.goldenTerrace],
    rating: 4.5,
    reviewCount: 76,
    durationHours: 2,
    capacity: 18,
    pricingType: "per_group",
    unitPrice: 2800,
    location: "Wayanad · Muthanga Wildlife Sanctuary",
    lat: 11.6103,
    lng: 76.3821,
    description: "An early-morning jeep safari through the Muthanga sanctuary, part of the Nilgiri Biosphere Reserve.",
    highlights: ["Spot elephants, deer and langurs", "Nilgiri Biosphere Reserve", "Early-morning wildlife activity"],
    included: ["Jeep with driver", "Forest department entry", "Guide"],
    excluded: ["Meals"],
    meetingPoint: "Muthanga Wildlife Sanctuary gate",
    timesAvailable: ["06:00", "15:30"],
    difficulty: "Easy",
    cancellationPolicy: "Non-refundable — limited daily safari slots.",
  },
];

export const HIDDEN_GEMS: HiddenGem[] = [
  {
    id: "munnar-lockhart-gap",
    destinationId: "munnar",
    name: "Lockhart Gap Viewpoint",
    type: "Viewpoint",
    imageUrl: IMG.goldenTerrace,
    distanceLabel: "12 min from your route",
    durationLabel: "30 min",
    description: "A quiet cliffside viewpoint over the tea valleys, popular with locals at golden hour.",
    lat: 10.1102,
    lng: 77.0389,
  },
  {
    id: "munnar-top-station-sunset",
    destinationId: "munnar",
    name: "Top Station Sunset Point",
    type: "Viewpoint",
    imageUrl: IMG.safariSunset,
    distanceLabel: "25 min from your route",
    durationLabel: "45 min",
    description: "A lesser-visited ledge past the main Top Station lookout, with an uninterrupted sunset view.",
    lat: 10.1223,
    lng: 77.1041,
  },
  {
    id: "thekkady-pandikuzhi",
    destinationId: "thekkady",
    name: "Pandikuzhi Picnic Spot",
    type: "Village",
    imageUrl: IMG.forestMonastery,
    distanceLabel: "18 min from your route",
    durationLabel: "1 hour",
    description: "A quiet riverside clearing near a small tribal settlement, rarely on the standard tour circuit.",
    lat: 9.5721,
    lng: 77.1502,
  },
  {
    id: "thekkady-spice-market",
    destinationId: "thekkady",
    name: "Kumily Local Spice Market",
    type: "Food Spot",
    imageUrl: IMG.localFood,
    distanceLabel: "8 min from your route",
    durationLabel: "30 min",
    description: "A small local market street where residents buy spices and snacks — good for an authentic bite.",
    lat: 9.6079,
    lng: 77.1601,
  },
  {
    id: "wayanad-chain-tree",
    destinationId: "wayanad",
    name: "Chain Tree Legend Spot",
    type: "Viewpoint",
    imageUrl: IMG.mountainSunrise,
    distanceLabel: "15 min from your route",
    durationLabel: "20 min",
    description: "A folklore-linked banyan tree wrapped in iron chains, on a quiet forest bend few tourists stop at.",
    lat: 11.5967,
    lng: 76.1103,
  },
  {
    id: "wayanad-soochipara",
    destinationId: "wayanad",
    name: "Soochipara Falls Viewpoint",
    type: "Waterfall",
    imageUrl: IMG.hillTea,
    distanceLabel: "22 min from your route",
    durationLabel: "40 min",
    description: "A quieter upper viewpoint over the falls, reached by a short trail away from the main crowd.",
    lat: 11.5289,
    lng: 76.1187,
  },
];

export function getActivitiesForDestination(destinationId: string) {
  return ACTIVITIES.filter((a) => a.destinationId === destinationId);
}

export function getActivity(id: string) {
  return ACTIVITIES.find((a) => a.id === id);
}

export function getHiddenGemsForDestination(destinationId: string) {
  return HIDDEN_GEMS.filter((g) => g.destinationId === destinationId);
}

export function getActivityCategories(destinationId: string): ActivityCategory[] {
  return Array.from(new Set(getActivitiesForDestination(destinationId).map((a) => a.category)));
}
