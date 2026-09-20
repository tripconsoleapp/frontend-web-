import Link from "next/link";
import { PhotoPanel } from "@/components/ui/photo-panel";

export function TemplateCard({
  href,
  title,
  description,
  priceLabel,
}: {
  href: string;
  title: string;
  description: string;
  priceLabel?: string;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col overflow-hidden rounded-xl bg-white shadow-sm"
    >
      <PhotoPanel className="h-24 w-full rounded-none" />
      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="font-heading text-base font-semibold text-navy">
          {title}
        </h3>
        <p className="line-clamp-2 font-body text-base text-text-grey">
          {description}
        </p>
        {priceLabel && (
          <p className="mt-auto pt-1 font-body text-base font-semibold text-navy">
            {priceLabel}
          </p>
        )}
      </div>
    </Link>
  );
}
