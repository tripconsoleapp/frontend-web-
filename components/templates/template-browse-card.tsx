import Link from "next/link";
import { MapPin } from "lucide-react";
import { PhotoPanel } from "@/components/ui/photo-panel";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { formatCurrency } from "@/lib/mock-trips";
import {
  DESTINATION_TYPE_LABELS,
  GROUP_TYPE_LABELS,
  Template,
} from "@/lib/mock-templates";

export function TemplateBrowseCard({ template }: { template: Template }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-navy/10 bg-white">
      <PhotoPanel className="h-36 w-full rounded-none" />
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex flex-wrap gap-1.5">
          {template.destinationTypes.map((type) => (
            <Badge key={type} variant="mint" className="text-[10px]">
              {DESTINATION_TYPE_LABELS[type]}
            </Badge>
          ))}
          {template.groupTypes.map((type) => (
            <Badge key={type} variant="navy-outline" className="text-[10px]">
              {GROUP_TYPE_LABELS[type]}
            </Badge>
          ))}
        </div>

        <h3 className="font-heading text-base font-semibold text-navy">
          {template.name}
        </h3>
        <p className="flex items-center gap-1 font-body text-xs text-text-grey">
          <MapPin size={12} /> {template.location}
        </p>

        <div className="mt-auto flex items-end justify-between pt-3">
          <div>
            <p className="font-body text-[10px] uppercase tracking-wide text-text-grey">
              {template.durationLabel}
            </p>
            <p className="font-heading text-sm font-bold text-navy">
              {formatCurrency(template.pricePerPerson)}
            </p>
          </div>
          <Link
            href={`/templates/${template.id}`}
            className={buttonVariants({ variant: "accent", size: "sm" })}
          >
            View Template
          </Link>
        </div>
      </div>
    </div>
  );
}
