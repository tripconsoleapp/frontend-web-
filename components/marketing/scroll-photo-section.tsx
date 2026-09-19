import { PhotoBackdrop } from "@/components/ui/photo-backdrop";

export function ScrollPhotoSection() {
  return (
    <PhotoBackdrop
      src="https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=2400&q=80"
      alt="Traditional houseboat gliding through Kerala's backwaters"
      className="flex min-h-[60vh] w-full items-end"
    >
      <div className="relative z-10 mx-auto w-full max-w-2xl px-6 pb-16 text-center sm:px-8">
        <h2 className="font-heading text-3xl font-semibold text-white sm:text-4xl">
          Plan Your Escape
        </h2>
        <p className="mt-3 font-body text-lg text-white/80">
          Discover and organize your next adventure with our seamless trip
          planning tools designed for the discerning traveler.
        </p>
      </div>
    </PhotoBackdrop>
  );
}
