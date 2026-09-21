/**
 * Mock transport catalog for the Vehicle selection flow.
 * Structured so the shape (type → listings, numeric capacity, price) maps
 * directly onto a future real fleet/inventory API — swap the arrays below
 * for a fetch and the flow's capacity math keeps working unchanged.
 */

export type VehicleSource = "private" | "ksrtc";

export interface VehicleType {
  id: string;
  name: string;
  capacityRange: string;
  idealFor: string;
  fromPrice: number;
  imageUrl: string;
  imageAlt: string;
}

export const VEHICLE_TYPES: VehicleType[] = [
  {
    id: "ac-sleeper-bus",
    name: "AC Sleeper Bus",
    capacityRange: "40–52 seats",
    idealFor: "Best for long-distance, large groups",
    fromPrice: 25000,
    imageUrl:
      "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=900&q=80",
    imageAlt: "AC sleeper coach on a highway",
  },
  {
    id: "non-ac-sleeper-bus",
    name: "Non-AC Sleeper Bus",
    capacityRange: "40–50 seats",
    idealFor: "Budget-friendly for large groups",
    fromPrice: 18000,
    imageUrl:
      "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Non-AC sleeper bus",
  },
  {
    id: "mini-bus",
    name: "Mini Bus",
    capacityRange: "20–35 seats",
    idealFor: "Ideal for medium-sized groups",
    fromPrice: 15000,
    imageUrl:
      "https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Mini bus for group travel",
  },
  {
    id: "tempo-traveller",
    name: "Tempo Traveller",
    capacityRange: "12–17 seats",
    idealFor: "Ideal for small to mid-size groups",
    fromPrice: 8500,
    imageUrl:
      "https://images.unsplash.com/photo-1626668893632-6f3a4466d22f?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Tempo traveller van",
  },
  {
    id: "car",
    name: "Car",
    capacityRange: "4–7 seats",
    idealFor: "Best for individuals or small families",
    fromPrice: 2800,
    imageUrl:
      "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Car for small groups",
  },
];

export interface VehicleListing {
  id: string;
  typeId: string;
  operator: string;
  rating: number;
  trips: number;
  capacity: number;
  ac: boolean;
  price: number;
  source: VehicleSource;
  imageUrl: string;
}

export const VEHICLE_LISTINGS: VehicleListing[] = [
  // AC Sleeper Bus
  {
    id: "kt-ac-sleeper-52",
    typeId: "ac-sleeper-bus",
    operator: "Kerala Travels Pvt Ltd",
    rating: 4.8,
    trips: 127,
    capacity: 52,
    ac: true,
    price: 45000,
    source: "private",
    imageUrl:
      "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=700&q=80",
  },
  {
    id: "ev-ac-sleeper-45",
    typeId: "ac-sleeper-bus",
    operator: "Everest Travel Solutions",
    rating: 4.4,
    trips: 64,
    capacity: 45,
    ac: true,
    price: 38000,
    source: "private",
    imageUrl:
      "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=700&q=80",
  },
  // Non-AC Sleeper Bus
  {
    id: "gm-nonac-sleeper-50",
    typeId: "non-ac-sleeper-bus",
    operator: "Green Meadows Transport",
    rating: 4.1,
    trips: 38,
    capacity: 50,
    ac: false,
    price: 26400,
    source: "private",
    imageUrl:
      "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=700&q=80",
  },
  {
    id: "ksrtc-nonac-sleeper-50",
    typeId: "non-ac-sleeper-bus",
    operator: "KSRTC",
    rating: 4.0,
    trips: 512,
    capacity: 50,
    ac: false,
    price: 21000,
    source: "ksrtc",
    imageUrl:
      "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=700&q=80",
  },
  // Mini Bus
  {
    id: "hk-minibus-35",
    typeId: "mini-bus",
    operator: "Highway Kings Travels",
    rating: 4.6,
    trips: 98,
    capacity: 35,
    ac: true,
    price: 32000,
    source: "private",
    imageUrl:
      "https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=700&q=80",
  },
  {
    id: "sc-minibus-24",
    typeId: "mini-bus",
    operator: "Southern Cross Coaches",
    rating: 4.4,
    trips: 56,
    capacity: 24,
    ac: false,
    price: 18000,
    source: "private",
    imageUrl:
      "https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=700&q=80",
  },
  {
    id: "gm-minibus-20",
    typeId: "mini-bus",
    operator: "Green Meadows Transport",
    rating: 4.1,
    trips: 38,
    capacity: 20,
    ac: false,
    price: 15000,
    source: "private",
    imageUrl:
      "https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=700&q=80",
  },
  // Tempo Traveller
  {
    id: "cl-tempo-17",
    typeId: "tempo-traveller",
    operator: "City Linkers",
    rating: 4.3,
    trips: 71,
    capacity: 17,
    ac: true,
    price: 19230,
    source: "private",
    imageUrl:
      "https://images.unsplash.com/photo-1626668893632-6f3a4466d22f?auto=format&fit=crop&w=700&q=80",
  },
  {
    id: "uc-tempo-13",
    typeId: "tempo-traveller",
    operator: "Urban Cruises",
    rating: 4.2,
    trips: 44,
    capacity: 13,
    ac: true,
    price: 14200,
    source: "private",
    imageUrl:
      "https://images.unsplash.com/photo-1626668893632-6f3a4466d22f?auto=format&fit=crop&w=700&q=80",
  },
  // Car
  {
    id: "kt-car-4",
    typeId: "car",
    operator: "Kerala Travels Pvt Ltd",
    rating: 4.6,
    trips: 127,
    capacity: 4,
    ac: true,
    price: 3500,
    source: "private",
    imageUrl:
      "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=700&q=80",
  },
  {
    id: "cc-car-4",
    typeId: "car",
    operator: "City Cab Services",
    rating: 4.5,
    trips: 95,
    capacity: 4,
    ac: true,
    price: 2800,
    source: "private",
    imageUrl:
      "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=700&q=80",
  },
];

export function getVehicleType(id: string) {
  return VEHICLE_TYPES.find((t) => t.id === id);
}

export function getVehicleListing(id: string) {
  return VEHICLE_LISTINGS.find((v) => v.id === id);
}
