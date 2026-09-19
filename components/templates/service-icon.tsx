import {
  BedDouble,
  Bus,
  Droplet,
  HeartPulse,
  LifeBuoy,
  LucideIcon,
  ShieldCheck,
  Ticket,
  UserCheck,
  Utensils,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  Transport: Bus,
  Meals: Utensils,
  Stay: BedDouble,
  Water: Droplet,
  Support: LifeBuoy,
  "First Aid": HeartPulse,
  Guide: UserCheck,
  "Entry Tickets": Ticket,
  "Safety Supervision": ShieldCheck,
};

export function ServiceIcon({ service }: { service: string }) {
  const Icon = ICON_MAP[service] ?? ShieldCheck;
  return <Icon size={16} className="shrink-0 text-navy" />;
}
