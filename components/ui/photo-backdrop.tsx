import { ReactNode } from "react";
import Image from "next/image";
import { cn } from "@/lib/cn";

interface PhotoBackdropProps {
  src: string;
  alt: string;
  className?: string;
  overlayClassName?: string;
  children?: ReactNode;
  priority?: boolean;
}

/**
 * Full-bleed photo section with a dark-bottom/light-top gradient so
 * overlaid white text stays readable. Used for the homepage hero and
 * other photographic scroll sections.
 */
export function PhotoBackdrop({
  src,
  alt,
  className,
  overlayClassName,
  children,
  priority,
}: PhotoBackdropProps) {
  return (
    <section className={cn("relative isolate overflow-hidden bg-navy", className)}>
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes="100vw"
        className="object-cover"
      />
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/0",
          overlayClassName
        )}
      />
      {children}
    </section>
  );
}
