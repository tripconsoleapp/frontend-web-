/**
 * Standalone Restaurant Booking — MOCK catalog (frontend-only).
 *
 * Deliberately separate from lib/mock-restaurant-catalog.ts, which belongs
 * to the Trip Builder's day-wise Meal Planning flow (tied to a trip's
 * destinations/nights). This standalone "Book a single table" flow has its
 * own reservation lifecycle — a guest picks one dish each, not a day/meal
 * slot — and must not be coupled to Trip Builder state. The shape below
 * intentionally mirrors that catalog's conventions (Restaurant → menu
 * categories → items) for visual/naming consistency, but nothing here is
 * imported from it.
 */

export type DietType = "veg" | "veg-and-non-veg";
export type MenuItemDiet = "veg" | "non-veg" | "vegan";
export type PriceTier = "₹" | "₹₹" | "₹₹₹";

export interface RestaurantDestination {
  id: string;
  name: string;
  region: string;
  heroImage: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  diet: MenuItemDiet;
  spicy?: boolean;
  popular?: boolean;
  imageUrl?: string;
}

export interface MenuCategory {
  id: string;
  name: string;
  items: MenuItem[];
}

export interface Restaurant {
  id: string;
  destinationId: string;
  name: string;
  cuisine: string;
  dietType: DietType;
  priceTier: PriceTier;
  rating: number;
  reviewCount: number;
  locationLabel: string;
  distanceFromCenterKm: number;
  amenities: string[];
  description: string;
  heroImage: string;
  galleryImages: string[];
  menu: MenuCategory[];
  /** Curated flag for the standalone flow's "Popular" teaser — independent
   *  of the Trip Builder catalog's own notion of popularity. */
  popular?: boolean;
}

export const RESTAURANT_DESTINATIONS: RestaurantDestination[] = [
  { id: "munnar", name: "Munnar", region: "Kerala", heroImage: "https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=800&q=80" },
  { id: "thekkady", name: "Thekkady", region: "Kerala", heroImage: "https://images.unsplash.com/photo-1609920658906-8223bd289001?auto=format&fit=crop&w=800&q=80" },
  { id: "kovalam", name: "Kovalam", region: "Kerala", heroImage: "https://images.unsplash.com/photo-1540202404-a2f29016b523?auto=format&fit=crop&w=800&q=80" },
  { id: "alappuzha", name: "Alappuzha", region: "Kerala", heroImage: "https://images.unsplash.com/photo-1593693411515-c20261bcad6e?auto=format&fit=crop&w=800&q=80" },
  { id: "wayanad", name: "Wayanad", region: "Kerala", heroImage: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80" },
  { id: "kochi", name: "Kochi", region: "Kerala", heroImage: "https://images.unsplash.com/photo-1583395363028-3e2ebf33ea5c?auto=format&fit=crop&w=800&q=80" },
];

const IMG = {
  southIndianInterior: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80",
  cozyInterior: "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1200&q=80",
  fineDining: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80",
  dosa: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=700&q=80",
  idliThali: "https://images.unsplash.com/photo-1630383249896-424e482df921?auto=format&fit=crop&w=700&q=80",
  southThali: "https://images.unsplash.com/photo-1567337710282-00832b415979?auto=format&fit=crop&w=700&q=80",
  curry: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=700&q=80",
  biryani: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=700&q=80",
  biryaniAlt: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=700&q=80",
  noodles: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=700&q=80",
  burger: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=700&q=80",
  dessert: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=700&q=80",
  mocktail: "https://images.unsplash.com/photo-1560508180-03f285f67ded?auto=format&fit=crop&w=700&q=80",
  seafood: "https://images.unsplash.com/photo-1559737558-2f5a35f4523b?auto=format&fit=crop&w=700&q=80",
};

function southIndianMenu(): MenuCategory[] {
  return [
    {
      id: "starters",
      name: "Starters",
      items: [{ id: "vada", name: "Medu Vada (2 pcs)", description: "Crispy lentil fritters with sambar and chutney", price: 80, diet: "veg", imageUrl: IMG.idliThali }],
    },
    {
      id: "main-course",
      name: "Main Course",
      items: [
        { id: "masala-dosa", name: "Masala Dosa", description: "Crispy dosa with spiced potato masala", price: 120, diet: "veg", popular: true, imageUrl: IMG.dosa },
        { id: "idli", name: "Idli (2 pcs)", description: "Steamed rice cakes with sambar and chutney", price: 80, diet: "veg", imageUrl: IMG.idliThali },
        { id: "uttapam", name: "Uttapam", description: "Thick savoury rice pancake with onion and chilli", price: 140, diet: "veg", imageUrl: IMG.southThali },
        { id: "chicken-chettinad", name: "Chicken Chettinad", description: "Spicy Chettinad-style chicken curry", price: 280, diet: "non-veg", spicy: true, imageUrl: IMG.curry },
        { id: "mutton-biryani", name: "Mutton Biryani", description: "Slow-cooked mutton biryani with raita", price: 320, diet: "non-veg", popular: true, imageUrl: IMG.biryani },
        { id: "fish-curry", name: "Fish Curry Meals", description: "Kerala-style fish curry with rice and sides", price: 260, diet: "non-veg", spicy: true, imageUrl: IMG.curry },
      ],
    },
    {
      id: "desserts",
      name: "Desserts",
      items: [{ id: "payasam", name: "Payasam", description: "Traditional Kerala sweet milk pudding", price: 90, diet: "veg", imageUrl: IMG.dessert }],
    },
    {
      id: "beverages",
      name: "Beverages",
      items: [
        { id: "filter-coffee", name: "Filter Coffee", description: "South Indian filter coffee", price: 60, diet: "veg", imageUrl: IMG.mocktail },
        { id: "fresh-lime", name: "Fresh Lime Soda", description: "Sweet or salted lime soda", price: 70, diet: "vegan", imageUrl: IMG.mocktail },
      ],
    },
  ];
}

function multiCuisineMenu(): MenuCategory[] {
  return [
    {
      id: "starters",
      name: "Starters",
      items: [{ id: "veg-soup", name: "Sweet Corn Soup", description: "Classic mild vegetable soup", price: 110, diet: "veg", imageUrl: IMG.noodles }],
    },
    {
      id: "main-course",
      name: "Main Course",
      items: [
        { id: "veg-noodles", name: "Veg Hakka Noodles", description: "Wok-tossed noodles with fresh vegetables", price: 180, diet: "veg", imageUrl: IMG.noodles },
        { id: "chicken-burger", name: "Grilled Chicken Burger", description: "Grilled chicken patty with fresh salad", price: 220, diet: "non-veg", imageUrl: IMG.burger },
        { id: "paneer-butter-masala", name: "Paneer Butter Masala", description: "Creamy tomato-based paneer curry", price: 240, diet: "veg", popular: true, imageUrl: IMG.curry },
        { id: "chicken-biryani", name: "Chicken Biryani", description: "Aromatic chicken biryani with raita", price: 260, diet: "non-veg", popular: true, imageUrl: IMG.biryaniAlt },
      ],
    },
    {
      id: "desserts",
      name: "Desserts",
      items: [{ id: "panna-cotta", name: "Fruit Panna Cotta", description: "Chilled set cream with fresh berries", price: 150, diet: "veg", imageUrl: IMG.dessert }],
    },
    {
      id: "beverages",
      name: "Beverages",
      items: [{ id: "mocktail", name: "Berry Mint Mocktail", description: "Fresh berry and mint cooler", price: 130, diet: "vegan", imageUrl: IMG.mocktail }],
    },
  ];
}

function seafoodMenu(): MenuCategory[] {
  return [
    {
      id: "starters",
      name: "Starters",
      items: [{ id: "prawn-fry", name: "Prawn Fry", description: "Pan-fried prawns with Kerala spices", price: 260, diet: "non-veg", spicy: true, imageUrl: IMG.seafood }],
    },
    {
      id: "main-course",
      name: "Main Course",
      items: [
        { id: "karimeen-pollichathu", name: "Karimeen Pollichathu", description: "Pearl spot fish grilled in banana leaf", price: 420, diet: "non-veg", popular: true, imageUrl: IMG.seafood },
        { id: "fish-curry-meals", name: "Fish Curry Meals", description: "Kerala-style fish curry with rice and sides", price: 280, diet: "non-veg", spicy: true, imageUrl: IMG.curry },
        { id: "veg-thali", name: "Veg Thali", description: "Full vegetarian meal with rice, sambar and sides", price: 170, diet: "veg", imageUrl: IMG.southThali },
      ],
    },
    {
      id: "desserts",
      name: "Desserts",
      items: [{ id: "payasam-sf", name: "Payasam", description: "Traditional Kerala sweet milk pudding", price: 90, diet: "veg", imageUrl: IMG.dessert }],
    },
    {
      id: "beverages",
      name: "Beverages",
      items: [{ id: "fresh-lime-sf", name: "Fresh Lime Soda", description: "Sweet or salted lime soda", price: 70, diet: "vegan", imageUrl: IMG.mocktail }],
    },
  ];
}

export const MOCK_RESTAURANTS: Restaurant[] = [
  {
    id: "saravana-bhavan-munnar",
    destinationId: "munnar",
    name: "Saravana Bhavan",
    cuisine: "South Indian · Vegetarian",
    dietType: "veg",
    priceTier: "₹",
    rating: 4.8,
    reviewCount: 1240,
    locationLabel: "Munnar · 1.2 km from center",
    distanceFromCenterKm: 1.2,
    amenities: ["AC", "Family Seating", "Group Seating"],
    description: "A long-running South Indian vegetarian institution, known for crisp dosas and quick service.",
    heroImage: IMG.southIndianInterior,
    galleryImages: [IMG.dosa, IMG.idliThali],
    menu: southIndianMenu(),
    popular: true,
  },
  {
    id: "hillview-restaurant-munnar",
    destinationId: "munnar",
    name: "Hillview Restaurant",
    cuisine: "Multi-Cuisine",
    dietType: "veg-and-non-veg",
    priceTier: "₹₹",
    rating: 4.5,
    reviewCount: 850,
    locationLabel: "Munnar · Scenic viewpoint",
    distanceFromCenterKm: 3.4,
    amenities: ["Scenic View", "Parking", "Group Seating"],
    description: "A multi-cuisine restaurant overlooking the tea hills, popular for large group lunches.",
    heroImage: IMG.cozyInterior,
    galleryImages: [IMG.curry, IMG.biryaniAlt],
    menu: multiCuisineMenu(),
  },
  {
    id: "copper-castle-munnar",
    destinationId: "munnar",
    name: "Copper Castle",
    cuisine: "Continental",
    dietType: "veg-and-non-veg",
    priceTier: "₹₹₹",
    rating: 4.2,
    reviewCount: 310,
    locationLabel: "Munnar · Town Road",
    distanceFromCenterKm: 2.6,
    amenities: ["AC", "Balcony Seating"],
    description: "A relaxed continental restaurant with balcony seating.",
    heroImage: IMG.cozyInterior,
    galleryImages: [IMG.burger, IMG.noodles],
    menu: multiCuisineMenu(),
  },
  {
    id: "kashi-art-cafe-kochi",
    destinationId: "kochi",
    name: "Kashi Art Cafe",
    cuisine: "Continental, Cafe",
    dietType: "veg-and-non-veg",
    priceTier: "₹₹",
    rating: 4.7,
    reviewCount: 980,
    locationLabel: "Fort Kochi · Heritage zone",
    distanceFromCenterKm: 0.6,
    amenities: ["Art Gallery", "Outdoor Seating"],
    description: "A heritage art-gallery cafe in Fort Kochi, known for its relaxed brunch menu.",
    heroImage: IMG.cozyInterior,
    galleryImages: [IMG.dessert, IMG.mocktail],
    menu: multiCuisineMenu(),
    popular: true,
  },
  {
    id: "ginger-house-kochi",
    destinationId: "kochi",
    name: "Ginger House",
    cuisine: "Kerala · Seafood",
    dietType: "veg-and-non-veg",
    priceTier: "₹₹",
    rating: 4.3,
    reviewCount: 540,
    locationLabel: "Kochi · Backwater-side",
    distanceFromCenterKm: 1.8,
    amenities: ["Scenic View", "Group Seating"],
    description: "A backwater-side restaurant inside a spice-and-antiques market, popular with visitors.",
    heroImage: IMG.fineDining,
    galleryImages: [IMG.seafood, IMG.curry],
    menu: seafoodMenu(),
  },
  {
    id: "paragon-restaurant-kochi",
    destinationId: "kochi",
    name: "Paragon Restaurant",
    cuisine: "Kerala · Seafood",
    dietType: "veg-and-non-veg",
    priceTier: "₹₹",
    rating: 4.4,
    reviewCount: 1120,
    locationLabel: "Kochi · 2.1 km from center",
    distanceFromCenterKm: 2.1,
    amenities: ["AC", "Family Seating", "Group Seating"],
    description: "A well-known Kerala seafood chain, reliable for large groups.",
    heroImage: IMG.southIndianInterior,
    galleryImages: [IMG.biryani, IMG.seafood],
    menu: seafoodMenu(),
    popular: true,
  },
  {
    id: "backwater-kitchen-alappuzha",
    destinationId: "alappuzha",
    name: "Backwater Kitchen",
    cuisine: "Kerala · Seafood",
    dietType: "veg-and-non-veg",
    priceTier: "₹₹",
    rating: 4.6,
    reviewCount: 640,
    locationLabel: "Alappuzha · Canal-side",
    distanceFromCenterKm: 1.8,
    amenities: ["AC", "Group Seating", "Scenic View"],
    description: "Canal-side dining specialising in Kerala seafood and traditional meals.",
    heroImage: IMG.fineDining,
    galleryImages: [IMG.curry, IMG.southThali],
    menu: seafoodMenu(),
  },
  {
    id: "spice-route-thekkady",
    destinationId: "thekkady",
    name: "Spice Route Kitchen",
    cuisine: "Kerala · South Indian",
    dietType: "veg-and-non-veg",
    priceTier: "₹",
    rating: 4.4,
    reviewCount: 420,
    locationLabel: "Thekkady · 0.9 km from center",
    distanceFromCenterKm: 0.9,
    amenities: ["AC", "Family Seating", "Group Seating"],
    description: "A plantation-side kitchen serving home-style Kerala meals.",
    heroImage: IMG.southIndianInterior,
    galleryImages: [IMG.biryani, IMG.idliThali],
    menu: southIndianMenu(),
  },
  {
    id: "hotel-sri-nivas-wayanad",
    destinationId: "wayanad",
    name: "Hotel Sri Nivas",
    cuisine: "South Indian · Vegetarian",
    dietType: "veg",
    priceTier: "₹",
    rating: 4.3,
    reviewCount: 380,
    locationLabel: "Wayanad · 1.5 km from center",
    distanceFromCenterKm: 1.5,
    amenities: ["Family Seating"],
    description: "A no-frills vegetarian favourite for a quick, reliable meal.",
    heroImage: IMG.southIndianInterior,
    galleryImages: [IMG.dosa],
    menu: southIndianMenu(),
  },
  {
    id: "canopy-multicuisine-wayanad",
    destinationId: "wayanad",
    name: "Canopy Multi-Cuisine",
    cuisine: "Multi-Cuisine",
    dietType: "veg-and-non-veg",
    priceTier: "₹₹",
    rating: 4.0,
    reviewCount: 190,
    locationLabel: "Wayanad · Forest edge",
    distanceFromCenterKm: 4.0,
    amenities: ["AC", "Parking", "Group Seating"],
    description: "A forest-edge restaurant with a broad menu, comfortable for mixed-preference groups.",
    heroImage: IMG.cozyInterior,
    galleryImages: [IMG.burger, IMG.biryaniAlt],
    menu: multiCuisineMenu(),
  },
  {
    id: "lighthouse-cafe-kovalam",
    destinationId: "kovalam",
    name: "Lighthouse Cafe",
    cuisine: "Continental · Seafood",
    dietType: "veg-and-non-veg",
    priceTier: "₹₹",
    rating: 4.5,
    reviewCount: 705,
    locationLabel: "Kovalam · Beachfront",
    distanceFromCenterKm: 0.4,
    amenities: ["Beachfront", "AC", "Group Seating"],
    description: "A beachfront cafe with sea views, serving continental favourites alongside local seafood.",
    heroImage: IMG.fineDining,
    galleryImages: [IMG.burger, IMG.mocktail],
    menu: multiCuisineMenu(),
    popular: true,
  },
  {
    id: "malabar-junction-kovalam",
    destinationId: "kovalam",
    name: "Malabar Junction",
    cuisine: "Kerala · South Indian",
    dietType: "veg-and-non-veg",
    priceTier: "₹",
    rating: 4.3,
    reviewCount: 460,
    locationLabel: "Kovalam · 1.1 km from center",
    distanceFromCenterKm: 1.1,
    amenities: ["AC", "Family Seating", "Group Seating"],
    description: "A dependable Kerala kitchen with a menu built for feeding groups quickly.",
    heroImage: IMG.southIndianInterior,
    galleryImages: [IMG.southThali, IMG.biryani],
    menu: southIndianMenu(),
  },
];

export function getRestaurantsForDestination(destinationId: string) {
  return MOCK_RESTAURANTS.filter((r) => r.destinationId === destinationId);
}

export function getPopularRestaurants(destinationId: string) {
  return MOCK_RESTAURANTS.filter((r) => r.destinationId === destinationId && r.popular);
}

export function getRestaurant(id: string) {
  return MOCK_RESTAURANTS.find((r) => r.id === id) ?? null;
}

export function findMenuItem(restaurant: Restaurant, itemId: string): MenuItem | undefined {
  for (const category of restaurant.menu) {
    const item = category.items.find((i) => i.id === itemId);
    if (item) return item;
  }
  return undefined;
}
