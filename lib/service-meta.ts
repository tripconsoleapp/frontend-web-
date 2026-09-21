export type ServiceId = "vehicle" | "hotel" | "restaurant" | "activities";

export interface ServiceMeta {
  id: ServiceId;
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
}

export const SERVICE_META: ServiceMeta[] = [
  {
    id: "vehicle",
    title: "Vehicle",
    description: "Transport for the full group, door to door.",
    imageUrl:
      "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Vehicle for group travel",
  },
  {
    id: "hotel",
    title: "Hotel",
    description: "Stay arrangements at each overnight stop.",
    imageUrl:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Hotel accommodation",
  },
  {
    id: "restaurant",
    title: "Restaurant",
    description: "Meals booked in advance along the route.",
    imageUrl:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Restaurant dining",
  },
  {
    id: "activities",
    title: "Activities",
    description: "Guided experiences at your destinations.",
    imageUrl:
      "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Guided travel activity",
  },
];

export function getServiceMeta(id: ServiceId) {
  return SERVICE_META.find((s) => s.id === id)!;
}
