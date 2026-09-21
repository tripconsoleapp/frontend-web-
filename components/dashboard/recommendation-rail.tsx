import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { formatCurrency } from "@/lib/mock-trips";
import { Template } from "@/lib/mock-templates";

export function RecommendationRail({ templates }: { templates: Template[] }) {
  if (templates.length === 0) return null;

  return (
    <div>
      <h2 className="font-heading text-2xl font-semibold text-navy">
        Recommended for You
      </h2>
      <p className="mt-1 font-body text-base text-text-grey">
        Ready-made itineraries worth a look.
      </p>
      <div className="mt-5 flex snap-x gap-5 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {templates.map((template) => (
          <Link
            key={template.id}
            href={`/templates/${template.id}`}
            className="group relative flex h-64 w-[260px] shrink-0 snap-start flex-col justify-end overflow-hidden rounded-2xl sm:w-[300px]"
          >
            <Image
              src={template.imageUrl}
              alt={template.name}
              fill
              sizes="300px"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy/85 via-navy/25 to-transparent" />
            <div className="relative z-10 p-5 text-white">
              <p className="font-heading text-lg font-semibold leading-tight">
                {template.name}
              </p>
              <p className="mt-1 line-clamp-2 font-body text-sm text-white/80">
                {template.about}
              </p>
              <div className="mt-3 flex items-center justify-between">
                <span className="font-body text-sm font-semibold">
                  {formatCurrency(template.pricePerPerson)}/person
                </span>
                <span className="flex items-center gap-1 font-body text-sm font-medium">
                  View
                  <ArrowRight
                    size={14}
                    className="transition-transform duration-200 group-hover:translate-x-1"
                  />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
