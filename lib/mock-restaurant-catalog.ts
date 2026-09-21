/**
 * Mock restaurant + menu catalog for the day-wise Meal Planning flow.
 * Structured so the shape (restaurant → menu categories → items) maps
 * directly onto a future real inventory API — swap the arrays below for a
 * fetch and the flow's pricing/capacity math keeps working unchanged.
 *
 * Restaurants are tagged by `destinationId`, matching the ids in
 * `lib/kerala-locations.ts` — the same destinations the organizer actually
 * built their route from in the Destinations step.
 */

export type MealType = "breakfast" | "lunch" | "dinner";
export type DietType = "veg" | "non-veg" | "vegan" | "jain";
export type PriceTier = "₹" | "₹₹" | "₹₹₹";

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  diet: DietType;
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
  dietType: "veg" | "veg-and-non-veg";
  priceTier: PriceTier;
  rating: number;
  reviewCount: number;
  capacity: number;
  locationLabel: string;
  distanceFromCenterKm: number;
  amenities: string[];
  mealTypes: MealType[];
  description: string;
  heroImage: string;
  galleryImages: string[];
  menu: MenuCategory[];
}

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
};

function southIndianMenu(): MenuCategory[] {
  return [
    {
      id: "starters",
      name: "Starters",
      items: [
        { id: "vada", name: "Medu Vada (2 pcs)", description: "Crispy lentil fritters with sambar and chutney", price: 80, diet: "veg", imageUrl: IMG.idliThali },
      ],
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
      items: [
        { id: "payasam", name: "Payasam", description: "Traditional Kerala sweet milk pudding", price: 90, diet: "veg", imageUrl: IMG.dessert },
      ],
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
      items: [
        { id: "veg-soup", name: "Sweet Corn Soup", description: "Classic mild vegetable soup", price: 110, diet: "veg", imageUrl: IMG.noodles },
      ],
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
      items: [
        { id: "panna-cotta", name: "Fruit Panna Cotta", description: "Chilled set cream with fresh berries", price: 150, diet: "veg", imageUrl: IMG.dessert },
      ],
    },
    {
      id: "beverages",
      name: "Beverages",
      items: [
        { id: "mocktail", name: "Berry Mint Mocktail", description: "Fresh berry and mint cooler", price: 130, diet: "vegan", imageUrl: IMG.mocktail },
      ],
    },
  ];
}

export const RESTAURANTS: Restaurant[] = [
  // ---------- Munnar ----------
  {
    id: "saravana-bhavan-munnar",
    destinationId: "munnar",
    name: "Saravana Bhavan",
    cuisine: "South Indian · Vegetarian",
    dietType: "veg",
    priceTier: "₹",
    rating: 4.8,
    reviewCount: 1240,
    capacity: 60,
    locationLabel: "Munnar · 1.2 km from center",
    distanceFromCenterKm: 1.2,
    amenities: ["AC", "Family Seating", "Group Seating"],
    mealTypes: ["breakfast", "lunch", "dinner"],
    description: "A long-running South Indian vegetarian institution, known for crisp dosas and quick group service.",
    heroImage: IMG.southIndianInterior,
    galleryImages: [IMG.dosa, IMG.idliThali],
    menu: southIndianMenu(),
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
    capacity: 70,
    locationLabel: "Munnar · Scenic viewpoint",
    distanceFromCenterKm: 3.4,
    amenities: ["Scenic View", "Parking", "Group Seating"],
    mealTypes: ["lunch", "dinner"],
    description: "A multi-cuisine restaurant overlooking the tea hills, popular for large group lunches.",
    heroImage: IMG.cozyInterior,
    galleryImages: [IMG.curry, IMG.biryaniAlt],
    menu: multiCuisineMenu(),
  },

  // ---------- Alleppey ----------
  {
    id: "backwater-kitchen-alleppey",
    destinationId: "alleppey",
    name: "Backwater Kitchen",
    cuisine: "Kerala · Seafood",
    dietType: "veg-and-non-veg",
    priceTier: "₹₹",
    rating: 4.6,
    reviewCount: 640,
    capacity: 55,
    locationLabel: "Alleppey · Canal-side",
    distanceFromCenterKm: 1.8,
    amenities: ["AC", "Group Seating", "Scenic View"],
    mealTypes: ["breakfast", "lunch", "dinner"],
    description: "Canal-side dining specialising in Kerala seafood and traditional sadya-style meals.",
    heroImage: IMG.fineDining,
    galleryImages: [IMG.curry, IMG.southThali],
    menu: southIndianMenu(),
  },
  {
    id: "copper-castle-alleppey",
    destinationId: "alleppey",
    name: "Copper Castle",
    cuisine: "Continental",
    dietType: "veg-and-non-veg",
    priceTier: "₹₹₹",
    rating: 4.2,
    reviewCount: 310,
    capacity: 35,
    locationLabel: "Alleppey · Beach Road",
    distanceFromCenterKm: 2.6,
    amenities: ["AC", "Balcony Seating"],
    mealTypes: ["lunch", "dinner"],
    description: "A relaxed continental restaurant with balcony seating, better suited to smaller groups.",
    heroImage: IMG.cozyInterior,
    galleryImages: [IMG.burger, IMG.noodles],
    menu: multiCuisineMenu(),
  },

  // ---------- Thekkady ----------
  {
    id: "spice-route-thekkady",
    destinationId: "thekkady",
    name: "Spice Route Kitchen",
    cuisine: "Kerala · South Indian",
    dietType: "veg-and-non-veg",
    priceTier: "₹",
    rating: 4.4,
    reviewCount: 420,
    capacity: 65,
    locationLabel: "Thekkady · 0.9 km from center",
    distanceFromCenterKm: 0.9,
    amenities: ["AC", "Family Seating", "Group Seating"],
    mealTypes: ["breakfast", "lunch", "dinner"],
    description: "A plantation-side kitchen serving home-style Kerala meals, well set up for large groups.",
    heroImage: IMG.southIndianInterior,
    galleryImages: [IMG.biryani, IMG.idliThali],
    menu: southIndianMenu(),
  },
  {
    id: "rochas-restaurant-thekkady",
    destinationId: "thekkady",
    name: "Rochas Restaurant",
    cuisine: "Multi-Cuisine",
    dietType: "veg-and-non-veg",
    priceTier: "₹₹",
    rating: 4.1,
    reviewCount: 265,
    capacity: 50,
    locationLabel: "Thekkady · Near reserve gate",
    distanceFromCenterKm: 2.1,
    amenities: ["AC", "Parking"],
    mealTypes: ["lunch", "dinner"],
    description: "A dependable multi-cuisine stop near the reserve entrance, popular with tour groups.",
    heroImage: IMG.cozyInterior,
    galleryImages: [IMG.noodles, IMG.curry],
    menu: multiCuisineMenu(),
  },

  // ---------- Wayanad ----------
  {
    id: "hotel-sri-nivas-wayanad",
    destinationId: "wayanad",
    name: "Hotel Sri Nivas",
    cuisine: "South Indian · Vegetarian",
    dietType: "veg",
    priceTier: "₹",
    rating: 4.3,
    reviewCount: 380,
    capacity: 40,
    locationLabel: "Wayanad · 1.5 km from center",
    distanceFromCenterKm: 1.5,
    amenities: ["Family Seating"],
    mealTypes: ["breakfast", "lunch"],
    description: "A no-frills vegetarian favourite for a quick, reliable breakfast before a day of sightseeing.",
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
    capacity: 45,
    locationLabel: "Wayanad · Forest edge",
    distanceFromCenterKm: 4.0,
    amenities: ["AC", "Parking", "Group Seating"],
    mealTypes: ["lunch", "dinner"],
    description: "A forest-edge restaurant with a broad menu, comfortable for mixed-preference groups.",
    heroImage: IMG.cozyInterior,
    galleryImages: [IMG.burger, IMG.biryaniAlt],
    menu: multiCuisineMenu(),
  },

  // ---------- Kovalam ----------
  {
    id: "lighthouse-cafe-kovalam",
    destinationId: "kovalam",
    name: "Lighthouse Cafe",
    cuisine: "Continental · Seafood",
    dietType: "veg-and-non-veg",
    priceTier: "₹₹",
    rating: 4.5,
    reviewCount: 705,
    capacity: 50,
    locationLabel: "Kovalam · Beachfront",
    distanceFromCenterKm: 0.4,
    amenities: ["Beachfront", "AC", "Group Seating"],
    mealTypes: ["breakfast", "lunch", "dinner"],
    description: "A beachfront cafe with sea views, serving continental favourites alongside local seafood.",
    heroImage: IMG.fineDining,
    galleryImages: [IMG.burger, IMG.mocktail],
    menu: multiCuisineMenu(),
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
    capacity: 60,
    locationLabel: "Kovalam · 1.1 km from center",
    distanceFromCenterKm: 1.1,
    amenities: ["AC", "Family Seating", "Group Seating"],
    mealTypes: ["breakfast", "lunch", "dinner"],
    description: "A dependable Kerala kitchen with a menu built for feeding large travel groups quickly.",
    heroImage: IMG.southIndianInterior,
    galleryImages: [IMG.southThali, IMG.biryani],
    menu: southIndianMenu(),
  },
];

export function getRestaurantsForDestination(destinationId: string, mealType?: MealType) {
  return RESTAURANTS.filter(
    (r) => r.destinationId === destinationId && (!mealType || r.mealTypes.includes(mealType))
  );
}

export function getRestaurant(id: string) {
  return RESTAURANTS.find((r) => r.id === id);
}

export function findMenuItem(restaurant: Restaurant, itemId: string) {
  for (const category of restaurant.menu) {
    const item = category.items.find((i) => i.id === itemId);
    if (item) return item;
  }
  return undefined;
}
