import { KeralaLocation } from "./kerala-locations";

/** A curated shrine/temple the organizer can add to the route with one
 *  tap, on top of the general Kerala location search. Shaped as a
 *  `KeralaLocation` (x/y for the stylized map, lat/lng for the real one)
 *  so it plugs into the exact same route-building state and map
 *  components as any other destination — nothing about the route/map
 *  layer needs to know these are "pilgrimage" locations. */
export interface PilgrimageDestination extends KeralaLocation {
  description: string;
  imageUrl: string;
  category: string;
}

export const PILGRIMAGE_DESTINATIONS: PilgrimageDestination[] = [
  {
    id: "sabarimala",
    name: "Sabarimala Ayyappa Temple",
    district: "Pathanamthitta, Kerala",
    x: 245,
    y: 430,
    lat: 9.4326,
    lng: 77.0838,
    category: "Temple",
    description: "Sree Dharma Sastha temple, reached via the trek from Pamba.",
    imageUrl:
      "https://images.unsplash.com/photo-1644773182204-f0bf03cae0cb?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "guruvayur",
    name: "Guruvayur Krishna Temple",
    district: "Thrissur, Kerala",
    x: 195,
    y: 130,
    lat: 10.5941,
    lng: 76.041,
    category: "Temple",
    description: "One of Kerala's most visited Krishna temples.",
    imageUrl:
      "https://images.unsplash.com/photo-1644773182204-f0bf03cae0cb?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "erumeli",
    name: "Vavar Palli, Erumeli",
    district: "Kottayam, Kerala",
    x: 225,
    y: 400,
    lat: 9.5628,
    lng: 76.9375,
    category: "Mosque & Temple",
    description: "Traditional starting point for the Sabarimala pilgrimage.",
    imageUrl:
      "https://images.unsplash.com/photo-1644773182204-f0bf03cae0cb?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "chottanikkara",
    name: "Chottanikkara Devi Temple",
    district: "Ernakulam, Kerala",
    x: 160,
    y: 235,
    lat: 9.9509,
    lng: 76.3538,
    category: "Temple",
    description: "Devi temple known for its daily rituals and healing tradition.",
    imageUrl:
      "https://images.unsplash.com/photo-1644773182204-f0bf03cae0cb?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "ambalapuzha",
    name: "Ambalapuzha Sri Krishna Temple",
    district: "Alappuzha, Kerala",
    x: 142,
    y: 335,
    lat: 9.386,
    lng: 76.3452,
    category: "Temple",
    description: "Historic temple famed for its Palpayasam offering.",
    imageUrl:
      "https://images.unsplash.com/photo-1644773182204-f0bf03cae0cb?auto=format&fit=crop&w=800&q=80",
  },
];

export function getPilgrimageDestination(id: string) {
  return PILGRIMAGE_DESTINATIONS.find((d) => d.id === id);
}
