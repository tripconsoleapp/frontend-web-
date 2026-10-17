/**
 * Standalone Hotel Booking — MOCK catalog (Phase 1, frontend-only).
 *
 * This is a deliberately separate dataset from lib/mock-hotel-catalog.ts
 * (which belongs to the Trip Builder's per-destination Hotel flow). The two
 * are intentionally not shared: the standalone "Book a single service"
 * flow has its own booking lifecycle and must not be coupled to Trip
 * Builder state. See lib/hotel-booking-api.ts for the repository
 * functions that read this data — pages should call that module, never
 * this one directly, so a future real backend swap touches one file.
 *
 * Every record here is synthetic. `isMock: true` is threaded through the
 * API layer's responses (not this file) so nothing downstream can forget
 * it's demo data.
 */

export type CancellationTerms = "free" | "non_refundable";
export type MealPlan = "room_only" | "breakfast_included" | "half_board";
export type PropertyType = "Hotel" | "Resort" | "Villa" | "Homestay";

export interface HotelDestination {
  id: string;
  name: string;
  region: string;
  heroImage: string;
}

export interface HotelRoomOption {
  id: string;
  hotelId: string;
  name: string;
  image: string;
  bedType: string;
  maxGuests: number;
  amenities: string[];
  mealPlan: MealPlan;
  pricePerNight: number;
  cancellation: CancellationTerms;
  /** Only meaningful when cancellation === "free" — days before check-in
   *  after which the stay becomes non-refundable. */
  freeCancellationDaysBeforeCheckIn?: number;
  availableRooms: number;
}

export interface HotelReview {
  author: string;
  rating: number;
  date: string;
  text: string;
}

export interface Hotel {
  id: string;
  destinationId: string;
  name: string;
  location: string;
  images: string[];
  starRating: number;
  /** 0–10 guest-review scale (the convention shown in search/filter UI). */
  guestRating: number;
  reviewCount: number;
  propertyType: PropertyType;
  description: string;
  amenities: string[];
  checkInTime: string;
  checkOutTime: string;
  reviews: HotelReview[];
  rooms: HotelRoomOption[];
}

export const HOTEL_DESTINATIONS: HotelDestination[] = [
  { id: "munnar", name: "Munnar", region: "Kerala", heroImage: "https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=800&q=80" },
  { id: "thekkady", name: "Thekkady", region: "Kerala", heroImage: "https://images.unsplash.com/photo-1609920658906-8223bd289001?auto=format&fit=crop&w=800&q=80" },
  { id: "kovalam", name: "Kovalam", region: "Kerala", heroImage: "https://images.unsplash.com/photo-1540202404-a2f29016b523?auto=format&fit=crop&w=800&q=80" },
  { id: "alappuzha", name: "Alappuzha", region: "Kerala", heroImage: "https://images.unsplash.com/photo-1593693411515-c20261bcad6e?auto=format&fit=crop&w=800&q=80" },
  { id: "wayanad", name: "Wayanad", region: "Kerala", heroImage: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80" },
  { id: "kochi", name: "Kochi", region: "Kerala", heroImage: "https://images.unsplash.com/photo-1583395363028-3e2ebf33ea5c?auto=format&fit=crop&w=800&q=80" },
];

const IMG = {
  hillPool: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1400&q=80",
  resortExterior: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1400&q=80",
  paddyPool: "https://images.unsplash.com/photo-1615460549969-36fa19521a4f?auto=format&fit=crop&w=1400&q=80",
  luxuryNight: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1400&q=80",
  cabanaDusk: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1400&q=80",
  poolDusk: "https://images.unsplash.com/photo-1596436889106-be35e843f974?auto=format&fit=crop&w=1400&q=80",
  goldenTerrace: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1400&q=80",
  dining: "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=1400&q=80",
  heritageFacade: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1400&q=80",
  backwaterHouseboat: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1400&q=80",
  beachfront: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80",
  forestVilla: "https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&w=1400&q=80",
  roomKing: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1000&q=80",
  roomFamily: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1000&q=80",
  roomTwin: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1000&q=80",
  roomSuite: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1000&q=80",
};

const AMENITY_POOLS: Record<string, string[]> = {
  full: ["Wi-Fi", "Parking", "Pool", "Restaurant", "Breakfast", "AC", "Room Service", "Power Backup", "Laundry"],
  mid: ["Wi-Fi", "Parking", "Restaurant", "Breakfast", "AC"],
  simple: ["Wi-Fi", "Parking", "Fan Cooled"],
};

function room(
  hotelId: string,
  idx: number,
  overrides: Partial<HotelRoomOption> & Pick<HotelRoomOption, "name" | "bedType" | "maxGuests" | "pricePerNight" | "image" | "mealPlan" | "cancellation">
): HotelRoomOption {
  return {
    id: `${hotelId}-room-${idx}`,
    hotelId,
    amenities: ["AC", "Wi-Fi"],
    availableRooms: 4,
    freeCancellationDaysBeforeCheckIn: overrides.cancellation === "free" ? 2 : undefined,
    ...overrides,
  };
}

function makeHotel(input: {
  id: string;
  destinationId: string;
  name: string;
  propertyType: PropertyType;
  distanceLabel: string;
  starRating: number;
  guestRating: number;
  reviewCount: number;
  description: string;
  amenityPool: keyof typeof AMENITY_POOLS;
  images: string[];
  rooms: HotelRoomOption[];
}): Hotel {
  const destination = HOTEL_DESTINATIONS.find((d) => d.id === input.destinationId)!;
  return {
    id: input.id,
    destinationId: input.destinationId,
    name: input.name,
    location: `${destination.name}, ${destination.region} · ${input.distanceLabel}`,
    images: input.images,
    starRating: input.starRating,
    guestRating: input.guestRating,
    reviewCount: input.reviewCount,
    propertyType: input.propertyType,
    description: input.description,
    amenities: AMENITY_POOLS[input.amenityPool],
    checkInTime: "2:00 PM",
    checkOutTime: "11:00 AM",
    reviews: [
      { author: "Arjun M.", rating: 5, date: "Sep 2026", text: "Absolutely stunning property, the views from the room were unreal." },
      { author: "Priya N.", rating: 4, date: "Aug 2026", text: "Great stay overall — breakfast spread was a highlight. Could use faster Wi-Fi." },
      { author: "Vishnu T.", rating: 5, date: "Jul 2026", text: "Staff went out of their way to help with a late check-in. Would book again." },
    ],
    rooms: input.rooms,
  };
}

export const MOCK_HOTELS: Hotel[] = [
  // ---------------- Munnar ----------------
  makeHotel({
    id: "mountain-mist-resort",
    destinationId: "munnar",
    name: "Mountain Mist Resort",
    propertyType: "Resort",
    distanceLabel: "2.5 km from town centre",
    starRating: 4,
    guestRating: 8.9,
    reviewCount: 214,
    description:
      "A hillside resort framed by tea estates, with an infinity-edge pool looking out over the Western Ghats.",
    amenityPool: "full",
    images: [IMG.hillPool, IMG.cabanaDusk, IMG.goldenTerrace, IMG.dining],
    rooms: [
      room("mountain-mist-resort", 1, { name: "Standard Twin Room", bedType: "2 Twin Beds", maxGuests: 2, pricePerNight: 4800, image: IMG.roomTwin, mealPlan: "breakfast_included", cancellation: "free" }),
      room("mountain-mist-resort", 2, { name: "Deluxe Garden View", bedType: "1 King Bed", maxGuests: 2, pricePerNight: 6200, image: IMG.roomKing, mealPlan: "breakfast_included", cancellation: "free", amenities: ["AC", "Wi-Fi", "Balcony"] }),
      room("mountain-mist-resort", 3, { name: "Family Luxury Suite", bedType: "1 King Bed + Sofa Bed", maxGuests: 4, pricePerNight: 9500, image: IMG.roomSuite, mealPlan: "half_board", cancellation: "non_refundable", amenities: ["AC", "Wi-Fi", "Living Area"] }),
    ],
  }),
  makeHotel({
    id: "munnar-heritage-retreat",
    destinationId: "munnar",
    name: "Munnar Heritage Retreat",
    propertyType: "Homestay",
    distanceLabel: "3.6 km from town centre",
    starRating: 3,
    guestRating: 8.2,
    reviewCount: 96,
    description: "A colonial-era plantation bungalow converted into an intimate, family-run homestay among the tea gardens.",
    amenityPool: "mid",
    images: [IMG.heritageFacade, IMG.dining],
    rooms: [
      room("munnar-heritage-retreat", 1, { name: "Heritage Twin Room", bedType: "2 Twin Beds", maxGuests: 2, pricePerNight: 3200, image: IMG.roomTwin, mealPlan: "breakfast_included", cancellation: "free" }),
      room("munnar-heritage-retreat", 2, { name: "Planter's Suite", bedType: "1 Queen Bed", maxGuests: 3, pricePerNight: 4500, image: IMG.roomKing, mealPlan: "breakfast_included", cancellation: "non_refundable" }),
    ],
  }),

  // ---------------- Thekkady ----------------
  makeHotel({
    id: "periyar-woods-homestay",
    destinationId: "thekkady",
    name: "Periyar Woods Homestay",
    propertyType: "Homestay",
    distanceLabel: "1.8 km from Periyar reserve",
    starRating: 3,
    guestRating: 8.6,
    reviewCount: 142,
    description: "A quiet forest-edge homestay a short walk from the Periyar Tiger Reserve gate, run by a local family.",
    amenityPool: "mid",
    images: [IMG.forestVilla, IMG.dining],
    rooms: [
      room("periyar-woods-homestay", 1, { name: "Garden View Room", bedType: "1 Queen Bed", maxGuests: 2, pricePerNight: 2800, image: IMG.roomTwin, mealPlan: "breakfast_included", cancellation: "free" }),
      room("periyar-woods-homestay", 2, { name: "Family Room", bedType: "2 Queen Beds", maxGuests: 4, pricePerNight: 4200, image: IMG.roomFamily, mealPlan: "half_board", cancellation: "free" }),
    ],
  }),
  makeHotel({
    id: "spice-hills-resort",
    destinationId: "thekkady",
    name: "Spice Hills Resort",
    propertyType: "Resort",
    distanceLabel: "4.2 km from Periyar reserve",
    starRating: 4,
    guestRating: 8.4,
    reviewCount: 178,
    description: "Set inside a working spice plantation, with guided walks and a pool overlooking the hills.",
    amenityPool: "full",
    images: [IMG.resortExterior, IMG.poolDusk],
    rooms: [
      room("spice-hills-resort", 1, { name: "Plantation View Room", bedType: "1 King Bed", maxGuests: 2, pricePerNight: 5400, image: IMG.roomKing, mealPlan: "breakfast_included", cancellation: "free" }),
      room("spice-hills-resort", 2, { name: "Deluxe Suite", bedType: "1 King Bed + Sofa Bed", maxGuests: 3, pricePerNight: 7800, image: IMG.roomSuite, mealPlan: "half_board", cancellation: "non_refundable" }),
    ],
  }),

  // ---------------- Kovalam ----------------
  makeHotel({
    id: "fragrant-nature-resort",
    destinationId: "kovalam",
    name: "Fragrant Nature Resort",
    propertyType: "Resort",
    distanceLabel: "600 m from Lighthouse Beach",
    starRating: 5,
    guestRating: 9.1,
    reviewCount: 326,
    description: "A beachfront resort steps from Kovalam's Lighthouse Beach, with sea-facing rooms and an open-air dining deck.",
    amenityPool: "full",
    images: [IMG.beachfront, IMG.poolDusk, IMG.dining],
    rooms: [
      room("fragrant-nature-resort", 1, { name: "Deluxe Garden View", bedType: "1 King Bed", maxGuests: 2, pricePerNight: 8400, image: IMG.roomKing, mealPlan: "breakfast_included", cancellation: "free" }),
      room("fragrant-nature-resort", 2, { name: "Sea View Suite", bedType: "1 King Bed", maxGuests: 2, pricePerNight: 12500, image: IMG.roomSuite, mealPlan: "half_board", cancellation: "free" }),
    ],
  }),
  makeHotel({
    id: "coconut-grove-villas",
    destinationId: "kovalam",
    name: "Coconut Grove Villas",
    propertyType: "Villa",
    distanceLabel: "1.2 km from Lighthouse Beach",
    starRating: 4,
    guestRating: 8.7,
    reviewCount: 110,
    description: "Private villas set among coconut groves, a short walk from the beach, each with its own plunge pool.",
    amenityPool: "full",
    images: [IMG.forestVilla, IMG.poolDusk],
    rooms: [
      room("coconut-grove-villas", 1, { name: "One-Bedroom Villa", bedType: "1 King Bed", maxGuests: 2, pricePerNight: 7200, image: IMG.roomKing, mealPlan: "breakfast_included", cancellation: "free" }),
      room("coconut-grove-villas", 2, { name: "Two-Bedroom Villa", bedType: "2 King Beds", maxGuests: 4, pricePerNight: 11800, image: IMG.roomFamily, mealPlan: "breakfast_included", cancellation: "non_refundable" }),
    ],
  }),

  // ---------------- Alappuzha ----------------
  makeHotel({
    id: "backwater-pearl-resort",
    destinationId: "alappuzha",
    name: "Backwater Pearl Resort",
    propertyType: "Resort",
    distanceLabel: "On the Punnamada backwaters",
    starRating: 4,
    guestRating: 8.8,
    reviewCount: 203,
    description: "Waterside cottages on stilts along the Punnamada backwaters, with a private jetty and houseboat transfers.",
    amenityPool: "full",
    images: [IMG.backwaterHouseboat, IMG.paddyPool],
    rooms: [
      room("backwater-pearl-resort", 1, { name: "Waterside Cottage", bedType: "1 Queen Bed", maxGuests: 2, pricePerNight: 5600, image: IMG.roomTwin, mealPlan: "breakfast_included", cancellation: "free" }),
      room("backwater-pearl-resort", 2, { name: "Premium Lake View Cottage", bedType: "1 King Bed", maxGuests: 3, pricePerNight: 7400, image: IMG.roomKing, mealPlan: "half_board", cancellation: "free" }),
    ],
  }),
  makeHotel({
    id: "paddy-field-homestay",
    destinationId: "alappuzha",
    name: "Paddy Field Homestay",
    propertyType: "Homestay",
    distanceLabel: "6 km from Alappuzha town",
    starRating: 3,
    guestRating: 8.3,
    reviewCount: 74,
    description: "A family homestay set between working paddy fields, with home-cooked Kerala meals included.",
    amenityPool: "mid",
    images: [IMG.paddyPool, IMG.dining],
    rooms: [
      room("paddy-field-homestay", 1, { name: "Paddy View Room", bedType: "1 Queen Bed", maxGuests: 2, pricePerNight: 2600, image: IMG.roomTwin, mealPlan: "breakfast_included", cancellation: "free" }),
      room("paddy-field-homestay", 2, { name: "Family Room", bedType: "2 Queen Beds", maxGuests: 4, pricePerNight: 3900, image: IMG.roomFamily, mealPlan: "half_board", cancellation: "non_refundable" }),
    ],
  }),

  // ---------------- Wayanad ----------------
  makeHotel({
    id: "wayanad-wild-canopy",
    destinationId: "wayanad",
    name: "Wayanad Wild Canopy",
    propertyType: "Resort",
    distanceLabel: "3 km from Chembra Peak trailhead",
    starRating: 4,
    guestRating: 8.9,
    reviewCount: 158,
    description: "Treehouse-style cottages overlooking the Wayanad forest canopy, with guided nature walks included.",
    amenityPool: "full",
    images: [IMG.forestVilla, IMG.goldenTerrace],
    rooms: [
      room("wayanad-wild-canopy", 1, { name: "Canopy Cottage", bedType: "1 King Bed", maxGuests: 2, pricePerNight: 6800, image: IMG.roomKing, mealPlan: "breakfast_included", cancellation: "free" }),
      room("wayanad-wild-canopy", 2, { name: "Family Treehouse", bedType: "1 King Bed + Bunk", maxGuests: 4, pricePerNight: 9900, image: IMG.roomSuite, mealPlan: "half_board", cancellation: "non_refundable" }),
    ],
  }),

  // ---------------- Kochi ----------------
  makeHotel({
    id: "fort-kochi-heritage-inn",
    destinationId: "kochi",
    name: "Fort Kochi Heritage Inn",
    propertyType: "Hotel",
    distanceLabel: "400 m from Chinese Fishing Nets",
    starRating: 4,
    guestRating: 8.5,
    reviewCount: 241,
    description: "A restored Dutch-era townhouse in Fort Kochi's heritage quarter, a short stroll from the waterfront.",
    amenityPool: "full",
    images: [IMG.heritageFacade, IMG.luxuryNight, IMG.dining],
    rooms: [
      room("fort-kochi-heritage-inn", 1, { name: "Heritage Double Room", bedType: "1 Queen Bed", maxGuests: 2, pricePerNight: 4400, image: IMG.roomTwin, mealPlan: "breakfast_included", cancellation: "free" }),
      room("fort-kochi-heritage-inn", 2, { name: "Courtyard Suite", bedType: "1 King Bed", maxGuests: 3, pricePerNight: 6900, image: IMG.roomSuite, mealPlan: "half_board", cancellation: "free" }),
    ],
  }),
];

export function getHotelById(hotelId: string): Hotel | null {
  return MOCK_HOTELS.find((h) => h.id === hotelId) ?? null;
}

export function getRoomById(hotelId: string, roomId: string): HotelRoomOption | null {
  const hotel = getHotelById(hotelId);
  if (!hotel) return null;
  return hotel.rooms.find((r) => r.id === roomId) ?? null;
}
