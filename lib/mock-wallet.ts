export type TransactionStatus = "paid" | "pending" | "refunded";

export interface Transaction {
  id: string;
  tripId: string;
  tripName: string;
  date: string;
  amount: number;
  status: TransactionStatus;
}

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: "txn-kerala-pilgrimage",
    tripId: "kerala-pilgrimage-tour",
    tripName: "Kerala Pilgrimage Tour",
    date: "2023-08-18",
    amount: 340000,
    status: "paid",
  },
  {
    id: "txn-sabarimala-special",
    tripId: "sabarimala-special",
    tripName: "Sabarimala Special",
    date: "2023-06-28",
    amount: 512000,
    status: "paid",
  },
  {
    id: "txn-school-excursion",
    tripId: "school-excursion",
    tripName: "School Excursion",
    date: "2023-06-05",
    amount: 198000,
    status: "paid",
  },
  {
    id: "txn-industrial-expo",
    tripId: "industrial-expo-visit",
    tripName: "Industrial Expo Visit",
    date: "2023-11-28",
    amount: 815500,
    status: "pending",
  },
  {
    id: "txn-heritage-south",
    tripId: "heritage-south-trail",
    tripName: "Heritage South Trail",
    date: "2023-10-30",
    amount: 482000,
    status: "pending",
  },
  {
    id: "txn-munnar-refund",
    tripId: "munnar-nature-retreat",
    tripName: "Munnar Nature Retreat",
    date: "2023-09-10",
    amount: 15000,
    status: "refunded",
  },
];

const MOCK_AVAILABLE_BALANCE = 25000;

export function getWalletSummary(transactions: Transaction[]) {
  return {
    totalBalance: MOCK_AVAILABLE_BALANCE,
    pendingPayments: transactions
      .filter((t) => t.status === "pending")
      .reduce((sum, t) => sum + t.amount, 0),
    totalSpent: transactions
      .filter((t) => t.status === "paid")
      .reduce((sum, t) => sum + t.amount, 0),
  };
}
