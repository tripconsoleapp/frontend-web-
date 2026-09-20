import Image from "next/image";

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
      <h2 className="relative z-10 max-w-2xl px-6 pb-16 font-heading text-4xl font-bold leading-tight text-white sm:px-8 sm:text-5xl">
        {headline}
      </h2>
    </section>
  );
}
