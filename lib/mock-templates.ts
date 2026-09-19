export type DestinationType =
  | "nature"
  | "heritage"
  | "adventure"
  | "backwaters"
  | "historical";

export type GroupType =
  | "school"
  | "college"
  | "family"
  | "corporate"
  | "pilgrimage"
  | "individual";

export interface ItineraryActivity {
  time: string;
  title: string;
}

export interface ItineraryDay {
  day: number;
  title: string;
  activities: ItineraryActivity[];
}

export interface Template {
  id: string;
  name: string;
  location: string;
  rating: number;
  reviews: number;
  destinationTypes: DestinationType[];
  groupTypes: GroupType[];
  durationDays: number;
  durationLabel: string;
  pricePerPerson: number;
  groupServiceFee: number;
  suggestedParticipants: number;
  about: string;
  highlights: string[];
  includedServices: string[];
  itinerary: ItineraryDay[];
}

export const DESTINATION_TYPE_LABELS: Record<DestinationType, string> = {
  nature: "Nature",
  heritage: "Heritage",
  adventure: "Adventure",
  backwaters: "Backwaters",
  historical: "Historical",
};

export const GROUP_TYPE_LABELS: Record<GroupType, string> = {
  school: "School",
  college: "College",
  family: "Family",
  corporate: "Corporate",
  pilgrimage: "Pilgrimage",
  individual: "Individual",
};

export const MOCK_TEMPLATES: Template[] = [
  {
    id: "school-excursion",
    name: "Western Ghats Expedition",
    location: "Munnar, Kerala",
    rating: 4.7,
    reviews: 184,
    destinationTypes: ["nature", "adventure"],
    groupTypes: ["school", "college"],
    durationDays: 3,
    durationLabel: "3 Days",
    pricePerPerson: 2500,
    groupServiceFee: 1500,
    suggestedParticipants: 30,
    about:
      "An immersive 3-day educational and adventurous journey through the lush landscapes of Munnar, designed specifically for faster learners and nature appreciation among students.",
    highlights: [
      "Guided nature trail with certified naturalists",
      "Hands-on wildlife spotting and journaling session",
      "Bonfire and team-building activities",
      "Safety-supervised trekking routes",
    ],
    includedServices: ["Transport", "Meals", "Stay", "First Aid", "Guide"],
    itinerary: [
      {
        day: 1,
        title: "Departure & Arrival",
        activities: [
          { time: "08:00 AM", title: "Departure from School" },
          { time: "11:00 AM", title: "Breakfast at Highway Stop" },
          { time: "02:00 PM", title: "Arrival & Nature Walk" },
          { time: "06:00 PM", title: "Lunch at Base Camp" },
          { time: "08:00 PM", title: "Group Activity & Team Building" },
        ],
      },
      {
        day: 2,
        title: "Exploration Day",
        activities: [
          { time: "06:00 AM", title: "Sunrise Trek" },
          { time: "08:00 AM", title: "Breakfast at Camp" },
          { time: "10:00 AM", title: "Guided Nature Trail" },
          { time: "01:00 PM", title: "Lunch at Viewpoint" },
          { time: "04:00 PM", title: "Wildlife Spotting Session" },
          { time: "07:00 PM", title: "Bonfire & Reflection" },
        ],
      },
      {
        day: 3,
        title: "Departure Day",
        activities: [
          { time: "07:00 AM", title: "Morning Yoga & Wrap-up" },
          { time: "08:30 AM", title: "Breakfast" },
          { time: "10:00 AM", title: "Check-out & Souvenir Shopping" },
          { time: "01:00 PM", title: "Lunch" },
          { time: "02:00 PM", title: "Return Journey Begins" },
          { time: "07:00 PM", title: "Arrival at School" },
        ],
      },
    ],
  },
  {
    id: "sabarimala-pilgrimage",
    name: "Sabarimala 2 Day Package",
    location: "Pathanamthitta, Kerala",
    rating: 4.8,
    reviews: 226,
    destinationTypes: ["heritage", "historical"],
    groupTypes: ["pilgrimage", "family"],
    durationDays: 2,
    durationLabel: "2 Days",
    pricePerPerson: 1800,
    groupServiceFee: 250,
    suggestedParticipants: 4,
    about:
      "Embark on a sacred journey to the Sabarimala Sri Dharma Sastha Temple, one of the most revered pilgrimage destinations. This meticulously planned 2-day pilgrimage ensures comfort, safety, and spiritual fulfillment, with guided support along every step of the trek and stay arrangements to suit all pilgrims.",
    highlights: [
      "Guided assistance throughout the trek from Pamba",
      "Arrangements for comfortable overnight stay",
      "Assistance with baggage and offerings",
      "Priority queue coordination on request",
    ],
    includedServices: ["Transport", "Meals", "Stay", "Support", "First Aid"],
    itinerary: [
      {
        day: 1,
        title: "Departure & Base Camp",
        activities: [
          { time: "06:00 AM", title: "Departure towards Pamba" },
          { time: "12:00 PM", title: "Arrival at Pamba & Holy Bath" },
          { time: "03:00 PM", title: "Trek Begins towards Sannidhanam" },
          { time: "06:00 PM", title: "Evening Darshan Queue" },
          { time: "09:00 PM", title: "Overnight Stay Arranged" },
        ],
      },
      {
        day: 2,
        title: "Darshan & Return",
        activities: [
          { time: "03:00 AM", title: "Early Trek to Sannidhanam" },
          { time: "06:00 AM", title: "Main Deity Darshan" },
          { time: "12:00 PM", title: "Lunch & Rest" },
          { time: "04:00 PM", title: "Return Journey Begins" },
        ],
      },
    ],
  },
  {
    id: "sabarimala-heritage",
    name: "Sabarimala Heritage",
    location: "Pathanamthitta, Kerala",
    rating: 4.6,
    reviews: 142,
    destinationTypes: ["heritage"],
    groupTypes: ["pilgrimage"],
    durationDays: 2,
    durationLabel: "2 Days",
    pricePerPerson: 1600,
    groupServiceFee: 200,
    suggestedParticipants: 6,
    about:
      "A guided pilgrimage route with verified stops along the way to Sabarimala, built for groups seeking a well-organized and supported spiritual journey.",
    highlights: [
      "Verified rest stops along the route",
      "Local coordinator support at every stage",
      "Pre-arranged Darshan queue guidance",
      "Emergency medical support on call",
    ],
    includedServices: ["Transport", "Meals", "Support", "First Aid"],
    itinerary: [
      {
        day: 1,
        title: "Journey to Pamba",
        activities: [
          { time: "05:30 AM", title: "Departure from Pickup Point" },
          { time: "11:30 AM", title: "Arrival at Pamba" },
          { time: "01:00 PM", title: "Lunch & Rest" },
          { time: "04:00 PM", title: "Trek Orientation" },
          { time: "08:00 PM", title: "Overnight Stay" },
        ],
      },
      {
        day: 2,
        title: "Darshan & Departure",
        activities: [
          { time: "04:00 AM", title: "Trek to Sannidhanam" },
          { time: "07:00 AM", title: "Temple Darshan" },
          { time: "11:00 AM", title: "Breakfast & Rest" },
          { time: "02:00 PM", title: "Return Journey" },
        ],
      },
    ],
  },
  {
    id: "guruvayur-district",
    name: "Guruvayur District",
    location: "Thrissur, Kerala",
    rating: 4.5,
    reviews: 98,
    destinationTypes: ["heritage", "historical"],
    groupTypes: ["pilgrimage", "family"],
    durationDays: 2,
    durationLabel: "2 Days",
    pricePerPerson: 1400,
    groupServiceFee: 200,
    suggestedParticipants: 8,
    about:
      "Optimized schedule for visits to Guruvayur Temple and nearby attractions, balancing devotion with comfortable travel for families and groups alike.",
    highlights: [
      "Optimized darshan timing to avoid peak crowds",
      "Visits to nearby heritage attractions included",
      "Comfortable accommodation near the temple",
      "Local guide familiar with temple customs",
    ],
    includedServices: ["Transport", "Meals", "Stay", "Guide"],
    itinerary: [
      {
        day: 1,
        title: "Arrival & Darshan",
        activities: [
          { time: "07:00 AM", title: "Departure from Pickup Point" },
          { time: "11:00 AM", title: "Arrival & Check-in" },
          { time: "01:00 PM", title: "Lunch" },
          { time: "04:00 PM", title: "Evening Darshan" },
          { time: "07:00 PM", title: "Temple Elephant Sanctuary Visit" },
        ],
      },
      {
        day: 2,
        title: "Heritage & Return",
        activities: [
          { time: "06:00 AM", title: "Morning Darshan" },
          { time: "09:00 AM", title: "Breakfast" },
          { time: "10:30 AM", title: "Nearby Heritage Site Visit" },
          { time: "01:00 PM", title: "Lunch" },
          { time: "02:00 PM", title: "Return Journey" },
        ],
      },
    ],
  },
  {
    id: "munnar-nature",
    name: "Munnar Nature Trail",
    location: "Munnar, Kerala",
    rating: 4.6,
    reviews: 156,
    destinationTypes: ["nature"],
    groupTypes: ["family", "individual"],
    durationDays: 2,
    durationLabel: "2 Days",
    pricePerPerson: 2800,
    groupServiceFee: 500,
    suggestedParticipants: 4,
    about:
      "Scenic tea-country route for group getaways, covering Munnar's rolling hills, tea plantations, and viewpoints at a relaxed pace.",
    highlights: [
      "Guided walk through working tea plantations",
      "Sunset viewpoint stop",
      "Comfortable resort-style stay",
      "Flexible, relaxed daily pace",
    ],
    includedServices: ["Transport", "Stay", "Guide", "Water"],
    itinerary: [
      {
        day: 1,
        title: "Tea Country Arrival",
        activities: [
          { time: "09:00 AM", title: "Departure from Pickup Point" },
          { time: "01:00 PM", title: "Arrival & Check-in" },
          { time: "03:00 PM", title: "Tea Plantation Walk" },
          { time: "06:30 PM", title: "Sunset Viewpoint" },
        ],
      },
      {
        day: 2,
        title: "Leisure & Departure",
        activities: [
          { time: "07:00 AM", title: "Morning Nature Walk" },
          { time: "09:00 AM", title: "Breakfast" },
          { time: "11:00 AM", title: "Local Market Visit" },
          { time: "02:00 PM", title: "Return Journey" },
        ],
      },
    ],
  },
  {
    id: "wayanad-wildlife-trail",
    name: "Wayanad Wildlife Trail",
    location: "Wayanad, Kerala",
    rating: 4.5,
    reviews: 121,
    destinationTypes: ["nature", "adventure"],
    groupTypes: ["individual", "college"],
    durationDays: 4,
    durationLabel: "4 Days",
    pricePerPerson: 950,
    groupServiceFee: 0,
    suggestedParticipants: 10,
    about:
      "A four-day trail through Wayanad's forests and wildlife sanctuaries, built for small groups who want an active, close-to-nature experience.",
    highlights: [
      "Guided jungle safari",
      "Waterfall trekking route",
      "Local tribal heritage walk",
      "Small-group, low-impact travel",
    ],
    includedServices: ["Transport", "Guide", "First Aid"],
    itinerary: [
      {
        day: 1,
        title: "Arrival",
        activities: [
          { time: "08:00 AM", title: "Departure from Pickup Point" },
          { time: "01:00 PM", title: "Arrival & Check-in" },
          { time: "04:00 PM", title: "Local Orientation Walk" },
        ],
      },
      {
        day: 2,
        title: "Safari Day",
        activities: [
          { time: "05:30 AM", title: "Jungle Safari" },
          { time: "09:00 AM", title: "Breakfast" },
          { time: "02:00 PM", title: "Waterfall Trek" },
        ],
      },
      {
        day: 3,
        title: "Culture Day",
        activities: [
          { time: "08:00 AM", title: "Tribal Heritage Walk" },
          { time: "01:00 PM", title: "Lunch at Local Homestay" },
          { time: "05:00 PM", title: "Craft Workshop" },
        ],
      },
      {
        day: 4,
        title: "Departure",
        activities: [
          { time: "08:00 AM", title: "Breakfast & Check-out" },
          { time: "10:00 AM", title: "Return Journey" },
        ],
      },
    ],
  },
  {
    id: "alleppey-backwaters",
    name: "Alleppey Backwaters",
    location: "Alappuzha, Kerala",
    rating: 4.7,
    reviews: 203,
    destinationTypes: ["backwaters"],
    groupTypes: ["family", "individual"],
    durationDays: 2,
    durationLabel: "2 Days",
    pricePerPerson: 1200,
    groupServiceFee: 0,
    suggestedParticipants: 4,
    about:
      "A relaxed backwater escape aboard a traditional houseboat, drifting through Alleppey's canals and paddy fields.",
    highlights: [
      "Overnight stay aboard a traditional houseboat",
      "Home-style Kerala meals on board",
      "Village canal canoe ride",
      "Sunset over the backwaters",
    ],
    includedServices: ["Transport", "Meals", "Stay"],
    itinerary: [
      {
        day: 1,
        title: "Houseboat Check-in",
        activities: [
          { time: "10:00 AM", title: "Departure from Pickup Point" },
          { time: "12:00 PM", title: "Houseboat Check-in" },
          { time: "01:00 PM", title: "Lunch Onboard" },
          { time: "04:00 PM", title: "Village Canal Canoe Ride" },
          { time: "06:30 PM", title: "Sunset on the Backwaters" },
        ],
      },
      {
        day: 2,
        title: "Morning Cruise & Return",
        activities: [
          { time: "07:00 AM", title: "Morning Cruise" },
          { time: "09:00 AM", title: "Breakfast Onboard" },
          { time: "11:00 AM", title: "Check-out" },
          { time: "12:00 PM", title: "Return Journey" },
        ],
      },
    ],
  },
  {
    id: "coorg-adventure",
    name: "Coorg Adventure",
    location: "Coorg, Karnataka",
    rating: 4.4,
    reviews: 87,
    destinationTypes: ["adventure", "nature"],
    groupTypes: ["college", "corporate"],
    durationDays: 3,
    durationLabel: "3 Days",
    pricePerPerson: 2100,
    groupServiceFee: 800,
    suggestedParticipants: 15,
    about:
      "Riverside camping, trekking to Tadiandamol, and coffee plantation tours make up this active, team-focused Coorg itinerary.",
    highlights: [
      "Riverside camping under the stars",
      "Guided trek to Tadiandamol peak",
      "Coffee plantation tour and tasting",
      "Team outbound activities",
    ],
    includedServices: ["Transport", "Meals", "Stay", "Guide"],
    itinerary: [
      {
        day: 1,
        title: "Arrival & Camp Setup",
        activities: [
          { time: "08:00 AM", title: "Departure from Pickup Point" },
          { time: "02:00 PM", title: "Arrival & Riverside Camp Setup" },
          { time: "06:00 PM", title: "Team Outbound Activities" },
        ],
      },
      {
        day: 2,
        title: "Trek Day",
        activities: [
          { time: "05:00 AM", title: "Trek to Tadiandamol" },
          { time: "01:00 PM", title: "Lunch at Base" },
          { time: "04:00 PM", title: "Coffee Plantation Tour" },
        ],
      },
      {
        day: 3,
        title: "Departure",
        activities: [
          { time: "08:00 AM", title: "Breakfast & Camp Wrap-up" },
          { time: "10:00 AM", title: "Return Journey" },
        ],
      },
    ],
  },
];

export function getTemplateById(id: string) {
  return MOCK_TEMPLATES.find((template) => template.id === id);
}
