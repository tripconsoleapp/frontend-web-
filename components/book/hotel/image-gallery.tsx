"use client";

import { useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

export function ImageGallery({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  function next() {
    setActive((i) => (i + 1) % images.length);
  }
  function prev() {
    setActive((i) => (i - 1 + images.length) % images.length);
  }

  return (
    <div>
      <button type="button" onClick={() => setLightbox(true)} className="relative block h-64 w-full overflow-hidden rounded-2xl sm:h-80">
        <Image src={images[active]} alt={alt} fill priority sizes="(min-width: 1024px) 760px, 100vw" className="object-cover" />
      </button>

      {images.length > 1 && (
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {images.map((img, i) => (
            <button
              key={img + i}
              type="button"
              onClick={() => setActive(i)}
              className={cn(
                "relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition-colors",
                i === active ? "border-orange" : "border-transparent"
              )}
            >
              <Image src={img} alt="" fill sizes="96px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {lightbox && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-navy/90 p-4">
          <button type="button" onClick={() => setLightbox(false)} aria-label="Close gallery" className="absolute right-5 top-5 rounded-full bg-white/10 p-2 text-white hover:bg-white/20">
            <X size={20} />
          </button>
          {images.length > 1 && (
            <button type="button" onClick={prev} aria-label="Previous image" className="absolute left-3 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 sm:left-6">
              <ChevronLeft size={22} />
            </button>
          )}
          <div className="relative h-[70vh] w-full max-w-3xl">
            <Image src={images[active]} alt={alt} fill sizes="90vw" className="object-contain" />
          </div>
          {images.length > 1 && (
            <button type="button" onClick={next} aria-label="Next image" className="absolute right-3 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 sm:right-6">
              <ChevronRight size={22} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
