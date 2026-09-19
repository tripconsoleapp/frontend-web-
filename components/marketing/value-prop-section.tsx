import { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { PhotoPanel } from "@/components/ui/photo-panel";
import { Badge, BadgeVariant } from "@/components/ui/badge";

interface ValuePropSectionProps {
  eyebrow?: string;
  eyebrowVariant?: BadgeVariant;
  title: string;
  description: string;
  imagePosition?: "left" | "right";
  children?: ReactNode;
}

export function ValuePropSection({
  eyebrow,
  eyebrowVariant = "mint",
  title,
  description,
  imagePosition = "right",
  children,
}: ValuePropSectionProps) {
  return (
    <section className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-6 py-16 sm:px-8 lg:grid-cols-2 lg:gap-16 lg:py-24">
      <div
        className={cn(
          "flex flex-col gap-4",
          imagePosition === "left" ? "lg:order-2" : "lg:order-1"
        )}
      >
        {eyebrow && (
          <Badge variant={eyebrowVariant} className="w-fit">
            {eyebrow}
          </Badge>
        )}
        <h2 className="font-heading text-3xl font-semibold text-navy sm:text-4xl">
          {title}
        </h2>
        <p className="font-body text-lg leading-relaxed text-text-grey">
          {description}
        </p>
        {children}
      </div>
      <PhotoPanel
        className={cn(
          "h-72 w-full sm:h-96",
          imagePosition === "left" ? "lg:order-1" : "lg:order-2"
        )}
      />
    </section>
  );
}
