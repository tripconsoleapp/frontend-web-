import Image from "next/image";
import { MapPin } from "lucide-react";

export function SectionBreak({
  imageUrl,
  alt,
  headline,
}: {
  imageUrl: string;
  alt: string;
  headline: string;
}) {
  return (
    <section className="relative isolate flex h-[60vh] min-h-[420px] items-end overflow-hidden">
      <Image
        src={imageUrl}
        alt={alt}
        fill
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />

      <div className="absolute left-6 top-8 z-10 flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-lg sm:left-8">
        <MapPin size={14} className="text-orange" />
        <span className="font-body text-sm font-semibold text-navy">
          Kerala, India
        </span>
      </div>

      <h2 className="relative z-10 max-w-2xl px-6 pb-16 text-[clamp(1.9rem,4.2vw,3.2rem)] font-heading font-bold leading-[1.02] text-white sm:px-8">
        {headline}
      </h2>
    </section>
  );
}
