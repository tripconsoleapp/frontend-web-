/**
 * Mock accommodation catalog for the destination-based Hotel flow.
 * Structured so the shape (hotel → room types, numeric price/capacity) maps
 * directly onto a future real inventory API — swap the arrays below for a
 * fetch and the flow's room/pricing math keeps working unchanged.
 *
 * Hotels are tagged by `destinationId`, matching the ids in
 * `lib/kerala-locations.ts` — the same destinations the organizer actually
 * built their route from in the Destinations step.
 */

export type PropertyType = "Resort" | "Heritage Stay" | "Homestay" | "Boutique Hotel" | "Hotel";

export interface RoomType {
  id: string;
  name: string;
  sleeps: number;
  beds: string;
  view?: string;
  sizeSqft?: number;
  breakfastIncluded: boolean;
  cancellation: "free" | "non-refundable";
  amenities: string[];
  pricePerNight: number;
  imageUrl: string;
}

export interface HotelReview {
  author: string;
  date: string;
  text: string;
}

export interface Hotel {
  id: string;
  destinationId: string;
  name: string;
  propertyType: PropertyType;
  locationLabel: string;
  distanceFromCenterKm: number;
  rating: number;
  ratingLabel: string;
  reviewCount: number;
  ratingBreakdown: { cleanliness: number; location: number; service: number };
  description: string;
  amenities: string[];
  heroImage: string;
  galleryImages: string[];
  reviews: HotelReview[];
  freeCancellationAvailable: boolean;
  rooms: RoomType[];
}

const IMG = {
  hillCottagesPool:
    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80",
  genericHotel:
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
  paddyFieldPool:
    "https://images.unsplash.com/photo-1615460549969-36fa19521a4f?auto=format&fit=crop&w=1200&q=80",
  luxuryNight:
    "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80",
  poolCabanaDusk:
    "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1200&q=80",
  poolDusk2:
    "https://images.unsplash.com/photo-1596436889106-be35e843f974?auto=format&fit=crop&w=1200&q=80",
  viewGoldenTerrace:
    "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1200&q=80",
  dining:
    "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=1200&q=80",
  roomCozyKing:
    "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=900&q=80",
  roomFamilyWood:
    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=80",
  roomHeritage:
    "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=900&q=80",
};

function deluxeDouble(price: number, view: string): RoomType {
  return {
    id: "deluxe-double",
    name: "Deluxe Double Room",
    sleeps: 2,
    beds: "1 King Bed",
    view,
    breakfastIncluded: true,
    cancellation: "free",
    amenities: ["AC", "Wi-Fi", "Balcony"],
    pricePerNight: price,
    imageUrl: IMG.roomCozyKing,
  };
}

function familySuite(price: number, view: string): RoomType {
  return {
    id: "family-suite",
    name: "Family Suite",
    sleeps: 4,
    beds: "2 Beds",
    view,
    breakfastIncluded: true,
    cancellation: "free",
    amenities: ["AC", "Wi-Fi", "Sofa Area"],
    pricePerNight: price,
    imageUrl: IMG.roomFamilyWood,
  };
}

function standardTwin(price: number): RoomType {
  return {
    id: "standard-twin",
    name: "Standard Twin Room",
    sleeps: 2,
    beds: "2 Twin Beds",
    breakfastIncluded: false,
    cancellation: "non-refundable",
    amenities: ["Fan Cooled"],
    pricePerNight: price,
    imageUrl: IMG.roomHeritage,
  };
}

export const HOTELS: Hotel[] = [
  // ---------- Munnar ----------
  {
    id: "mountain-mist-resort",
    destinationId: "munnar",
    name: "Mountain Mist Resort",
    propertyType: "Resort",
    locationLabel: "Munnar · 2.4 km from center",
    distanceFromCenterKm: 2.4,
    rating: 4.8,
    ratingLabel: "Excellent",
    reviewCount: 128,
    ratingBreakdown: { cleanliness: 4.8, location: 4.7, service: 4.9 },
    description:
      "A hillside resort framed by tea estates, with an infinity-edge pool looking out over the Western Ghats.",
    amenities: ["Pool", "Wi-Fi", "Parking", "Restaurant", "AC", "Power Backup", "Room Service", "Laundry"],
    heroImage: IMG.hillCottagesPool,
    galleryImages: [IMG.poolCabanaDusk, IMG.viewGoldenTerrace, IMG.dining],
    reviews: [
      { author: "Rahul S.", date: "Oct 2023", text: "Amazing stay! The mountain views were unbeatable and the pool area is stunning at sunset." },
      { author: "Priya M.", date: "Sep 2023", text: "Perfect breakfast spread and the staff went out of their way for our group of 40." },
    ],
    freeCancellationAvailable: true,
    rooms: [
      deluxeDouble(4200, "Mountain view"),
      familySuite(6800, "Valley view"),
      standardTwin(2800),
    ],
  },
  {
    id: "tea-valley-inn",
    destinationId: "munnar",
    name: "Tea Valley Inn",
    propertyType: "Homestay",
    locationLabel: "Munnar · 5.1 km from center",
    distanceFromCenterKm: 5.1,
    rating: 4.2,
    ratingLabel: "Very Good",
    reviewCount: 64,
    ratingBreakdown: { cleanliness: 4.3, location: 4.0, service: 4.5 },
    description:
      "A family-run homestay in the middle of Munnar's tea gardens, known for home-cooked breakfasts and quiet mornings.",
    amenities: ["Wi-Fi", "Parking", "Restaurant"],
    heroImage: IMG.genericHotel,
    galleryImages: [IMG.viewGoldenTerrace],
    reviews: [
      { author: "Anand K.", date: "Aug 2023", text: "Simple, clean rooms and genuinely warm hosts. Great for a budget group trip." },
    ],
    freeCancellationAvailable: false,
    rooms: [
      standardTwin(1800),
      familySuite(2900, "Garden view"),
    ],
  },

  // ---------- Alleppey ----------
  {
    id: "backwater-vista-hotel",
    destinationId: "alleppey",
    name: "Backwater Vista Hotel",
    propertyType: "Hotel",
    locationLabel: "Alleppey · 1.2 km from center",
    distanceFromCenterKm: 1.2,
    rating: 4.5,
    ratingLabel: "Excellent",
    reviewCount: 92,
    ratingBreakdown: { cleanliness: 4.6, location: 4.8, service: 4.3 },
    description:
      "A modern waterfront hotel overlooking Alleppey's palm-fringed backwaters, a short walk from the houseboat jetty.",
    amenities: ["Pool", "Wi-Fi", "Restaurant", "AC", "Power Backup", "Room Service"],
    heroImage: IMG.paddyFieldPool,
    galleryImages: [IMG.dining, IMG.poolDusk2],
    reviews: [
      { author: "Meera T.", date: "Nov 2023", text: "Loved waking up to the backwater view. Rooms are modern and spotless." },
    ],
    freeCancellationAvailable: true,
    rooms: [
      deluxeDouble(3600, "Backwater view"),
      familySuite(5800, "Backwater view"),
    ],
  },
  {
    id: "lakeside-heritage-stay",
    destinationId: "alleppey",
    name: "Lakeside Heritage Stay",
    propertyType: "Heritage Stay",
    locationLabel: "Alleppey · 3.6 km from center",
    distanceFromCenterKm: 3.6,
    rating: 4.6,
    ratingLabel: "Excellent",
    reviewCount: 51,
    ratingBreakdown: { cleanliness: 4.7, location: 4.4, service: 4.7 },
    description:
      "A restored heritage bungalow on the canal, furnished with antique Kerala woodwork and a private jetty.",
    amenities: ["Wi-Fi", "Restaurant", "Laundry", "Parking"],
    heroImage: IMG.luxuryNight,
    galleryImages: [IMG.roomHeritage],
    reviews: [
      { author: "Divya R.", date: "Jul 2023", text: "Full of character — the canal-side rooms are gorgeous at dusk." },
    ],
    freeCancellationAvailable: true,
    rooms: [
      { ...deluxeDouble(4400, "Canal view"), id: "heritage-double", name: "Heritage Double Room", imageUrl: IMG.roomHeritage },
      familySuite(7200, "Canal view"),
    ],
  },

  // ---------- Thekkady ----------
  {
    id: "spice-grove-resort",
    destinationId: "thekkady",
    name: "Spice Grove Resort",
    propertyType: "Resort",
    locationLabel: "Thekkady · 1.8 km from center",
    distanceFromCenterKm: 1.8,
    rating: 4.7,
    ratingLabel: "Excellent",
    reviewCount: 88,
    ratingBreakdown: { cleanliness: 4.7, location: 4.9, service: 4.6 },
    description:
      "Set among working spice plantations at the edge of Periyar Tiger Reserve, with guided plantation walks.",
    amenities: ["Pool", "Wi-Fi", "Parking", "Restaurant", "AC", "Power Backup"],
    heroImage: IMG.poolCabanaDusk,
    galleryImages: [IMG.dining, IMG.hillCottagesPool],
    reviews: [
      { author: "Sanjay V.", date: "Dec 2023", text: "The plantation tour included in the stay was a highlight for our whole group." },
    ],
    freeCancellationAvailable: true,
    rooms: [
      deluxeDouble(3900, "Plantation view"),
      familySuite(6200, "Plantation view"),
      standardTwin(2600),
    ],
  },
  {
    id: "periyar-woods-homestay",
    destinationId: "thekkady",
    name: "Periyar Woods Homestay",
    propertyType: "Homestay",
    locationLabel: "Thekkady · 4.3 km from center",
    distanceFromCenterKm: 4.3,
    rating: 4.1,
    ratingLabel: "Very Good",
    reviewCount: 37,
    ratingBreakdown: { cleanliness: 4.2, location: 4.0, service: 4.4 },
    description: "A quiet forest-edge homestay run by a local family, popular with wildlife-focused groups.",
    amenities: ["Wi-Fi", "Parking", "Restaurant"],
    heroImage: IMG.poolDusk2,
    galleryImages: [],
    reviews: [
      { author: "Fathima N.", date: "Jun 2023", text: "Basic but comfortable, and the owners know the reserve inside out." },
    ],
    freeCancellationAvailable: false,
    rooms: [standardTwin(1700), familySuite(2700, "Forest view")],
  },

  // ---------- Wayanad ----------
  {
    id: "wildlife-edge-resort",
    destinationId: "wayanad",
    name: "Wildlife Edge Resort",
    propertyType: "Resort",
    locationLabel: "Wayanad · 3.0 km from center",
    distanceFromCenterKm: 3.0,
    rating: 4.6,
    ratingLabel: "Excellent",
    reviewCount: 74,
    ratingBreakdown: { cleanliness: 4.6, location: 4.7, service: 4.5 },
    description: "A rainforest-adjacent resort with treehouse-style cottages overlooking the wildlife sanctuary.",
    amenities: ["Pool", "Wi-Fi", "Parking", "Restaurant", "AC", "Room Service"],
    heroImage: IMG.hillCottagesPool,
    galleryImages: [IMG.viewGoldenTerrace, IMG.dining],
    reviews: [
      { author: "Vikram J.", date: "Oct 2023", text: "Waking up to birdsong in the treehouse rooms was unforgettable." },
    ],
    freeCancellationAvailable: true,
    rooms: [deluxeDouble(4000, "Forest view"), familySuite(6500, "Forest view")],
  },
  {
    id: "green-canopy-homestay",
    destinationId: "wayanad",
    name: "Green Canopy Homestay",
    propertyType: "Homestay",
    locationLabel: "Wayanad · 6.2 km from center",
    distanceFromCenterKm: 6.2,
    rating: 4.0,
    ratingLabel: "Good",
    reviewCount: 29,
    ratingBreakdown: { cleanliness: 4.1, location: 3.9, service: 4.2 },
    description: "A coffee-estate homestay with simple rooms and shared verandas overlooking the plantation.",
    amenities: ["Wi-Fi", "Parking"],
    heroImage: IMG.genericHotel,
    galleryImages: [],
    reviews: [],
    freeCancellationAvailable: false,
    rooms: [standardTwin(1600), familySuite(2500, "Plantation view")],
  },

  // ---------- Kovalam ----------
  {
    id: "seashell-boutique-hotel",
    destinationId: "kovalam",
    name: "Seashell Boutique Hotel",
    propertyType: "Boutique Hotel",
    locationLabel: "Kovalam · 0.6 km from center",
    distanceFromCenterKm: 0.6,
    rating: 4.7,
    ratingLabel: "Excellent",
    reviewCount: 103,
    ratingBreakdown: { cleanliness: 4.8, location: 4.9, service: 4.5 },
    description: "Steps from Lighthouse Beach, with sea-facing rooms and a rooftop pool deck.",
    amenities: ["Pool", "Wi-Fi", "Restaurant", "AC", "Power Backup", "Room Service", "Elevator"],
    heroImage: IMG.poolCabanaDusk,
    galleryImages: [IMG.dining, IMG.paddyFieldPool],
    reviews: [
      { author: "Arjun P.", date: "Jan 2024", text: "Rooftop pool at sunset is unbeatable, and the beach is a two-minute walk." },
    ],
    freeCancellationAvailable: true,
    rooms: [deluxeDouble(4600, "Sea view"), familySuite(7400, "Sea view")],
  },
  {
    id: "lighthouse-heritage-inn",
    destinationId: "kovalam",
    name: "Lighthouse Heritage Inn",
    propertyType: "Heritage Stay",
    locationLabel: "Kovalam · 1.5 km from center",
    distanceFromCenterKm: 1.5,
    rating: 4.3,
    ratingLabel: "Very Good",
    reviewCount: 58,
    ratingBreakdown: { cleanliness: 4.4, location: 4.5, service: 4.2 },
    description: "A colonial-era inn near the historic lighthouse, with a shaded courtyard restaurant.",
    amenities: ["Wi-Fi", "Restaurant", "Parking", "Laundry"],
    heroImage: IMG.luxuryNight,
    galleryImages: [IMG.roomHeritage],
    reviews: [
      { author: "Nithya S.", date: "Feb 2024", text: "Full of old-world charm, and close enough to walk to the beach." },
    ],
    freeCancellationAvailable: true,
    rooms: [
      { ...deluxeDouble(3400, "Courtyard view"), id: "heritage-double", name: "Heritage Double Room", imageUrl: IMG.roomHeritage },
      standardTwin(2200),
    ],
  },

  // ---------- Sabarimala ----------
  // NOTE: mock/demo entries only — not real establishments. Pamba is the
  // trek base camp referenced in the pilgrimage templates' itineraries but
  // isn't a separately selectable destination in this app's destination
  // model, so Pamba-area lodging is tagged under "sabarimala", the actual
  // destination id the organizer selects.
  {
    id: "sannidhanam-pilgrim-lodge",
    destinationId: "sabarimala",
    name: "Sannidhanam Pilgrim Lodge (Demo)",
    propertyType: "Homestay",
    locationLabel: "Sabarimala · Near Sannidhanam",
    distanceFromCenterKm: 0.5,
    rating: 3.9,
    ratingLabel: "Good",
    reviewCount: 84,
    ratingBreakdown: { cleanliness: 3.9, location: 4.3, service: 3.8 },
    description: "Demo catalog entry — basic shared pilgrim lodging close to the Sannidhanam, for groups needing simple overnight arrangements.",
    amenities: ["Group Seating", "Basic Bedding"],
    heroImage: IMG.genericHotel,
    galleryImages: [],
    reviews: [],
    freeCancellationAvailable: false,
    rooms: [standardTwin(1200), familySuite(2200, "Hillside")],
  },
  {
    id: "pamba-riverside-guesthouse",
    destinationId: "sabarimala",
    name: "Pamba Riverside Guesthouse (Demo)",
    propertyType: "Homestay",
    locationLabel: "Pamba base camp",
    distanceFromCenterKm: 4.5,
    rating: 3.8,
    ratingLabel: "Good",
    reviewCount: 61,
    ratingBreakdown: { cleanliness: 3.8, location: 4.0, service: 3.7 },
    description: "Demo catalog entry — simple guesthouse rooms at the Pamba base camp, before the trek up to Sannidhanam.",
    amenities: ["Parking"],
    heroImage: IMG.genericHotel,
    galleryImages: [],
    reviews: [],
    freeCancellationAvailable: false,
    rooms: [standardTwin(1100), familySuite(1900, "River view")],
  },

  // ---------- Guruvayur ----------
  {
    id: "guruvayur-heritage-stay",
    destinationId: "guruvayur",
    name: "Guruvayur Heritage Stay (Demo)",
    propertyType: "Heritage Stay",
    locationLabel: "Guruvayur · 0.6 km from temple",
    distanceFromCenterKm: 0.6,
    rating: 4.3,
    ratingLabel: "Very Good",
    reviewCount: 142,
    ratingBreakdown: { cleanliness: 4.4, location: 4.6, service: 4.1 },
    description: "Demo catalog entry — a traditional Kerala-style heritage stay a short walk from the temple.",
    amenities: ["Wi-Fi", "Restaurant", "Parking", "AC"],
    heroImage: IMG.genericHotel,
    galleryImages: [IMG.roomHeritage],
    reviews: [],
    freeCancellationAvailable: true,
    rooms: [
      { ...deluxeDouble(2800, "Courtyard view"), id: "heritage-double", name: "Heritage Double Room", imageUrl: IMG.roomHeritage },
      familySuite(4200, "Courtyard view"),
    ],
  },
  {
    id: "krishna-nivas-guest-home",
    destinationId: "guruvayur",
    name: "Krishna Nivas Guest Home (Demo)",
    propertyType: "Homestay",
    locationLabel: "Guruvayur · 1.4 km from temple",
    distanceFromCenterKm: 1.4,
    rating: 4.0,
    ratingLabel: "Very Good",
    reviewCount: 77,
    ratingBreakdown: { cleanliness: 4.1, location: 3.9, service: 4.2 },
    description: "Demo catalog entry — a family-run guest home popular with pilgrim groups visiting the temple.",
    amenities: ["Wi-Fi", "Parking"],
    heroImage: IMG.genericHotel,
    galleryImages: [],
    reviews: [],
    freeCancellationAvailable: false,
    rooms: [standardTwin(1500), familySuite(2600, "Garden view")],
  },

  // ---------- Erumeli ----------
  {
    id: "erumeli-trailhead-lodge",
    destinationId: "erumeli",
    name: "Erumeli Trailhead Lodge (Demo)",
    propertyType: "Homestay",
    locationLabel: "Erumeli · Near Vavar Palli",
    distanceFromCenterKm: 0.7,
    rating: 3.9,
    ratingLabel: "Good",
    reviewCount: 53,
    ratingBreakdown: { cleanliness: 3.9, location: 4.2, service: 3.8 },
    description: "Demo catalog entry — simple lodging for groups starting the traditional route from Erumeli.",
    amenities: ["Parking", "Group Seating"],
    heroImage: IMG.genericHotel,
    galleryImages: [],
    reviews: [],
    freeCancellationAvailable: false,
    rooms: [standardTwin(1300), familySuite(2100, "Hillside")],
  },

  // ---------- Chottanikkara ----------
  {
    id: "chottanikkara-devi-guesthouse",
    destinationId: "chottanikkara",
    name: "Chottanikkara Devi Guesthouse (Demo)",
    propertyType: "Homestay",
    locationLabel: "Chottanikkara · 0.5 km from temple",
    distanceFromCenterKm: 0.5,
    rating: 4.1,
    ratingLabel: "Very Good",
    reviewCount: 68,
    ratingBreakdown: { cleanliness: 4.2, location: 4.4, service: 4.0 },
    description: "Demo catalog entry — a modest guesthouse close to the Chottanikkara temple.",
    amenities: ["Wi-Fi", "Parking"],
    heroImage: IMG.genericHotel,
    galleryImages: [],
    reviews: [],
    freeCancellationAvailable: true,
    rooms: [standardTwin(1400), familySuite(2400, "Garden view")],
  },

  // ---------- Ambalapuzha ----------
  {
    id: "ambalapuzha-heritage-inn",
    destinationId: "ambalapuzha",
    name: "Ambalapuzha Heritage Inn (Demo)",
    propertyType: "Heritage Stay",
    locationLabel: "Ambalapuzha · 0.4 km from temple",
    distanceFromCenterKm: 0.4,
    rating: 4.2,
    ratingLabel: "Very Good",
    reviewCount: 91,
    ratingBreakdown: { cleanliness: 4.3, location: 4.5, service: 4.0 },
    description: "Demo catalog entry — a heritage-style inn near the Ambalapuzha Sri Krishna Temple.",
    amenities: ["Wi-Fi", "Restaurant", "Parking"],
    heroImage: IMG.genericHotel,
    galleryImages: [IMG.roomHeritage],
    reviews: [],
    freeCancellationAvailable: true,
    rooms: [
      { ...deluxeDouble(2600, "Temple view"), id: "heritage-double", name: "Heritage Double Room", imageUrl: IMG.roomHeritage },
      standardTwin(1600),
    ],
  },
];

export function getHotelsForDestination(destinationId: string) {
  return HOTELS.filter((h) => h.destinationId === destinationId);
}

export function getHotel(id: string) {
  return HOTELS.find((h) => h.id === id);
}

export function getRoomType(hotel: Hotel, roomId: string) {
  return hotel.rooms.find((r) => r.id === roomId);
}
