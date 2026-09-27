import Link from "next/link";
import { ChevronRight, ClipboardList, FolderOpen, Plus, User, Wallet } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

const ACTIONS = [
  { href: "/trips", label: "Manage Trips", icon: ClipboardList },
  { href: "/wallet", label: "View Wallet", icon: Wallet },
  { href: "/documents", label: "Documents Center", icon: FolderOpen },
  { href: "/profile", label: "Manage Profile", icon: User },
];

/** Reuses the same routes as the sidebar — real shortcuts, not decoration. */
export function QuickActionsPanel() {
  return (
    <div className="rounded-2xl border border-navy/[0.06] bg-white p-6">
      <p className="font-body text-xs font-semibold uppercase tracking-wide text-orange">Quick actions</p>
      <h2 className="mt-1.5 font-heading text-lg font-bold text-navy">Make something good</h2>

      <Link href="/trips/new" className={buttonVariants({ variant: "accent", size: "md", className: "mt-4 w-full gap-1.5" })}>
        <Plus size={16} /> Create New Trip
      </Link>

      <div className="mt-2 flex flex-col divide-y divide-navy/[0.06]">
        {ACTIONS.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className="group flex items-center gap-3 py-3.5 font-body text-sm text-text-grey transition-colors hover:text-navy">
            <Icon size={16} />
            <span className="flex-1">{label}</span>
            <ChevronRight size={14} className="text-navy/30 transition-transform group-hover:translate-x-0.5 group-hover:text-orange" />
          </Link>
        ))}
      </div>
    </div>
  );
}
