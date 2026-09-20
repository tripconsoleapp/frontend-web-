"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import { Heart, MapPin } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatCurrency } from "@/lib/mock-trips";
import { GROUP_TYPE_LABELS, Template } from "@/lib/mock-templates";

export function TemplateBrowseCard({ template }: { template: Template }) {
  const [saved, setSaved] = useState(false);

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="group flex flex-col gap-3 rounded-2xl bg-white p-3 shadow-sm transition-shadow duration-300 hover:shadow-xl hover:shadow-navy/10"
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-navy/5">
        <Link
          href={`/templates/${template.id}`}
          className="absolute inset-0 z-0"
          aria-label={`View ${template.name}`}
        >
          <Image
            src={template.imageUrl}
            alt={template.name}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        </Link>
        <button
          type="button"
          onClick={() => setSaved((v) => !v)}
          aria-label={saved ? "Remove from saved" : "Save template"}
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/25 text-white opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100"
        >
          <Heart
            size={16}
            className={cn(saved && "fill-orange text-orange")}
          />
        </button>
      </div>

      <Link
        href={`/templates/${template.id}`}
        className="flex flex-col gap-1 px-1 pb-1"
      >
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-heading text-base font-semibold text-navy">
            {template.name}
          </h3>
          <span className="shrink-0 font-body text-base font-semibold text-navy">
            {formatCurrency(template.pricePerPerson)}
          </span>
        </div>
        <p className="flex items-center gap-1 font-body text-base text-text-grey">
          <MapPin size={13} /> {template.location}
        </p>
        <p className="font-body text-base text-text-grey">
          {template.durationLabel} &middot;{" "}
          {template.groupTypes.map((type) => GROUP_TYPE_LABELS[type]).join(", ")}
        </p>
      </Link>
    </motion.div>
  );
}
