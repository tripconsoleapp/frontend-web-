export type TripStatus = "draft" | "submitted" | "verified" | "paid" | "complete";

export interface Trip {
  id: string;
  name: string;
  location: string;
  startDate: string;
  endDate: string;
  travelers: number;
  status: TripStatus;
  progress?: number;
  estimatedTotal?: number;
  invoiceAmount?: number;
  amountSettled?: number;
  imageUrl: string;
  tags: string[];
  currentStepLabel?: string;
}

export const MOCK_TRIPS: Trip[] = [
  {
    id: "western-ghats-expedition",
    name: "Western Ghats Expedition",
    location: "Coorg & Wayanad, India",
    startDate: "2023-10-12",
    endDate: "2023-10-18",
    travelers: 12,
    status: "draft",
    progress: 40,
    estimatedTotal: 124800,
    imageUrl:
      "https://images.unsplash.com/photo-1585640036119-ce2bf9c502d8?auto=format&fit=crop&w=800&q=80",
    tags: ["Adventure", "12 Travelers"],
    currentStepLabel: "Destinations & Route",
  },
  {
    id: "heritage-south-trail",
    name: "Heritage South Trail",
    location: "Madurai & Thanjavur",
    startDate: "2023-11-05",
    endDate: "2023-11-12",
    travelers: 24,
    status: "submitted",
    invoiceAmount: 482000,
    imageUrl:
      "https://images.unsplash.com/photo-1644773182204-f0bf03cae0cb?auto=format&fit=crop&w=800&q=80",
    tags: ["Heritage", "24 Travelers"],
  },
  {
    id: "munnar-nature-retreat",
    name: "Munnar Nature Retreat",
    location: "Munnar, Kerala",
    startDate: "2023-09-14",
    endDate: "2023-09-17",
    travelers: 18,
    status: "submitted",
    invoiceAmount: 265000,
    imageUrl:
      "https://images.unsplash.com/photo-1658051161493-1d311c4c7b4d?auto=format&fit=crop&w=800&q=80",
    tags: ["Nature", "18 Travelers"],
  },
  {
    id: "industrial-expo-visit",
    name: "Industrial Expo Visit",
    location: "Bengaluru Exhibition Centre",
    startDate: "2023-12-01",
    endDate: "2023-12-03",
    travelers: 45,
    status: "verified",
    invoiceAmount: 815500,
    imageUrl:
      "https://images.unsplash.com/photo-1711192702535-eac61a78ecb0?auto=format&fit=crop&w=800&q=80",
    tags: ["Corporate", "45 Travelers"],
  },
  {
    id: "kerala-pilgrimage-tour",
    name: "Kerala Pilgrimage Tour",
    location: "Guruvayur & Sabarimala",
    startDate: "2023-08-20",
    endDate: "2023-08-28",
    travelers: 30,
    status: "paid",
    amountSettled: 340000,
    imageUrl:
      "https://images.unsplash.com/photo-1644773182204-f0bf03cae0cb?auto=format&fit=crop&w=800&q=80",
    tags: ["Pilgrimage", "30 Travelers"],
  },
  {
    id: "sabarimala-special",
    name: "Sabarimala Special",
    location: "Sabarimala, Kerala",
    startDate: "2023-07-02",
    endDate: "2023-07-05",
    travelers: 40,
    status: "complete",
    amountSettled: 512000,
    imageUrl:
      "https://images.unsplash.com/photo-1644773182204-f0bf03cae0cb?auto=format&fit=crop&w=800&q=80",
    tags: ["Pilgrimage", "40 Travelers"],
  },
  {
    id: "school-excursion",
    name: "School Excursion",
    location: "Alleppey Backwaters",
    startDate: "2023-06-10",
    endDate: "2023-06-12",
    travelers: 22,
    status: "complete",
    amountSettled: 198000,
    imageUrl:
      "https://images.unsplash.com/photo-1704365159747-1f7b8913044f?auto=format&fit=crop&w=800&q=80",
    tags: ["School Group", "22 Travelers"],
  },
];

const STATUS_LABELS: Record<TripStatus, string> = {
  draft: "Draft",
  submitted: "Submitted",
  verified: "Verified",
  paid: "Paid",
  complete: "Complete",
};

const STATUS_BADGE_CLASSES: Record<TripStatus, string> = {
  draft: "bg-navy/10 text-navy",
  submitted: "bg-mint/50 text-navy",
  verified: "bg-mint text-navy",
  paid: "bg-navy text-white",
  complete: "bg-navy/10 text-navy",
};

const STATUS_ACTIONS: Record<TripStatus, string> = {
  draft: "Continue",
  submitted: "Track",
  verified: "Pay Now",
  paid: "Receipt",
  complete: "Receipt",
};

export function getStatusLabel(status: TripStatus) {
  return STATUS_LABELS[status];
}

export function getStatusBadgeClass(status: TripStatus) {
  return STATUS_BADGE_CLASSES[status];
}

export function getStatusAction(status: TripStatus) {
  return STATUS_ACTIONS[status];
}

export function getTripActionHref(trip: Trip) {
  switch (trip.status) {
    case "draft":
      return `/trips/${trip.id}/edit`;
    case "submitted":
      return `/trips/${trip.id}/track`;
    case "verified":
      return `/trips/${trip.id}/pay`;
    default:
      return `/trips/${trip.id}/receipt`;
  }
}

export function formatDateRange(start: string, end: string) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const startLabel = startDate.toLocaleDateString("en-IN", {
    month: "short",
    day: "2-digit",
  });
  const endLabel = endDate.toLocaleDateString("en-IN", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
  return `${startLabel} - ${endLabel}`;
}

export function formatCurrency(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function getTripCounts(trips: Trip[]) {
  return {
    active: trips.filter((t) => t.status === "submitted" || t.status === "verified")
      .length,
    completed: trips.filter((t) => t.status === "paid" || t.status === "complete")
      .length,
    draft: trips.filter((t) => t.status === "draft").length,
  };
}
