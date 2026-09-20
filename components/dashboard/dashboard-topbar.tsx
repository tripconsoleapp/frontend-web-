import Link from "next/link";
import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function DashboardTopBar({
  name,
  roleLabel,
}: {
  name: string;
  roleLabel: string;
}) {
  return (
    <div className="flex items-start justify-between">
      <div>
        <h1 className="font-heading text-2xl font-bold text-navy leading-tight">
          Good morning, {name}
        </h1>
        <Badge variant="mint" className="mt-2 w-fit">
          {roleLabel}
        </Badge>
      </div>
      <Link
        href="/notifications"
        aria-label="Notifications"
        className="text-navy hover:text-navy/70"
      >
        <Bell size={22} />
      </Link>
    </div>
  );
}
