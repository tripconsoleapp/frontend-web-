export const MOCK_USER = {
  fullName: "Rahul Menon",
  email: "rahul@school.edu",
  mobile: "+91 98765 43210",
  city: "Mumbai",
  institution: "Indian Institute of Tech",
  role: "Organizer",
};

export function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
